#!/usr/bin/env bash
# Promoted Gemma 4 12B: Unsloth MTP n-max=2, KV q4, no cap, plus merged proxy harness.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MACOS_DIR="${MACOS_DIR:-$REPO_ROOT/macos-m1-pro}"
LLM_ROOT="${LLM_ROOT:-${CODEX_ROOT:-$MACOS_DIR}}"
HARNESS_DIR="${HARNESS_DIR:-$REPO_ROOT/proxy-lan-server}"
POLICY="${POLICY:-$HARNESS_DIR/gemma_qwen_merged_policy.json}"
PROXY_BIN="${PROXY_BIN:-$HARNESS_DIR/proxy.mjs}"
SERVER_BIN="${SERVER_BIN:-$LLM_ROOT/llama.cpp/build/bin/llama-server}"
TARGET_MODEL="${TARGET_MODEL:-$LLM_ROOT/models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf}"
DRAFT_MODEL="${DRAFT_MODEL:-$LLM_ROOT/models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf}"
UPSTREAM_PORT="${UPSTREAM_PORT:-8091}"
PROXY_PORT="${PROXY_PORT:-8092}"
HOST="${HOST:-127.0.0.1}"
ALIAS="${ALIAS:-gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4_harness}"
CTX_SIZE="${CTX_SIZE:-0}"
FIT_TARGET_MIB="${FIT_TARGET_MIB:-28672}"
SPEC_DRAFT_N_MAX="${SPEC_DRAFT_N_MAX:-2}"
REASONING="${REASONING:-off}"
CACHE_TYPE_K="${CACHE_TYPE_K:-q4_0}"
CACHE_TYPE_V="${CACHE_TYPE_V:-q4_0}"
CACHE_TYPE_K_DRAFT="${CACHE_TYPE_K_DRAFT:-q4_0}"
CACHE_TYPE_V_DRAFT="${CACHE_TYPE_V_DRAFT:-q4_0}"

KV_ARGS=(
  --cache-type-k "$CACHE_TYPE_K"
  --cache-type-v "$CACHE_TYPE_V"
  --spec-draft-type-k "$CACHE_TYPE_K_DRAFT"
  --spec-draft-type-v "$CACHE_TYPE_V_DRAFT"
)

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
  local pid="$2"
  local label="$3"
  for _ in $(seq 1 240); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "${label} exited while starting." >&2
      return 1
    fi
    sleep 1
  done
  echo "Timed out waiting for ${url}" >&2
  return 1
}

for f in "$SERVER_BIN" "$TARGET_MODEL" "$DRAFT_MODEL" "$POLICY" "$PROXY_BIN"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing required file: $f" >&2
    exit 1
  fi
done

if ! (cd "$HARNESS_DIR" && node --input-type=module -e 'await import("./proxy.mjs")') >/dev/null 2>&1; then
  echo "Missing harness dependencies. Run: (cd \"$HARNESS_DIR\" && npm install)" >&2
  exit 1
fi

if lsof -nP -iTCP:"$UPSTREAM_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Upstream port ${UPSTREAM_PORT} is already in use." >&2
  exit 1
fi
if lsof -nP -iTCP:"$PROXY_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Proxy port ${PROXY_PORT} is already in use." >&2
  exit 1
fi

trap cleanup EXIT

echo "Starting llama-server: 12B MTP n-max=${SPEC_DRAFT_N_MAX}, KV ${CACHE_TYPE_K}/${CACHE_TYPE_V}, no cap"
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
  "${KV_ARGS[@]}"
SERVER_PID=$!
wait_for_health "http://${HOST}:${UPSTREAM_PORT}/health" "$SERVER_PID" "llama-server"

echo "Starting merged harness proxy on http://${HOST}:${PROXY_PORT}"
node "$PROXY_BIN" \
  --host "$HOST" --port "$PROXY_PORT" \
  --upstream "http://${HOST}:${UPSTREAM_PORT}" \
  --policy "$POLICY" &
PROXY_PID=$!
wait_for_health "http://${HOST}:${PROXY_PORT}/health" "$PROXY_PID" "harness proxy"

echo "Ready."
echo "  OpenAI endpoint: http://${HOST}:${PROXY_PORT}/v1"
echo "  Model alias:    ${ALIAS}"
echo "  Upstream:       http://${HOST}:${UPSTREAM_PORT}"
wait
