# Local LLM Experiments

Benchmarks run locally on Windows with llama.cpp Vulkan. Unless noted otherwise, runs used:

- `--ctx-size 262144`
- `--cache-type-k q8_0`
- `--cache-type-v q8_0`
- `--ngl 99`
- `-np 1`
- `--flash-attn on`
- vision runs used the matching `mmproj`

The Qwopus 35B files below are from `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF`. They support vision through `mmproj`, but this repo is not marked MTP-preserved, so these were run without speculative MTP flags.

## Qwopus35 vs Gemma4 Q5

| Model | Load mem | Text gen | Image gen | Tool gen | Hard TS | Agent scoped | Agent broad |
|---|---:|---:|---:|---:|---:|---:|---:|
| Qwopus35 IQ4_XS | 23.43 GiB | 70.97 tok/s | 62.81 tok/s | 63.62 tok/s | 16/25 | 60/60 | 60/60 |
| Qwopus35 Q5_K_M | 28.98 GiB | 65.68 tok/s | 59.20 tok/s | 59.84 tok/s | 23/25 | 60/60 | 60/60 |
| TeichAI Gemma4 Opus Q5_K_M | 24.27 GiB | 54.14 tok/s | 49.73 tok/s | 50.81 tok/s | 23/25 | 60/60 | 57/60 |

## Hard TypeScript Breakdown

| Model | LRU cache | Expression parser | Weighted grid Dijkstra | Topological scheduler | Total |
|---|---:|---:|---:|---:|---:|
| Qwopus35 IQ4_XS | 6/6 | 0/7 | 4/6 | 6/6 | 16/25 |
| Qwopus35 Q5_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| TeichAI Gemma4 Opus Q5_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |

## Current Takeaway

Qwopus35 Q5_K_M is the best Qwopus35 balance from this set: it keeps most of the speed advantage over Gemma4 Q5 while matching its hard TypeScript score.
