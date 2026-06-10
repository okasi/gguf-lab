#!/usr/bin/env bash
# Gemma 4 12B QAT + Unsloth MTP BenchLoop on Metal
# Official setup per:
#   https://huggingface.co/unsloth/gemma-4-12b-it-qat-GGUF/blob/main/MTP/README.md
#   https://github.com/ggml-org/llama.cpp/pull/23398
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="${OUT_DIR:-results/benchloop/gemma4-12b-qat-unsloth-mtp-metal-temp1-top_p095-top_k64}"
SERVER_BIN="llama.cpp/build/bin/llama-server"
TARGET_MODEL="models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf"
DRAFT_MODEL="models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf"
ALIAS="gemma-4-12B-it-qat-UD-Q4_K_XL"
PORT="${PORT:-8093}"
HOST="127.0.0.1"
ENDPOINT="http://${HOST}:${PORT}"
SUITES="${SUITES:-agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall}"
CTX_SIZE="${CTX_SIZE:-0}"
FIT_TARGET_MIB="${FIT_TARGET_MIB:-16384}"
MEMORY_GB="${MEMORY_GB:-16.0}"
SPEC_DRAFT_N_MAX="${SPEC_DRAFT_N_MAX:-4}"
REASONING="${REASONING:-off}"
CACHE_TYPE_K="${CACHE_TYPE_K:-}"
CACHE_TYPE_V="${CACHE_TYPE_V:-}"
CACHE_TYPE_K_DRAFT="${CACHE_TYPE_K_DRAFT:-}"
CACHE_TYPE_V_DRAFT="${CACHE_TYPE_V_DRAFT:-}"

KV_ARGS=()
if [[ -n "$CACHE_TYPE_K" ]]; then KV_ARGS+=(--cache-type-k "$CACHE_TYPE_K"); fi
if [[ -n "$CACHE_TYPE_V" ]]; then KV_ARGS+=(--cache-type-v "$CACHE_TYPE_V"); fi
if [[ -n "$CACHE_TYPE_K_DRAFT" ]]; then KV_ARGS+=(--spec-draft-type-k "$CACHE_TYPE_K_DRAFT"); fi
if [[ -n "$CACHE_TYPE_V_DRAFT" ]]; then KV_ARGS+=(--spec-draft-type-v "$CACHE_TYPE_V_DRAFT"); fi

mkdir -p "$OUT_DIR"

cleanup_server() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  SERVER_PID=""
}

wait_for_server() {
  local server_log="$1"
  for _ in $(seq 1 180); do
    if curl -fsS "${ENDPOINT}/health" >/dev/null 2>&1; then
      return 0
    fi
    if [[ -n "${SERVER_PID:-}" ]] && ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "llama-server exited while starting. See ${server_log}" >&2
      return 1
    fi
    sleep 1
  done
  echo "Timed out waiting for ${ENDPOINT}. See ${server_log}" >&2
  return 1
}

trap cleanup_server EXIT

for f in "$SERVER_BIN" "$TARGET_MODEL" "$DRAFT_MODEL"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing required file: $f" >&2
    exit 1
  fi
done

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port ${PORT} is already in use. Stop that process or set PORT." >&2
  exit 1
fi

bench_log="${OUT_DIR}/${ALIAS}.all.benchloop.log"
server_log="${OUT_DIR}/${ALIAS}.server.log"
server_stdout="${OUT_DIR}/${ALIAS}.server.stdout.log"

if [[ -f "$bench_log" ]] && rg -q "BenchLoop Results|Overall Score|OVERALL|Run saved" "$bench_log"; then
  echo "Skipping; existing BenchLoop log found at ${bench_log}"
  exit 0
fi

echo "llama.cpp: $(cd llama.cpp && git rev-parse --short HEAD)"
echo "Target: ${TARGET_MODEL}"
echo "Draft:  ${DRAFT_MODEL}"
kv_note=""
[[ ${#KV_ARGS[@]} -gt 0 ]] && kv_note=" kv=${CACHE_TYPE_K:-?}/${CACHE_TYPE_V:-?} draft_kv=${CACHE_TYPE_K_DRAFT:-?}/${CACHE_TYPE_V_DRAFT:-?}"
echo "Starting llama-server: -c ${CTX_SIZE} --fit on --fit-target ${FIT_TARGET_MIB} -ngl 999 -fa on draft-mtp n-max=${SPEC_DRAFT_N_MAX} reasoning=${REASONING}${kv_note}"

"$SERVER_BIN" \
  -m "$TARGET_MODEL" \
  --model-draft "$DRAFT_MODEL" \
  -a "$ALIAS" \
  --host "$HOST" --port "$PORT" \
  -c "$CTX_SIZE" \
  --fit on --fit-target "$FIT_TARGET_MIB" \
  -ngl 999 -ngld 999 -fa on \
  -np 1 --jinja --reasoning "$REASONING" \
  --temp 1 --top-p 0.95 --top-k 64 -n 256 \
  --spec-type draft-mtp --spec-draft-n-max "$SPEC_DRAFT_N_MAX" \
  "${KV_ARGS[@]}" \
  --log-file "$server_log" \
  > "$server_stdout" 2>&1 &
SERVER_PID=$!

wait_for_server "$server_log"

echo "Running BenchLoop for ${ALIAS}"
BENCHLOOP_NO_SUBMIT=1 benchloop run \
  --model "$ALIAS" \
  --endpoint "$ENDPOINT" \
  --provider openai_compat \
  --suites "$SUITES" \
  --hardware "Apple M1 Pro 32GB unified memory (${MEMORY_GB}GB inference cap)" \
  --gpu "Apple M1 Pro" \
  --gpu-memory-gb "$MEMORY_GB" \
  > "$bench_log" 2>&1

cleanup_server
echo "Completed ${ALIAS}"
