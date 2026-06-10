# BenchLoop llama.cpp Results - temp1 top_p0.95 top_k64

Date: 2026-06-05

BenchLoop CLI: 0.2.3
llama.cpp: 7c158fb
Backend: llama.cpp llama-server OpenAI-compatible endpoint
Suite: speed only (--suites speed)
Submission: disabled with BENCHLOOP_NO_SUBMIT=1
Hardware: Apple M1 Pro 32GB unified memory
Sampler: --temp 1 --top-p 0.95 --top-k 64
Other server settings: -ngl all -c 4096 -np 1 --jinja --reasoning off -n 256

| Model | Gen tok/s | Delta | Speed score | Delta | Avg ms | Delta | Reliability | Overall | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| gemma-4-E2B-it-Q5_K_M | 26.84 | +0.78 | 60.4 | +0.7 | 5626 | -88 | 100.0 | 37.1 | 189.0s |
| gemma-4-E4B-it-IQ4_XS | 19.56 | -0.11 | 54.4 | -0.1 | 7661 | +148 | 100.0 | 35.9 | 243.9s |
| gemma-4-12b-it-Q4_K_M | 8.01 | -0.13 | 38.4 | -0.3 | 19009 | +424 | 100.0 | 32.7 | 606.7s |

Deltas compare against the prior BenchLoop speed-only runs in ../summary.md.

## Artifacts

- gemma-4-E2B-it-Q5_K_M: log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/sampler-temp1-top_p095-top_k64/gemma-4-E2B-it-Q5_K_M.speed.benchloop.log, server log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/sampler-temp1-top_p095-top_k64/gemma-4-E2B-it-Q5_K_M.server.log, run JSON /Users/okasi/.bench-loop/runs/20260605-121454-gemma-4-E2B-it-Q5_K_M-temp1-top_p095-top_k64-local-openai_compat/run.json
- gemma-4-E4B-it-IQ4_XS: log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/sampler-temp1-top_p095-top_k64/gemma-4-E4B-it-IQ4_XS.speed.benchloop.log, server log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/sampler-temp1-top_p095-top_k64/gemma-4-E4B-it-IQ4_XS.server.log, run JSON /Users/okasi/.bench-loop/runs/20260605-134421-gemma-4-E4B-it-IQ4_XS-temp1-top_p095-top_k64-local-openai_compat/run.json
- gemma-4-12b-it-Q4_K_M: log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/sampler-temp1-top_p095-top_k64/gemma-4-12b-it-Q4_K_M.speed.benchloop.log, server log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/sampler-temp1-top_p095-top_k64/gemma-4-12b-it-Q4_K_M.server.log, run JSON /Users/okasi/.bench-loop/runs/20260605-145305-gemma-4-12b-it-Q4_K_M-temp1-top_p095-top_k64-local-openai_compat/run.json
