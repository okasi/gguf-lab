# Local LLM Experiments

Benchmarks run locally on Windows with llama.cpp Vulkan.

Unless noted otherwise, runs used:

- `--ctx-size 262144`
- `--cache-type-k q8_0`
- `--cache-type-v q8_0`
- `--ngl 99`
- `-np 1`
- `--flash-attn on`
- `--temp 0.75`
- `--top-p 0.95`
- `--top-k 20`
- `--min-p 0.0`
- `--presence-penalty 0.0`
- `--repeat-penalty 1.0`
- `--seed 3407`
- `-n 32768`

Agent scoped/broad runs used the same model load settings, but with `--temp 0.2`, `-n 8192`, and OpenAI-style tool-calling scenarios.

Notes:

- Vision runs used the matching `mmproj` when it loaded successfully.
- `Image gen` is `N/A` when no usable vision run was completed.
- Jackrong Qwopus3.6 35B files are from `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF`; they support vision through `mmproj.gguf`, but the repo is not marked MTP-preserved, so these were run without speculative MTP flags.
- `Smoffyy GPT-OSS 20B Instruct Pure` was run at `--ctx-size 8192` with `--jinja` and `--reasoning auto`; the repo did not provide an `mmproj`.
- `Unsloth Gemma4 E4B`, `Unsloth Gemma4 E2B`, `Smoffyy Gemma4 E4B`, and `Smoffyy Gemma4 26B A4B` required `--image-min-tokens 256` for their `mmproj` files to load; the earlier `1024` setting exceeded their image pixel limits.
- `Jackrong Qwopus3.6 27B v2 MTP` rows used `--spec-type draft-mtp`; the MTP repo did not include an `mmproj`, so vision used `mmproj.gguf` from `Jackrong/Qwopus3.6-27B-v2-GGUF`.
- TeichAI Gemma4 Opus Q5 used `--reasoning auto`.

## Combined Benchmark Results

### Models Under 8 GiB Mem

| Model | Source / file | Load mem | Text gen | Image gen | Tool gen | Hard TS | Agent scoped | Agent broad |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Unsloth Gemma4 E2B it Q5_K_M | `unsloth/gemma-4-E2B-it-GGUF` / `gemma-4-E2B-it-Q5_K_M.gguf` | 5.38 GiB | 86.95 tok/s | 76.96 tok/s | 75.01 tok/s | 21/25 | 60/60 | 60/60 |
| Unsloth Gemma4 E2B it UD Q5_K_XL | `unsloth/gemma-4-E2B-it-GGUF` / `gemma-4-E2B-it-UD-Q5_K_XL.gguf` | 5.50 GiB | 85.34 tok/s | 76.75 tok/s | 74.92 tok/s | 20/25 | 60/60 | 60/60 |

### Models Under 14 GiB Mem

| Model | Source / file | Load mem | Text gen | Image gen | Tool gen | Hard TS | Agent scoped | Agent broad |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Unsloth Gemma4 E4B it Q4_K_M | `unsloth/gemma-4-E4B-it-GGUF` / `gemma-4-E4B-it-Q4_K_M.gguf` | 8.19 GiB | 52.93 tok/s | 48.43 tok/s | 48.80 tok/s | 23/25 | 60/60 | 60/60 |
| Unsloth Gemma4 E4B it UD Q5_K_XL | `unsloth/gemma-4-E4B-it-GGUF` / `gemma-4-E4B-it-UD-Q5_K_XL.gguf` | 8.95 GiB | 46.39 tok/s | 42.36 tok/s | 42.82 tok/s | 23/25 | 60/60 | 60/60 |
| Jackrong Qwopus3.5 4B v3 Q5_K_M | `Jackrong/Qwopus3.5-4B-v3-GGUF` / `Qwen3.5-4B.Q5_K_M.gguf` | 10.07 GiB | 56.36 tok/s | 53.18 tok/s | 53.33 tok/s | 6/25 | 55/60 | 55/60 |
| Unsloth Qwen3.5 4B Q5_K_M | `unsloth/Qwen3.5-4B-GGUF` / `Qwen3.5-4B-Q5_K_M.gguf` | 10.13 GiB | 54.90 tok/s | 52.30 tok/s | 52.38 tok/s | 12/25 | 48/60 | 55/60 |
| Unsloth Qwen3.5 9B Q4_K_M | `unsloth/Qwen3.5-9B-GGUF` / `Qwen3.5-9B-Q4_K_M.gguf` | 12.59 GiB | 37.46 tok/s | 36.56 tok/s | 36.58 tok/s | 11/25 | 44/60 | 53/60 |
| Jackrong Qwopus3.5 9B Coder Exp Q5_K_M | `Jackrong/Qwopus3.5-9B-Coder-GGUF` / `Qwopus3.5-9B-coder-Exp-Q5_K_M.gguf` | 13.21 GiB | 33.87 tok/s | 33.08 tok/s | 33.68 tok/s | 11/25 | 55/60 | 55/60 |
| Smoffyy Qwen3.5 9B Revised Q5_K_M | `Smoffyy/Qwen3.5-9B-Instruct-Revised-GGUF` / `Qwen3.5-9B-Revised-q5_k_m.gguf` | 13.21 GiB | 33.82 tok/s | 33.04 tok/s | 33.26 tok/s | 5/25 | 55/60 | 60/60 |
| Unsloth Qwen3.5 9B Q5_K_M | `unsloth/Qwen3.5-9B-GGUF` / `Qwen3.5-9B-Q5_K_M.gguf` | 13.31 GiB | 30.96 tok/s | 31.54 tok/s | 31.58 tok/s | 8/25 | 44/60 | 48/60 |
| Smoffyy GPT-OSS 20B Instruct Pure | `Smoffyy/gpt-oss-20b-instruct-pure-gguf` / `gpt-oss.gguf` | 13.74 GiB | 47.13 tok/s | N/A | 44.78 tok/s | 23/25 | 53/60 | 56/60 |

### Models Over 14 GiB Mem

| Model | Source / file | Load mem | Text gen | Image gen | Tool gen | Hard TS | Agent scoped | Agent broad |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Jackrong Qwopus3.6 35B A3B v1 IQ4_XS | `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-IQ4_XS.gguf` | 23.43 GiB | 70.97 tok/s | 62.81 tok/s | 63.62 tok/s | 16/25 | 60/60 | 60/60 |
| Smoffyy Gemma4 26B A4B Instruct Pure Q5_K_M | `Smoffyy/Gemma4-26B-A4B-Instruct-Pure-GGUF` / `Gemma4-26B-A4B-q5_k_m.gguf` | 24.27 GiB | 51.27 tok/s | 47.10 tok/s | 48.10 tok/s | 23/25 | 60/60 | 56/60 |
| TeichAI Gemma4 26B A4B Claude Opus Distill v2 Q5_K_M | `TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2-GGUF` / `gemma-4-26B-A4B-it-Claude-Opus-Distill.q5_k_m.gguf` | 24.27 GiB | 54.14 tok/s | 49.73 tok/s | 50.81 tok/s | 23/25 | 60/60 | 57/60 |
| Jackrong Qwopus3.6 35B A3B v1 Q4_K_M | `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-Q4_K_M.gguf` | 25.50 GiB | 70.03 tok/s | 62.95 tok/s | 63.05 tok/s | 16/25 | 55/60 | 55/60 |
| Smoffyy Qwen3.6 27B Revised Q4_K_M | `Smoffyy/Qwen3.6-27B-Instruct-Revised-GGUF` / `Qwen3.6-27B-Revised-q4_k_m.gguf` | 27.38 GiB | 12.80 tok/s | 12.71 tok/s | 12.82 tok/s | 16/25 | 55/60 | 55/60 |
| Jackrong Qwopus3.6 27B v2 Q4_K_M | `Jackrong/Qwopus3.6-27B-v2-GGUF` / `Qwopus3.6-27B-v2-Q4_K_M.gguf` | 27.63 GiB | 12.78 tok/s | 12.72 tok/s | 12.86 tok/s | 16/25 | 55/60 | 55/60 |
| Jackrong Qwopus3.6 27B v2 MTP IQ4_XS | `Jackrong/Qwopus3.6-27B-v2-MTP-GGUF` / `Qwopus3.6-27B-v2-MTP-IQ4_XS.gguf` | 28.63 GiB | 20.19 tok/s | 21.46 tok/s | 21.80 tok/s | 23/25 | 55/60 | 55/60 |
| Jackrong Qwopus3.6 35B A3B v1 Q5_K_M | `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` | 28.98 GiB | 65.68 tok/s | 59.20 tok/s | 59.84 tok/s | 23/25 | 60/60 | 60/60 |
| Smoffyy Qwen3.6 35B A3B Revised Q5_K_M | `Smoffyy/Qwen3.6-35B-A3B-Instruct-Revised-GGUF` / `Qwen3.6-35B-A3B-Revised-q5_k_m.gguf` | 28.98 GiB | 65.12 tok/s | 59.22 tok/s | 59.38 tok/s | 23/25 | 56/60 | 55/60 |

## Hard TypeScript Breakdown

| Model | LRU cache | Expression parser | Weighted grid Dijkstra | Topological scheduler | Total |
|---|---:|---:|---:|---:|---:|
| Unsloth Gemma4 E2B it Q5_K_M | 5/6 | 6/7 | 4/6 | 6/6 | 21/25 |
| Unsloth Gemma4 E2B it UD Q5_K_XL | 6/6 | 5/7 | 4/6 | 5/6 | 20/25 |
| Unsloth Gemma4 E4B it Q4_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| Unsloth Gemma4 E4B it UD Q5_K_XL | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| Jackrong Qwopus3.5 4B v3 Q5_K_M | 0/6 | 0/7 | 0/6 | 6/6 | 6/25 |
| Unsloth Qwen3.5 4B Q5_K_M | 5/6 | 0/7 | 1/6 | 6/6 | 12/25 |
| Unsloth Qwen3.5 9B Q4_K_M | 5/6 | 4/7 | 0/6 | 2/6 | 11/25 |
| Jackrong Qwopus3.5 9B Coder Exp Q5_K_M | 5/6 | 0/7 | 0/6 | 6/6 | 11/25 |
| Smoffyy Qwen3.5 9B Revised Q5_K_M | 0/6 | 0/7 | 4/6 | 1/6 | 5/25 |
| Unsloth Qwen3.5 9B Q5_K_M | 1/6 | 4/7 | 3/6 | 0/6 | 8/25 |
| Smoffyy GPT-OSS 20B Instruct Pure | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| Smoffyy Gemma4 26B A4B Instruct Pure Q5_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| Jackrong Qwopus3.6 35B A3B v1 IQ4_XS | 6/6 | 0/7 | 4/6 | 6/6 | 16/25 |
| TeichAI Gemma4 26B A4B Claude Opus Distill v2 Q5_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| Jackrong Qwopus3.6 35B A3B v1 Q4_K_M | 6/6 | 0/7 | 4/6 | 6/6 | 16/25 |
| Smoffyy Qwen3.6 27B Revised Q4_K_M | 6/6 | 0/7 | 4/6 | 6/6 | 16/25 |
| Jackrong Qwopus3.6 27B v2 Q4_K_M | 6/6 | 0/7 | 4/6 | 6/6 | 16/25 |
| Jackrong Qwopus3.6 27B v2 MTP IQ4_XS | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| Jackrong Qwopus3.6 35B A3B v1 Q5_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| Smoffyy Qwen3.6 35B A3B Revised Q5_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |

## Current Takeaways

- Best under 8 GiB: `Unsloth Gemma4 E2B it Q5_K_M` is the strongest remaining small model by quality at `21/25`, and it is also the fastest remaining row in this bucket.
- Best under 14 GiB: `Unsloth Gemma4 E4B it Q4_K_M` is now the best all-around result in this bucket: `23/25`, `52.93 tok/s` text, working vision, and `60/60` on both agent tests.
- In the E4B quant batch, `Q4_K_M` is the remaining standout: `23/25` Hard TS with full agent scores.
- New Unsloth Qwen3.5 9B rows all loaded vision successfully, but their hard TypeScript scores were weak; `Q4_K_M` was the best remaining row in that set at `11/25`.
- Best over 14 GiB: `Jackrong Qwopus3.6 35B A3B v1 Q5_K_M` had the best all-around mix: `23/25`, strong vision speed, and `60/60` on both agent tests.
- Best Qwopus3.6 27B v2 row: `MTP IQ4_XS` clearly won this batch with `23/25` Hard TS and around `20-22 tok/s`.
- The non-MTP replacement rows are generally stronger than the deleted MTP rows on this benchmark, especially `Jackrong Qwopus3.6 35B A3B v1 Q4_K_M`, which restored vision and improved Hard TS from `10/25` to `16/25`.
