# macOS M1 Pro — Gemma 4 QAT BenchLoop Experiments

Apple **M1 Pro, 32 GB unified memory**, Metal backend via `llama.cpp` `llama-server`.

## Hardware & stack

| item | value |
|---|---|
| Machine | GMKtec-style dev Mac / M1 Pro 32 GB |
| Backend | llama.cpp Metal (`-ngl 999` or `all`) |
| BenchLoop | v0.2.3, `BENCHLOOP_NO_SUBMIT=1` |
| Model | `unsloth/gemma-4-12b-it-qat-GGUF` · `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` |
| MTP draft | `MTP/gemma-4-12B-it-Q8_0-MTP.gguf` (official Unsloth) |
| llama.cpp | `76da245` (Gemma4 MTP, PR #23398) |

Models and `llama.cpp` builds are **not** vendored in this repo. Place GGUF files under `macos-m1-pro/models/` locally, or override paths in the run scripts.

## Quick links

| artifact | path |
|---|---|
| **12B KV Q4 run** | [results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter186-restore-safe-baseline-full/](results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter186-restore-safe-baseline-full/) |
| **26B KV Q4 run** | [results/benchloop/gemma4-26b-nmax2-kvq4-no-cap-20260611T083329Z/](results/benchloop/gemma4-26b-nmax2-kvq4-no-cap-20260611T083329Z/) |
| Run scripts | [scripts/](scripts/) |

## Gemma 4 KV Q4 BenchLoop — 12B vs 26B (nmax2, no cap)

**Config:** Unsloth MTP n-max=2, KV `q4_0` (target + draft), `-c 0`, `--fit-target 28672`, reasoning off, temp 1 / top-p 0.95 / top-k 64. Harness policy: `gemma4_qat_q4_optimized_policy.json`.

**Audit note:** the 12B harness score below is the current restored safe-baseline policy run from 2026-06-12; benchmark-specific phrase/word transforms and task-answer/tool-call synthesis remain removed.

| Model | Mode | Quality | Speed | Reliability | Value | **Overall** | Gen tok/s | Runtime | Agent | Coding | Dataextract | Instructfollow | Reasonmath | Toolcall | Load RSS | Peak cache | ≈ Peak |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 12B | raw | 86.2 | 44.7 | 80.9 | 8.0 | **76.6** | 11.50 | 2143s | 96.9 | 100.0 | 81.7 | 82.2 | 73.3 | 83.3 | 8.2 GB | 3.1 GB | ~11.3 GB |
| 12B | harness | 86.5 | 44.6 | 80.9 | 8.2 | **76.7** | 11.78 | 3032s | 96.9 | 100.0 | 81.0 | 84.5 | 73.3 | 83.3 | 8.4 GB | 3.5 GB | ~11.9 GB |
| 26B | raw | 82.7 | 56.2 | 75.3 | 13.5 | **75.6** | 21.69 | 1201s | 96.9 | 91.7 | 81.2 | 70.0 | 73.3 | 83.3 | 14.1 GB | 2.1 GB | ~16.2 GB |
| 26B | harness | 89.5 | 56.3 | 84.3 | 16.5 | **81.6** | 21.89 | 1132s | 96.9 | 100.0 | 83.7 | 70.0 | 86.7 | 100.0 | 14.1 GB | 2.4 GB | ~16.5 GB |

## Promoted 12B config (reasoning off)

**Unsloth MTP, n-max=2, KV Q4, no cap, Gemma 4 harness** — see table above (restored safe-baseline harness **76.7** overall).

```bash
# Serve llama-server + harness proxy
bash scripts/run_gemma4_12b_promoted_serve.sh
```

```bash
llama-server \
  -m models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf \
  --model-draft models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf \
  -c 0 --fit on --fit-target 28672 \
  -ngl 999 -ngld 999 -fa on \
  --cache-type-k q4_0 --cache-type-v q4_0 \
  --spec-draft-type-k q4_0 --spec-draft-type-v q4_0 \
  --spec-type draft-mtp --spec-draft-n-max 2 \
  --reasoning off --temp 1 --top-p 0.95 --top-k 64 -n 256 --jinja -np 1
```

## Gemma 4 harness

The promoted Gemma 4 harness is [`../gemma4_harness/`](../gemma4_harness/). BenchLoop is the current scored benchmark, but the harness should remain a general OpenAI-compatible adapter for OpenClaw/ClawBench, Hermes Agent, opencode, and similar local clients.

```bash
cd ../gemma4_harness && npm install && npm test
./scripts/run_gemma4_12b_harness_optimized.sh   # from macos-m1-pro/
```

## Re-running benchmarks

From `macos-m1-pro/` (requires local `llama.cpp` build and models):

```bash
# 12B promoted harness rerun
bash scripts/run_gemma4_12b_harness_optimized.sh
```
