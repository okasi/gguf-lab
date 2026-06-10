#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MACOS_DIR="${MACOS_DIR:-$REPO_ROOT/macos-m1-pro}"
cd "$MACOS_DIR"

OUT_DIR="${OUT_DIR:-results/benchloop/gemma4-harness-optimized/final}"
SERVER_BIN="${SERVER_BIN:-llama.cpp/build/bin/llama-server}"
POLICY="${POLICY:-$REPO_ROOT/configs/gemma4_qat_q4_optimized_policy.json}"
PROXY_BIN="${PROXY_BIN:-$REPO_ROOT/gemma4_benchloop_harness_fastify/proxy.mjs}"
UPSTREAM_PORT="${UPSTREAM_PORT:-8091}"
PROXY_PORT="${PROXY_PORT:-8092}"
HOST="127.0.0.1"
UPSTREAM_ENDPOINT="http://${HOST}:${UPSTREAM_PORT}"
PROXY_ENDPOINT="http://${HOST}:${PROXY_PORT}"
SUITES="${SUITES:-agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall}"

mkdir -p "$OUT_DIR/run-json"

MODELS=(
  "gemma-4-E2B-it-qat-UD-Q4_K_XL|models/gemma-4-E2B-it-qat-GGUF/gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf"
  "gemma-4-E4B-it-qat-UD-Q4_K_XL|models/gemma-4-E4B-it-qat-GGUF/gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf"
)
if [[ -n "${MODEL_FILTER:-}" ]]; then
  FILTERED_MODELS=()
  for entry in "${MODELS[@]}"; do
    IFS="|" read -r model_id _ <<< "$entry"
    if [[ ",${MODEL_FILTER}," == *",${model_id},"* ]]; then
      FILTERED_MODELS+=("$entry")
    fi
  done
  MODELS=("${FILTERED_MODELS[@]}")
  if [[ "${#MODELS[@]}" -eq 0 ]]; then
    echo "MODEL_FILTER did not match any known model: ${MODEL_FILTER}" >&2
    exit 1
  fi
fi

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
    sleep 1
  done
  echo "Timed out waiting for ${label} at ${url}" >&2
  return 1
}

trap cleanup EXIT

if lsof -nP -iTCP:"$UPSTREAM_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Upstream port ${UPSTREAM_PORT} is already in use." >&2
  exit 1
fi
if lsof -nP -iTCP:"$PROXY_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Proxy port ${PROXY_PORT} is already in use." >&2
  exit 1
fi

for entry in "${MODELS[@]}"; do
  IFS="|" read -r model_id model_path <<< "$entry"
  alias="${model_id}-gemma4-harness-optimized"
  bench_log="${OUT_DIR}/${alias}.benchloop.log"
  server_log="${OUT_DIR}/${alias}.llama-server.log"
  proxy_log="${OUT_DIR}/${alias}.proxy.log"
  proxy_jsonl="${OUT_DIR}/${alias}.proxy.jsonl"
  run_json="${OUT_DIR}/run-json/${alias}.run.json"

  if [[ ! -f "$model_path" ]]; then
    echo "Missing model: ${model_path} (set paths relative to ${MACOS_DIR} or override SERVER_BIN/model paths)" >&2
    exit 1
  fi

  echo "Starting llama-server for ${alias}"
  "$SERVER_BIN" \
    -m "$model_path" \
    -a "$alias" \
    --host "$HOST" --port "$UPSTREAM_PORT" \
    -ngl all -c 4096 -np 1 --jinja --reasoning off \
    --temp 1 --top-p 0.95 --top-k 64 -n 256 \
    --log-file "$server_log" \
    > "${OUT_DIR}/${alias}.llama-server.stdout.log" 2>&1 &
  SERVER_PID=$!
  wait_for_health "${UPSTREAM_ENDPOINT}/health" "llama-server"

  echo "Starting Gemma Fastify harness proxy for ${alias}"
  node "$PROXY_BIN" \
    --host "$HOST" --port "$PROXY_PORT" \
    --upstream "$UPSTREAM_ENDPOINT" \
    --policy "$POLICY" \
    --log-jsonl "$proxy_jsonl" \
    > "$proxy_log" 2>&1 &
  PROXY_PID=$!
  wait_for_health "${PROXY_ENDPOINT}/health" "harness proxy"

  echo "Running BenchLoop for ${alias}"
  BENCHLOOP_NO_SUBMIT=1 benchloop run \
    --model "$alias" \
    --endpoint "$PROXY_ENDPOINT" \
    --provider openai_compat \
    --harness raw \
    --suites "$SUITES" \
    --hardware "Apple M1 Pro 32GB unified memory" \
    --gpu "Apple M1 Pro" \
    --gpu-memory-gb 25.0 \
    > "$bench_log" 2>&1

  node "$MACOS_DIR/scripts/copy_latest_benchloop_run.mjs" "$alias" "$bench_log" "$run_json" >/dev/null
  node "$MACOS_DIR/scripts/analyze_gemma4_run.mjs" "$run_json" \
    --json-out "${OUT_DIR}/${alias}.analysis.json" \
    --md-out "${OUT_DIR}/${alias}.analysis.md" \
    > "${OUT_DIR}/${alias}.analysis.stdout.json"

  cleanup
  SERVER_PID=""
  PROXY_PID=""
  echo "Completed ${alias}"
done
