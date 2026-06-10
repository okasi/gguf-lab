# BenchLoop llama.cpp All-Suite Results

Date: 2026-06-05

BenchLoop CLI: 0.2.3
llama.cpp: 7c158fb
Backend: llama.cpp llama-server OpenAI-compatible endpoint
Suites: agent, coding, dataextract, instructfollow, reasonmath, speed, toolcall
Submission: disabled with BENCHLOOP_NO_SUBMIT=1
Hardware: Apple M1 Pro 32GB unified memory
Sampler: --temp 1 --top-p 0.95 --top-k 64
Other server settings: -ngl all -c 4096 -np 1 --jinja --reasoning off -n 256

| Model | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|
| gemma-4-E2B-it-Q5_K_M | 78.2 | 73.2 | 67.9 | 66.3 | 21.2 | 40.87 | 837.4s |
| gemma-4-E4B-it-IQ4_XS | 81.7 | 75.8 | 63.0 | 73.0 | 18.7 | 31.42 | 789.7s |
| gemma-4-12b-it-Q4_K_M | 83.5 | 74.4 | 46.5 | 76.4 | 8.0 | 12.54 | 2121.7s |

| Model | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Speed | Tool Call |
|---|---:|---:|---:|---:|---:|---:|---:|
| gemma-4-E2B-it-Q5_K_M | 96.9 (7/8) | 93.8 (11/12) | 60.7 (3/15) | 64.5 (7/15) | 73.3 (11/15) | 67.9 (9/9) | 80.0 (11/15) |
| gemma-4-E4B-it-IQ4_XS | 96.9 (7/8) | 100.0 (12/12) | 82.5 (9/15) | 68.9 (8/15) | 73.3 (11/15) | 63.0 (9/9) | 68.3 (9/15) |
| gemma-4-12b-it-Q4_K_M | 96.9 (7/8) | 100.0 (12/12) | 82.2 (9/15) | 65.5 (8/15) | 73.3 (11/15) | 46.5 (9/9) | 83.3 (12/15) |

## Artifacts

- gemma-4-E2B-it-Q5_K_M: log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/all-suites-temp1-top_p095-top_k64/gemma-4-E2B-it-Q5_K_M.all.benchloop.log, server log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/all-suites-temp1-top_p095-top_k64/gemma-4-E2B-it-Q5_K_M.server.log, run JSON /Users/okasi/.bench-loop/runs/20260605-163447-gemma-4-E2B-it-Q5_K_M-all-temp1-top_p095-top_k64-local-openai_compat/run.json
- gemma-4-E4B-it-IQ4_XS: log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/all-suites-temp1-top_p095-top_k64/gemma-4-E4B-it-IQ4_XS.all.benchloop.log, server log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/all-suites-temp1-top_p095-top_k64/gemma-4-E4B-it-IQ4_XS.server.log, run JSON /Users/okasi/.bench-loop/runs/20260605-164847-gemma-4-E4B-it-IQ4_XS-all-temp1-top_p095-top_k64-local-openai_compat/run.json
- gemma-4-12b-it-Q4_K_M: log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/all-suites-temp1-top_p095-top_k64/gemma-4-12b-it-Q4_K_M.all.benchloop.log, server log /Users/okasi/Documents/Codex/2026-06-04/run-benchloop-for-unsloth-gemma-4/results/benchloop/all-suites-temp1-top_p095-top_k64/gemma-4-12b-it-Q4_K_M.server.log, run JSON /Users/okasi/.bench-loop/runs/20260605-172503-gemma-4-12b-it-Q4_K_M-all-temp1-top_p095-top_k64-local-openai_compat/run.json
