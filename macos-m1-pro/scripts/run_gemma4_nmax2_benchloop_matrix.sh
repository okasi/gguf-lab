#!/usr/bin/env bash
# Gemma 4 E2B / E4B / 12B BenchLoop matrix: raw llama-server vs merged proxy harness.
# 12B uses Unsloth MTP nmax2; E2B/E4B use promoted sampler (no local MTP draft).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MACOS_DIR="${MACOS_DIR:-$REPO_ROOT/macos-m1-pro}"
CODEX_ROOT="${CODEX_ROOT:-/Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4}"
cd "$MACOS_DIR"

SERVER_BIN="${SERVER_BIN:-$CODEX_ROOT/llama.cpp/build/bin/llama-server}"
HARNESS_DIR="${HARNESS_DIR:-$REPO_ROOT/proxy-lan-server}"
POLICY="${POLICY:-$HARNESS_DIR/gemma_qwen_merged_policy.json}"
PROXY_BIN="${PROXY_BIN:-$HARNESS_DIR/proxy.mjs}"
UPSTREAM_PORT="${UPSTREAM_PORT:-8091}"
PROXY_PORT="${PROXY_PORT:-8092}"
HOST="127.0.0.1"
UPSTREAM_ENDPOINT="http://${HOST}:${UPSTREAM_PORT}"
PROXY_ENDPOINT="http://${HOST}:${PROXY_PORT}"
SUITES="${SUITES:-agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall}"
SPEC_DRAFT_N_MAX="${SPEC_DRAFT_N_MAX:-2}"
REASONING="${REASONING:-off}"
CACHE_TYPE_K="${CACHE_TYPE_K:-}"
CACHE_TYPE_V="${CACHE_TYPE_V:-}"
CACHE_TYPE_K_DRAFT="${CACHE_TYPE_K_DRAFT:-}"
CACHE_TYPE_V_DRAFT="${CACHE_TYPE_V_DRAFT:-}"
ALIAS_TAG="${ALIAS_TAG:-}"
MODE="${MODE:-all}" # raw | harness | all
NO_CAP="${NO_CAP:-0}" # 1 = full 32GB machine budget, no 16GB inference cap label
OUT_DIR="${OUT_DIR:-results/benchloop/gemma4-nmax2-matrix-$(date -u +%Y%m%dT%H%M%SZ)}"

if [[ "$NO_CAP" == "1" ]]; then
  CTX_SIZE="${CTX_SIZE:-0}"
  FIT_TARGET_MIB="${FIT_TARGET_MIB:-28672}"
  MEMORY_GB="${MEMORY_GB:-25.0}"
  HARDWARE_LABEL="Apple M1 Pro 32GB unified memory"
else
  CTX_SIZE="${CTX_SIZE:-0}"
  FIT_TARGET_MIB="${FIT_TARGET_MIB:-16384}"
  MEMORY_GB="${MEMORY_GB:-16.0}"
  HARDWARE_LABEL="Apple M1 Pro 32GB unified memory (${MEMORY_GB}GB inference cap)"
fi

MODEL_12B_TARGET="$CODEX_ROOT/models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf"
MODEL_12B_DRAFT="$CODEX_ROOT/models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf"
MODEL_26B_TARGET="$CODEX_ROOT/models/gemma-4-26B-A4B-it-qat-GGUF/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf"
MODEL_26B_DRAFT="$CODEX_ROOT/models/gemma-4-26B-A4B-it-qat-GGUF/MTP/gemma-4-26B-A4B-it-Q8_0-MTP.gguf"

declare -a MODELS=(
  "gemma-4-E2B-it-qat-UD-Q4_K_XL|$CODEX_ROOT/models/gemma-4-E2B-it-qat-GGUF/gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf|0|"
  "gemma-4-E4B-it-qat-UD-Q4_K_XL|$CODEX_ROOT/models/gemma-4-E4B-it-qat-GGUF/gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf|0|"
  "gemma-4-12B-it-qat-UD-Q4_K_XL|$MODEL_12B_TARGET|1|$MODEL_12B_DRAFT"
  "gemma-4-26B-A4B-it-qat-UD-Q4_K_XL|$MODEL_26B_TARGET|1|$MODEL_26B_DRAFT"
)

if [[ -n "${MODEL_FILTER:-}" ]]; then
  FILTERED_MODELS=()
  for entry in "${MODELS[@]}"; do
    IFS="|" read -r model_id _ _ _ <<< "$entry"
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

KV_ARGS=()
if [[ -n "$CACHE_TYPE_K" ]]; then KV_ARGS+=(--cache-type-k "$CACHE_TYPE_K"); fi
if [[ -n "$CACHE_TYPE_V" ]]; then KV_ARGS+=(--cache-type-v "$CACHE_TYPE_V"); fi
if [[ -n "$CACHE_TYPE_K_DRAFT" ]]; then KV_ARGS+=(--spec-draft-type-k "$CACHE_TYPE_K_DRAFT"); fi
if [[ -n "$CACHE_TYPE_V_DRAFT" ]]; then KV_ARGS+=(--spec-draft-type-v "$CACHE_TYPE_V_DRAFT"); fi

mkdir -p "$OUT_DIR/run-json"
RUN_MANIFEST="$OUT_DIR/run-manifest.jsonl"
touch "$RUN_MANIFEST"

cleanup() {
  if [[ -n "${PROXY_PID:-}" ]] && kill -0 "$PROXY_PID" 2>/dev/null; then
    kill "$PROXY_PID" 2>/dev/null || true
    wait "$PROXY_PID" 2>/dev/null || true
  fi
  PROXY_PID=""
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  SERVER_PID=""
}

wait_for_health() {
  local url="$1"
  local label="$2"
  local server_log="$3"
  for _ in $(seq 1 240); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    if [[ -n "${SERVER_PID:-}" ]] && ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "llama-server exited while starting ${label}. See ${server_log}" >&2
      return 1
    fi
    sleep 1
  done
  echo "Timed out waiting for ${label} at ${url}" >&2
  return 1
}

ensure_ports_free() {
  if lsof -nP -iTCP:"$UPSTREAM_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Upstream port ${UPSTREAM_PORT} is already in use." >&2
    exit 1
  fi
  if lsof -nP -iTCP:"$PROXY_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Proxy port ${PROXY_PORT} is already in use." >&2
    exit 1
  fi
}

start_server() {
  local alias="$1"
  local model_path="$2"
  local use_mtp="$3"
  local draft_path="$4"
  local server_log="$5"
  local server_stdout="$6"

  local -a server_args=(
    -m "$model_path"
    -a "$alias"
    --host "$HOST" --port "$UPSTREAM_PORT"
    -c "$CTX_SIZE"
    --fit on --fit-target "$FIT_TARGET_MIB"
    -ngl 999 -fa on
    -np 1 --jinja --reasoning "$REASONING"
    --temp 1 --top-p 0.95 --top-k 64 -n 256
    --log-file "$server_log"
  )

  if [[ "$use_mtp" == "1" ]]; then
    server_args+=(--model-draft "$draft_path" -ngld 999 --spec-type draft-mtp --spec-draft-n-max "$SPEC_DRAFT_N_MAX")
  fi
  if [[ ${#KV_ARGS[@]} -gt 0 ]]; then
    server_args+=("${KV_ARGS[@]}")
  fi

  "$SERVER_BIN" "${server_args[@]}" > "$server_stdout" 2>&1 &
  SERVER_PID=$!
  wait_for_health "${UPSTREAM_ENDPOINT}/health" "llama-server" "$server_log"
}

run_benchloop() {
  local alias="$1"
  local endpoint="$2"
  local harness_flag="$3"
  local bench_log="$4"
  local -a bench_args=(
    --model "$alias"
    --endpoint "$endpoint"
    --provider openai_compat
    --suites "$SUITES"
    --hardware "$HARDWARE_LABEL"
    --gpu "Apple M1 Pro"
    --gpu-memory-gb "$MEMORY_GB"
  )
  if [[ -n "$harness_flag" ]]; then
    bench_args+=(--harness raw)
  fi
  BENCHLOOP_NO_SUBMIT=1 benchloop run "${bench_args[@]}" > "$bench_log" 2>&1
}

for required in "$SERVER_BIN" "$POLICY" "$PROXY_BIN"; do
  if [[ ! -f "$required" ]]; then
    echo "Missing required file: $required" >&2
    exit 1
  fi
done

if [[ ! -d "$HARNESS_DIR/node_modules" ]]; then
  echo "Missing harness dependencies. Run: (cd \"$HARNESS_DIR\" && npm install)" >&2
  exit 1
fi

trap cleanup EXIT

{
  echo "=== Gemma 4 nmax2 BenchLoop matrix ==="
  echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Mode: ${MODE}"
  echo "No cap: ${NO_CAP}"
  echo "KV: k=${CACHE_TYPE_K:-f16} v=${CACHE_TYPE_V:-f16} draft_k=${CACHE_TYPE_K_DRAFT:-f16} draft_v=${CACHE_TYPE_V_DRAFT:-f16}"
  echo "Out: ${OUT_DIR}"
  echo "Server: ${SERVER_BIN}"
} | tee "$OUT_DIR/matrix.log"

for entry in "${MODELS[@]}"; do
  IFS="|" read -r model_id model_path use_mtp draft_path <<< "$entry"

  if [[ ! -f "$model_path" ]]; then
    echo "Missing model: ${model_path}" >&2
    exit 1
  fi
  if [[ "$use_mtp" == "1" && ! -f "$draft_path" ]]; then
    echo "Missing MTP draft: ${draft_path}" >&2
    exit 1
  fi

  if [[ "$MODE" == "all" || "$MODE" == "raw" ]]; then
    ensure_ports_free
    raw_alias="${model_id}-nmax2${ALIAS_TAG}-raw"
    bench_log="${OUT_DIR}/${raw_alias}.benchloop.log"
    server_log="${OUT_DIR}/${raw_alias}.llama-server.log"
    server_stdout="${OUT_DIR}/${raw_alias}.llama-server.stdout.log"
    run_json="${OUT_DIR}/run-json/${raw_alias}.run.json"

    echo "=== RAW ${raw_alias} ===" | tee -a "$OUT_DIR/matrix.log"
    start_server "$raw_alias" "$model_path" "$use_mtp" "$draft_path" "$server_log" "$server_stdout"
    run_benchloop "$raw_alias" "$UPSTREAM_ENDPOINT" "raw" "$bench_log"
    node "$MACOS_DIR/scripts/copy_latest_benchloop_run.mjs" "$raw_alias" "$bench_log" "$run_json" >/dev/null || true
    node "$MACOS_DIR/scripts/analyze_gemma4_run.mjs" "$run_json" \
      --json-out "${OUT_DIR}/${raw_alias}.analysis.json" \
      --md-out "${OUT_DIR}/${raw_alias}.analysis.md" \
      > "${OUT_DIR}/${raw_alias}.analysis.stdout.json" 2>/dev/null || true
    printf '{"mode":"raw","model":"%s","alias":"%s","run_json":"%s"}\n' "$model_id" "$raw_alias" "$run_json" >> "$RUN_MANIFEST"
    cleanup
  fi

  if [[ "$MODE" == "all" || "$MODE" == "harness" ]]; then
    ensure_ports_free
    harness_alias="${model_id}${ALIAS_TAG}-gemma4_harness"
    bench_log="${OUT_DIR}/${harness_alias}.benchloop.log"
    server_log="${OUT_DIR}/${harness_alias}.llama-server.log"
    server_stdout="${OUT_DIR}/${harness_alias}.llama-server.stdout.log"
    proxy_log="${OUT_DIR}/${harness_alias}.proxy.log"
    proxy_jsonl="${OUT_DIR}/${harness_alias}.proxy.jsonl"
    run_json="${OUT_DIR}/run-json/${harness_alias}.run.json"

    echo "=== HARNESS ${harness_alias} ===" | tee -a "$OUT_DIR/matrix.log"
    start_server "$harness_alias" "$model_path" "$use_mtp" "$draft_path" "$server_log" "$server_stdout"

    node "$PROXY_BIN" \
      --host "$HOST" --port "$PROXY_PORT" \
      --upstream "$UPSTREAM_ENDPOINT" \
      --policy "$POLICY" \
      --log-jsonl "$proxy_jsonl" \
      > "$proxy_log" 2>&1 &
    PROXY_PID=$!
    wait_for_health "${PROXY_ENDPOINT}/health" "harness proxy" "$proxy_log"

    run_benchloop "$harness_alias" "$PROXY_ENDPOINT" "raw" "$bench_log"
    node "$MACOS_DIR/scripts/copy_latest_benchloop_run.mjs" "$harness_alias" "$bench_log" "$run_json" >/dev/null || true
    node "$MACOS_DIR/scripts/analyze_gemma4_run.mjs" "$run_json" \
      --json-out "${OUT_DIR}/${harness_alias}.analysis.json" \
      --md-out "${OUT_DIR}/${harness_alias}.analysis.md" \
      > "${OUT_DIR}/${harness_alias}.analysis.stdout.json" 2>/dev/null || true
    printf '{"mode":"harness","model":"%s","alias":"%s","run_json":"%s"}\n' "$model_id" "$harness_alias" "$run_json" >> "$RUN_MANIFEST"
    cleanup
  fi
done

echo "Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a "$OUT_DIR/matrix.log"
