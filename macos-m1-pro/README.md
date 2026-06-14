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
| **12B current harness** | [results/benchloop/gemma4-12b-quality-goal-20260613/loop-03-temp090/](results/benchloop/gemma4-12b-quality-goal-20260613/loop-03-temp090/) |
| **26B current harness** | [results/benchloop/gemma4-26b-quality-goal-20260613/temp090/](results/benchloop/gemma4-26b-quality-goal-20260613/temp090/) |
| **12B restored baseline** | [results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter186-restore-safe-baseline-full/](results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter186-restore-safe-baseline-full/) |
| Run scripts | [scripts/](scripts/) |

## Gemma 4 shared-policy BenchLoop — E2B/E4B/12B/26B

**Config:** no cap, `-c 0`, `--fit-target 28672`, reasoning off. E2B/E4B use no local MTP draft and the matrix defaults (`f16` KV); 12B/26B use Unsloth MTP n-max=2 with KV `q4_0` (target + draft). Raw rows use temp 1 / top-p 0.95 / top-k 64; the current harness policy uses temp 0.90 / top-p 0.95 / top-k 64. Harness policy: `gemma4_qat_q4_optimized_policy.json`.

**Audit note:** the harness scores below use the same selected shared policy (`shared-current-best-temp090`) across E2B, E4B, 12B, and 26B; benchmark-specific phrase/word transforms and task-answer/tool-call synthesis remain removed. This policy helps 12B/26B but does **not** pass an all-four-model promotion gate because E2B/E4B regress versus raw.

Artifacts: [E2B/E4B current-policy rerun](results/benchloop/gemma4-e2b-e4b-current-policy-rerun-20260614/) · [12B current harness](results/benchloop/gemma4-12b-quality-goal-20260613/loop-03-temp090/) · [26B current harness](results/benchloop/gemma4-26b-quality-goal-20260613/temp090/). Proxy jsonl scans found no old benchmark-specific repair events.

All-size candidate search on 2026-06-14 stopped at the E2B gate because no clean candidate beat raw E2B (`79.7` overall / `84.1` quality). Best E2B candidate was [candidate-002](results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-002-temp095-topp090-e2-gate/) at `78.4` overall / `82.6` quality. Best non-sampler E2B candidate was [candidate-012](results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-012-single-retry-e2-gate/) at `77.7` overall / `81.6` quality, but its [E4B follow-up](results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-012-single-retry-e4-gate/) regressed to `71.9` / `79.5`. A follow-up E4B run for candidate-002 also failed raw E4B, scoring `73.3` overall / `79.7` quality versus raw `77.7` / `83.3`. Candidate artifacts: [results/benchloop/gemma4-allsize-policy-candidates-20260614/](results/benchloop/gemma4-allsize-policy-candidates-20260614/).

| Candidate | Shared policy change | E2B overall / quality | Outcome |
|---|---|---:|---|
| 001 | `temp=0.90 / top_p=0.90 / top_k=64` | 76.4 / 81.9 | failed E2B gate |
| 002 | `temp=0.95 / top_p=0.90 / top_k=64` | 78.4 / 82.6 | failed E2B gate |
| 003 | `temp=1.00 / top_p=0.90 / top_k=64` | 75.9 / 80.5 | failed E2B gate |
| 004 | `temp=0.95 / top_p=0.925 / top_k=64` | 77.3 / 81.1 | failed E2B gate |
| 005 | `temp=0.95 / top_p=0.95 / top_k=64` | 76.5 / 81.2 | failed E2B gate |
| 006 | `temp=0.80 / top_p=0.95 / top_k=64` | 76.3 / 80.8 | failed E2B gate |
| 007 | candidate 002 + tool arg normalization/dedupe | 77.7 / 82.1 | failed E2B gate |
| 008 | selected sampler + tool arg normalization/dedupe | 76.6 / 80.1 | failed E2B gate |
| 009 | selected sampler + no harness code extraction | 76.3 / 82.4 | failed E2B gate |
| 010 | candidate 009 + no malformed-code retries | 76.4 / 80.0 | failed E2B gate |
| 011 | selected parser + no malformed-code retries | 75.7 / 79.4 | failed E2B gate |
| 012 | selected parser + `max_retries=1` | 77.7 / 81.6 | failed E2B gate; best non-sampler candidate |
| 013 | selected parser + `max_retries=0` | 75.5 / 78.7 | failed E2B gate |
| 014 | selected parser + no malformed-JSON retries | 73.0 / 77.4 | failed E2B gate |

| Candidate | E4B overall / quality | Outcome |
|---|---:|---|
| current policy | 75.4 / 81.2 | failed E4B raw gate |
| 002 | 73.3 / 79.7 | failed E4B raw gate |
| 012 | 71.9 / 79.5 | failed E4B current-harness/raw gates |

| Model | Mode | Runtime config | Quality | Speed | Reliability | Value | **Overall** | Harness Δ overall | Gen tok/s | Runtime | Agent | Coding | Dataextract | Instructfollow | Reasonmath | Toolcall | Load RSS | Peak cache | ≈ Peak |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| E2B | raw | no MTP, `f16` KV | 84.1 | 72.9 | 75.3 | - | **79.7** | - | - | - | 96.9 | 100.0 | 70.1 | 67.8 | 80.0 | 90.0 | - | - | - |
| E2B | harness | no MTP, `f16` KV | 80.2 | 71.8 | 68.5 | - | **75.6** | -4.1 | - | - | 90.6 | 93.8 | 73.9 | 64.5 | 73.3 | 85.0 | - | - | - |
| E4B | raw | no MTP, `f16` KV | 83.3 | 65.2 | 75.3 | - | **77.7** | - | - | - | 96.9 | 100.0 | 81.4 | 66.7 | 80.0 | 75.0 | - | - | - |
| E4B | harness | no MTP, `f16` KV | 81.2 | 63.9 | 71.9 | - | **75.4** | -2.3 | - | - | 96.9 | 93.8 | 80.3 | 61.1 | 80.0 | 75.0 | - | - | - |
| 12B | raw | MTP n-max=2, `q4_0` KV | 86.2 | 44.7 | 80.9 | 8.0 | **76.6** | - | 11.50 | 2143s | 96.9 | 100.0 | 81.7 | 82.2 | 73.3 | 83.3 | 8.2 GB | 3.1 GB | ~11.3 GB |
| 12B | harness | MTP n-max=2, `q4_0` KV | 87.2 | 52.7 | 82.0 | 13.0 | **79.0** | +2.3 | 18.13 | 1219s | 96.9 | 100.0 | 79.4 | 83.3 | 80.0 | 83.3 | 8.4 GB | 3.4 GB | ~11.8 GB |
| 26B | raw | MTP n-max=2, `q4_0` KV | 82.7 | 56.2 | 75.3 | 13.5 | **75.6** | - | 21.69 | 1201s | 96.9 | 91.7 | 81.2 | 70.0 | 73.3 | 83.3 | 14.1 GB | 2.1 GB | ~16.2 GB |
| 26B | harness | MTP n-max=2, `q4_0` KV | 84.5 | 64.5 | 77.5 | 22.3 | **78.8** | +3.2 | 33.96 | 728s | 96.9 | 100.0 | 81.4 | 72.2 | 73.3 | 83.3 | 14.1 GB | 2.3 GB | ~16.4 GB |

## Promoted 12B config (reasoning off)

**Unsloth MTP, n-max=2, KV Q4, no cap, Gemma 4 harness** — see table above (current sampler-only harness **79.0** overall).

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
