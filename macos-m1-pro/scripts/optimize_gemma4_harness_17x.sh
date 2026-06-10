#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

node scripts/optimize_gemma4_fastify_20x.mjs \
  --iterations "${ITERATIONS:-20}" \
  --out-dir "${OUT_DIR:-results/benchloop/gemma4-fastify-optimization-20x}" \
  --models "${MODELS:-gemma-4-E2B-it-qat-UD-Q4_K_XL,gemma-4-E4B-it-qat-UD-Q4_K_XL}" \
  --suites "${SUITES:-agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall}" \
  --resume \
  "$@"
