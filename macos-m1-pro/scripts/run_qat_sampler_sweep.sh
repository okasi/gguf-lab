#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="results/benchloop/qat-e2b-e4b-sampler-sweep-all-suites"
SERVER_BIN="llama.cpp/build/bin/llama-server"
PORT="${PORT:-8091}"
HOST="127.0.0.1"
ENDPOINT="http://${HOST}:${PORT}"
SUITES="agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall"

mkdir -p "$OUT_DIR"

MODELS=(
  "gemma-4-E2B-it-qat-UD-Q4_K_XL|models/gemma-4-E2B-it-qat-GGUF/gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf"
  "gemma-4-E4B-it-qat-UD-Q4_K_XL|models/gemma-4-E4B-it-qat-GGUF/gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf"
)

SAMPLERS=(
  "temp095_top_p093_top_k58|0.95|0.93|58"
  "temp090_top_p091_top_k52|0.90|0.91|52"
  "temp085_top_p090_top_k47|0.85|0.90|47"
  "temp080_top_p090_top_k43|0.80|0.90|43"
  "temp075_top_p090_top_k40|0.75|0.90|40"
  "temp080_top_p085_top_k40|0.80|0.85|40"
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

for sampler in "${SAMPLERS[@]}"; do
  IFS="|" read -r sampler_id temp top_p top_k <<< "$sampler"
  for model in "${MODELS[@]}"; do
    IFS="|" read -r model_id model_path <<< "$model"
    alias="${model_id}-${sampler_id}"
    bench_log="${OUT_DIR}/${alias}.all.benchloop.log"
    server_log="${OUT_DIR}/${alias}.server.log"

    if [[ ! -f "$model_path" ]]; then
      echo "Missing model: ${model_path}" >&2
      exit 1
    fi

    if [[ -f "$bench_log" ]] && rg -q "Saved results to" "$bench_log"; then
      echo "Skipping ${alias}; existing completed BenchLoop log found at ${bench_log}"
      continue
    fi

    echo "Starting llama-server for ${alias}"
    "$SERVER_BIN" \
      -m "$model_path" \
      -a "$alias" \
      --host "$HOST" --port "$PORT" \
      -ngl all -c 4096 -np 1 --jinja --reasoning off \
      --temp "$temp" --top-p "$top_p" --top-k "$top_k" -n 256 \
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
done
