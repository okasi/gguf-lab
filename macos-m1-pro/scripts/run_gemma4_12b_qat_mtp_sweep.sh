#!/usr/bin/env bash
# Sweep Gemma 4 12B QAT + Unsloth MTP on Metal.
# Official models: unsloth/gemma-4-12b-it-qat-GGUF (see MTP/README.md)
# llama.cpp: >= PR #23398 (draft-mtp + gemma4-assistant)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="${OUT_DIR:-results/benchloop/gemma4-12b-qat-unsloth-mtp-sweep-16gb-maxctx}"
SERVER_BIN="llama.cpp/build/bin/llama-server"
TARGET_MODEL="models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf"
DRAFT_MODEL="models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf"
ALIAS="gemma-4-12B-it-qat-UD-Q4_K_XL"
HOST="127.0.0.1"
PORT="${PORT:-8093}"
ENDPOINT="http://${HOST}:${PORT}"
SUITES="${SUITES:-agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall}"
# 32GB M1 Pro: reserve 16GB margin -> ~16GB inference budget (see --fit-target)
FIT_TARGET_MIB="${FIT_TARGET_MIB:-16384}"
MEMORY_GB="${MEMORY_GB:-16.0}"

N_MAX_VALUES=(1 2 3 4)
REASONING_VALUES=(off on)

mkdir -p "$OUT_DIR/run-json"

cleanup_server() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  SERVER_PID=""
}

wait_for_server() {
  local server_log="$1"
  for _ in $(seq 1 240); do
    if curl -fsS "${ENDPOINT}/health" >/dev/null 2>&1; then
      return 0
    fi
    if [[ -n "${SERVER_PID:-}" ]] && ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "llama-server exited while starting. See ${server_log}" >&2
      tail -40 "$server_log" >&2 || true
      return 1
    fi
    sleep 1
  done
  echo "Timed out waiting for ${ENDPOINT}. See ${server_log}" >&2
  return 1
}

trap cleanup_server EXIT

for f in "$SERVER_BIN" "$TARGET_MODEL" "$DRAFT_MODEL"; do
  [[ -f "$f" ]] || { echo "Missing: $f" >&2; exit 1; }
done

echo "llama.cpp $(cd llama.cpp && git rev-parse --short HEAD)"
echo "Target: $TARGET_MODEL"
echo "Draft:  $DRAFT_MODEL"
echo "Context: -c 0 (model max, 262144 for 12B)"
echo "Memory budget: ${MEMORY_GB}GB (--fit-target ${FIT_TARGET_MIB} MiB margin)"
echo "Server: -ngl 999 -ngld 999 -fa on --spec-type draft-mtp"
echo "Sweep: n-max=${N_MAX_VALUES[*]} reasoning=${REASONING_VALUES[*]}"

for n_max in "${N_MAX_VALUES[@]}"; do
  for reasoning in "${REASONING_VALUES[@]}"; do
    tag="nmax${n_max}-reasoning-${reasoning}"
    run_dir="${OUT_DIR}/${tag}"
    mkdir -p "$run_dir"

    bench_log="${run_dir}/${ALIAS}.all.benchloop.log"
    server_log="${run_dir}/${ALIAS}.server.log"
    server_stdout="${run_dir}/${ALIAS}.server.stdout.log"
    meta_json="${run_dir}/run-config.json"

    if [[ -f "$bench_log" ]] && rg -q "OVERALL|Run saved|BenchLoop Results" "$bench_log"; then
      echo "[skip] ${tag} — existing log"
      continue
    fi

    if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "Port ${PORT} in use" >&2
      exit 1
    fi

    cat > "$meta_json" <<EOF
{
  "tag": "${tag}",
  "target_model": "${TARGET_MODEL}",
  "draft_model": "${DRAFT_MODEL}",
  "ctx_size": 0,
  "fit": "on",
  "fit_target_mib": ${FIT_TARGET_MIB},
  "memory_budget_gb": ${MEMORY_GB},
  "ngl": 999,
  "ngld": 999,
  "flash_attn": "on",
  "spec_type": "draft-mtp",
  "spec_draft_n_max": ${n_max},
  "reasoning": "${reasoning}",
  "sampler": {"temp": 1, "top_p": 0.95, "top_k": 64},
  "llama_cpp": "$(cd llama.cpp && git rev-parse HEAD)"
}
EOF

    echo ""
    echo "=== ${tag} @ $(date) ==="

    "$SERVER_BIN" \
      -m "$TARGET_MODEL" \
      --model-draft "$DRAFT_MODEL" \
      -a "$ALIAS" \
      --host "$HOST" --port "$PORT" \
      -c 0 \
      --fit on --fit-target "$FIT_TARGET_MIB" \
      -ngl 999 -ngld 999 -fa on \
      -np 1 --jinja --reasoning "$reasoning" \
      --temp 1 --top-p 0.95 --top-k 64 -n 256 \
      --spec-type draft-mtp --spec-draft-n-max "$n_max" \
      --log-file "$server_log" \
      > "$server_stdout" 2>&1 &
    SERVER_PID=$!

    wait_for_server "$server_log"

    n_ctx=$(rg -o "n_ctx = [0-9]+" "$server_stdout" | tail -1 | awk '{print $3}' || true)
    echo "Resolved n_ctx=${n_ctx:-unknown}" | tee -a "$run_dir/notes.txt"

    BENCHLOOP_NO_SUBMIT=1 benchloop run \
      --model "$ALIAS" \
      --endpoint "$ENDPOINT" \
      --provider openai_compat \
      --suites "$SUITES" \
      --hardware "Apple M1 Pro 32GB unified memory (16GB inference cap)" \
      --gpu "Apple M1 Pro" \
      --gpu-memory-gb "$MEMORY_GB" \
      > "$bench_log" 2>&1

    latest_run=$(ls -td "$HOME/.bench-loop/runs"/*/run.json 2>/dev/null | head -1 || true)
    if [[ -n "$latest_run" ]]; then
      cp "$latest_run" "${OUT_DIR}/run-json/${ALIAS}.${tag}.run.json"
    fi

    cleanup_server
    echo "=== done ${tag} @ $(date) ==="
    sleep 3
  done
done

echo "Sweep complete: ${OUT_DIR}"
