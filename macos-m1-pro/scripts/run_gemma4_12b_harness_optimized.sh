#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export MODEL_FILTER="${MODEL_FILTER:-gemma-4-12B-it-qat-UD-Q4_K_XL}"
export MODE="${MODE:-harness}"
export NO_CAP="${NO_CAP:-1}"
export CACHE_TYPE_K="${CACHE_TYPE_K:-q4_0}"
export CACHE_TYPE_V="${CACHE_TYPE_V:-q4_0}"
export CACHE_TYPE_K_DRAFT="${CACHE_TYPE_K_DRAFT:-q4_0}"
export CACHE_TYPE_V_DRAFT="${CACHE_TYPE_V_DRAFT:-q4_0}"
export OUT_DIR="${OUT_DIR:-results/benchloop/gemma4-12b-promoted-kvq4-harness}"

exec "$SCRIPT_DIR/run_gemma4_nmax2_benchloop_matrix.sh"
