#!/usr/bin/env bash
# Gemma 4 12B QAT + Unsloth MTP nmax2 through the optimized Fastify BenchLoop harness.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MACOS_DIR="${MACOS_DIR:-$REPO_ROOT/macos-m1-pro}"
CODEX_ROOT="${CODEX_ROOT:-$MACOS_DIR}"
cd "$MACOS_DIR"

OUT_DIR="${OUT_DIR:-results/benchloop/gemma4-12b-fastify-harness-nmax2}"
SERVER_BIN="${SERVER_BIN:-$CODEX_ROOT/llama.cpp/build/bin/llama-server}"
TARGET_MODEL="${TARGET_MODEL:-$CODEX_ROOT/models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf}"
DRAFT_MODEL="${DRAFT_MODEL:-$CODEX_ROOT/models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf}"
POLICY="${POLICY:-$REPO_ROOT/gemma4_benchloop_harness_fastify/configs/gemma4_qat_q4_optimized_policy.json}"
HARNESS_DIR="${HARNESS_DIR:-$REPO_ROOT/gemma4_benchloop_harness_fastify}"
PROXY_BIN="${PROXY_BIN:-$HARNESS_DIR/proxy.mjs}"
UPSTREAM_PORT="${UPSTREAM_PORT:-8091}"
PROXY_PORT="${PROXY_PORT:-8092}"
HOST="127.0.0.1"
UPSTREAM_ENDPOINT="http://${HOST}:${UPSTREAM_PORT}"
PROXY_ENDPOINT="http://${HOST}:${PROXY_PORT}"
SUITES="${SUITES:-agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall}"
CTX_SIZE="${CTX_SIZE:-0}"
FIT_TARGET_MIB="${FIT_TARGET_MIB:-16384}"
MEMORY_GB="${MEMORY_GB:-16.0}"
SPEC_DRAFT_N_MAX="${SPEC_DRAFT_N_MAX:-2}"
REASONING="${REASONING:-off}"
ALIAS="${ALIAS:-gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized}"

if [[ ! -d "$HARNESS_DIR/node_modules" ]]; then
  echo "Missing harness dependencies. Run: (cd \"$HARNESS_DIR\" && npm install)" >&2
  exit 1
fi

mkdir -p "$OUT_DIR/run-json"

bench_log="${OUT_DIR}/${ALIAS}.benchloop.log"
server_log="${OUT_DIR}/${ALIAS}.llama-server.log"
proxy_log="${OUT_DIR}/${ALIAS}.proxy.log"
proxy_jsonl="${OUT_DIR}/${ALIAS}.proxy.jsonl"
run_json="${OUT_DIR}/run-json/${ALIAS}.run.json"

cleanup() {
  if [[ -n "${PROXY_PID:-}" ]] && kill -0 "$PROXY_PID" 2>/dev/null; then
    kill "$PROXY_PID" 2>/dev/null || true
    wait "$PROXY_PID" 2>/dev/null || true
  fi
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

wait_for_health() {
  local url="$1"
  local label="$2"
  for _ in $(seq 1 180); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    if [[ -n "${SERVER_PID:-}" ]] && ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "llama-server exited while starting. See ${server_log}" >&2
      return 1
    fi
    sleep 1
  done
  echo "Timed out waiting for ${label} at ${url}" >&2
  return 1
}

trap cleanup EXIT

for f in "$SERVER_BIN" "$TARGET_MODEL" "$DRAFT_MODEL" "$POLICY" "$PROXY_BIN"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing required file: $f" >&2
    exit 1
  fi
done

if lsof -nP -iTCP:"$UPSTREAM_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Upstream port ${UPSTREAM_PORT} is already in use." >&2
  exit 1
fi
if lsof -nP -iTCP:"$PROXY_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Proxy port ${PROXY_PORT} is already in use." >&2
  exit 1
fi

{
  echo "=== Gemma 4 12B Unsloth MTP nmax2 + Fastify harness ==="
  echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Target: ${TARGET_MODEL}"
  echo "Draft:  ${DRAFT_MODEL}"
  echo "Policy: ${POLICY}"
} | tee "${OUT_DIR}/run.log"

echo "Starting llama-server (MTP n-max=${SPEC_DRAFT_N_MAX}, reasoning=${REASONING})"
"$SERVER_BIN" \
  -m "$TARGET_MODEL" \
  --model-draft "$DRAFT_MODEL" \
  -a "$ALIAS" \
  --host "$HOST" --port "$UPSTREAM_PORT" \
  -c "$CTX_SIZE" \
  --fit on --fit-target "$FIT_TARGET_MIB" \
  -ngl 999 -ngld 999 -fa on \
  -np 1 --jinja --reasoning "$REASONING" \
  --temp 1 --top-p 0.95 --top-k 64 -n 256 \
  --spec-type draft-mtp --spec-draft-n-max "$SPEC_DRAFT_N_MAX" \
  --log-file "$server_log" \
  > "${OUT_DIR}/${ALIAS}.llama-server.stdout.log" 2>&1 &
SERVER_PID=$!
wait_for_health "${UPSTREAM_ENDPOINT}/health" "llama-server"

echo "Starting Gemma Fastify harness proxy"
node "$PROXY_BIN" \
  --host "$HOST" --port "$PROXY_PORT" \
  --upstream "$UPSTREAM_ENDPOINT" \
  --policy "$POLICY" \
  --log-jsonl "$proxy_jsonl" \
  > "$proxy_log" 2>&1 &
PROXY_PID=$!
wait_for_health "${PROXY_ENDPOINT}/health" "harness proxy"

echo "Running BenchLoop for ${ALIAS}"
BENCHLOOP_NO_SUBMIT=1 benchloop run \
  --model "$ALIAS" \
  --endpoint "$PROXY_ENDPOINT" \
  --provider openai_compat \
  --harness raw \
  --suites "$SUITES" \
  --hardware "Apple M1 Pro 32GB unified memory (${MEMORY_GB}GB inference cap)" \
  --gpu "Apple M1 Pro" \
  --gpu-memory-gb "$MEMORY_GB" \
  > "$bench_log" 2>&1

node "$MACOS_DIR/scripts/copy_latest_benchloop_run.mjs" "$ALIAS" "$bench_log" "$run_json" >/dev/null
node "$MACOS_DIR/scripts/analyze_gemma4_run.mjs" "$run_json" \
  --json-out "${OUT_DIR}/${ALIAS}.analysis.json" \
  --md-out "${OUT_DIR}/${ALIAS}.analysis.md" \
  > "${OUT_DIR}/${ALIAS}.analysis.stdout.json"

echo "Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a "${OUT_DIR}/run.log"
echo "Completed ${ALIAS}"
