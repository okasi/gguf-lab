#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64"
SERVER_BIN="llama.cpp/build/bin/llama-server"
PORT="${PORT:-8091}"
HOST="127.0.0.1"
ENDPOINT="http://${HOST}:${PORT}"
SUITES="agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall"

mkdir -p "$OUT_DIR"

MODELS=(
  "gemma-4-E2B-it-qat-UD-Q4_K_XL|models/gemma-4-E2B-it-qat-GGUF/gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf|all"
  "gemma-4-E4B-it-qat-UD-Q4_K_XL|models/gemma-4-E4B-it-qat-GGUF/gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf|all"
  "gemma-4-12B-it-qat-UD-Q4_K_XL|models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf|all"
)

cleanup_server() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  SERVER_PID=""
}

wait_for_server() {
  local server_log="$1"
  for _ in $(seq 1 120); do
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

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port ${PORT} is already in use. Stop that process or set PORT." >&2
  exit 1
fi

for entry in "${MODELS[@]}"; do
  IFS="|" read -r alias model_path ngl <<< "$entry"
  bench_log="${OUT_DIR}/${alias}.all.benchloop.log"
  server_log="${OUT_DIR}/${alias}.server.log"

  if [[ ! -f "$model_path" ]]; then
    echo "Missing model: ${model_path}" >&2
    exit 1
  fi

  if [[ -f "$bench_log" ]] && rg -q "BenchLoop Results|Overall Score|quality_score|Run saved" "$bench_log"; then
    echo "Skipping ${alias}; existing BenchLoop log found at ${bench_log}"
    continue
  fi

  echo "Starting llama-server for ${alias} (-ngl ${ngl})"
  "$SERVER_BIN" \
    -m "$model_path" \
    -a "$alias" \
    --host "$HOST" --port "$PORT" \
    -ngl "$ngl" -c 4096 -np 1 --jinja --reasoning off \
    --temp 1 --top-p 0.95 --top-k 64 -n 256 \
    --log-file "$server_log" \
    > "${OUT_DIR}/${alias}.server.stdout.log" 2>&1 &
  SERVER_PID=$!

  wait_for_server "$server_log"

  echo "Running BenchLoop for ${alias}"
  BENCHLOOP_NO_SUBMIT=1 benchloop run \
    --model "$alias" \
    --endpoint "$ENDPOINT" \
    --provider openai_compat \
    --suites "$SUITES" \
    --hardware "Apple M1 Pro 32GB unified memory" \
    --gpu "Apple M1 Pro" \
    --gpu-memory-gb 25.0 \
    > "$bench_log" 2>&1

  cleanup_server
  echo "Completed ${alias}"
done
