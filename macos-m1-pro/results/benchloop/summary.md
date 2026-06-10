# BenchLoop llama.cpp Results

Date: 2026-06-05

BenchLoop CLI: 0.2.3
llama.cpp: 7c158fb
Backend: llama.cpp llama-server OpenAI-compatible endpoint
Suite: speed only (--suites speed)
Submission: disabled with BENCHLOOP_NO_SUBMIT=1
Hardware: Apple M1 Pro 32GB unified memory

Note: The default BenchLoop suite was started first, but Gemma 4 reasoning output made it impractically long locally. These final BenchLoop runs use llama-server with --reasoning off and BenchLoop's speed suite only.

| Model | Gen tok/s | Speed score | Prompts | Avg ms | Reliability | Overall | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|
| gemma-4-E2B-it-Q5_K_M | 26.06 | 59.7 | 9/9 | 5714 | 100.0 | 36.9 | 191.5s |
| gemma-4-E4B-it-IQ4_XS | 19.67 | 54.5 | 9/9 | 7513 | 100.0 | 35.9 | 239.5s |
| gemma-4-12b-it-Q4_K_M | 8.14 | 38.7 | 9/9 | 18585 | 100.0 | 32.7 | 601.1s |

## Artifacts

- gemma-4-E2B-it-Q5_K_M: log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/gemma-4-E2B-it-Q5_K_M.speed.benchloop.log, run JSON /Users/okasi/.bench-loop/runs/20260605-104629-gemma-4-E2B-it-Q5_K_M-local-openai_compat/run.json
- gemma-4-E4B-it-IQ4_XS: log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/gemma-4-E4B-it-IQ4_XS.speed.benchloop.log, run JSON /Users/okasi/.bench-loop/runs/20260605-105127-gemma-4-E4B-it-IQ4_XS-local-openai_compat/run.json
- gemma-4-12b-it-Q4_K_M: log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/gemma-4-12b-it-Q4_K_M.speed.benchloop.log, run JSON /Users/okasi/.bench-loop/runs/20260605-110228-gemma-4-12b-it-Q4_K_M-local-openai_compat/run.json
