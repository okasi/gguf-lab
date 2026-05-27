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
| Jackrong Qwopus3.6 35B A3B v1 IQ4_XS (`Qwopus3.6-35B-A3B-v1-IQ4_XS.gguf`) | 23.43 GiB | 70.97 tok/s | 62.81 tok/s | 63.62 tok/s | 16/25 | 60/60 | 60/60 |
| Jackrong Qwopus3.6 35B A3B v1 Q5_K_M (`Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf`) | 28.98 GiB | 65.68 tok/s | 59.20 tok/s | 59.84 tok/s | 23/25 | 60/60 | 60/60 |
| TeichAI Gemma4 26B A4B Claude Opus Distill v2 Q5_K_M (`gemma-4-26B-A4B-it-Claude-Opus-Distill.q5_k_m.gguf`) | 24.27 GiB | 54.14 tok/s | 49.73 tok/s | 50.81 tok/s | 23/25 | 60/60 | 57/60 |

### Qwopus35 vs Gemma4 Q5 Params

The text, vision, tool, and Hard TypeScript runs used these shared params:

```bash
--ctx-size 262144
--cache-type-k q8_0
--cache-type-v q8_0
--ngl 99
-np 1
--flash-attn on
--temp 0.75
--top-p 0.95
--top-k 20
--min-p 0.0
--presence-penalty 0.0
--repeat-penalty 1.0
--seed 3407
-n 32768
```

Model-specific params:

| Model | Repo | Model file | Vision file | Extra params |
|---|---|---|---|---|
| Jackrong Qwopus3.6 35B A3B v1 IQ4_XS | `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` | `Qwopus3.6-35B-A3B-v1-IQ4_XS.gguf` | `mmproj.gguf` | `--image-min-tokens 1024`; no MTP/speculative flags |
| Jackrong Qwopus3.6 35B A3B v1 Q5_K_M | `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` | `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` | `mmproj.gguf` | `--image-min-tokens 1024`; no MTP/speculative flags |
| TeichAI Gemma4 26B A4B Claude Opus Distill v2 Q5_K_M | `TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2-GGUF` | `gemma-4-26B-A4B-it-Claude-Opus-Distill.q5_k_m.gguf` | `mmproj-gemma4-26B-A4B-F16.gguf` | `--reasoning auto` |

Agent scoped/broad runs used the same model load settings, but with `--temp 0.2`, `-n 8192`, and the benchmark's OpenAI-style tool-calling scenarios.

## Hard TypeScript Breakdown

| Model | LRU cache | Expression parser | Weighted grid Dijkstra | Topological scheduler | Total |
|---|---:|---:|---:|---:|---:|
| Jackrong Qwopus3.6 35B A3B v1 IQ4_XS | 6/6 | 0/7 | 4/6 | 6/6 | 16/25 |
| Jackrong Qwopus3.6 35B A3B v1 Q5_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| TeichAI Gemma4 26B A4B Claude Opus Distill v2 Q5_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |

## Current Takeaway

Jackrong Qwopus3.6 35B A3B v1 Q5_K_M is the best Qwopus35 balance from this set: it keeps most of the speed advantage over Gemma4 Q5 while matching its hard TypeScript score.

## Requested Batch - 2026-05-26

Same benchmark shape as above unless noted. `Image gen` is `N/A` when no usable vision run was completed.

Notes:

- `Smoffyy-GPT-OSS-20B-Instruct-Pure` was run at `--ctx-size 8192` with `--jinja` and `--reasoning auto`; the repo did not provide an `mmproj`.
- `Unsloth-Gemma4-E4B`, `Unsloth-Gemma4-E2B`, `Smoffyy-Gemma4-E4B`, and `Smoffyy-Gemma4-26B-A4B` published `mmproj` files, but llama.cpp rejected them with `image_max_pixels < image_min_pixels`, so those rows were rerun text-only.

| Model | Load mem | Text gen | Image gen | Tool gen | Hard TS | Agent scoped | Agent broad |
|---|---:|---:|---:|---:|---:|---:|---:|
| Unsloth Gemma4 26B A4B it UD Q5_K_M | 26.32 GiB | 46.86 tok/s | 42.96 tok/s | 44.25 tok/s | 23/25 | 60/60 | 56/60 |
| Unsloth Gemma4 E4B it UD Q5_K_XL | 7.70 GiB | 46.07 tok/s | N/A | 42.78 tok/s | 18/25 | 60/60 | 60/60 |
| Unsloth Gemma4 E2B it UD Q5_K_XL | 4.28 GiB | 85.34 tok/s | N/A | 79.85 tok/s | 19/25 | 60/60 | 60/60 |
| Smoffyy Gemma4 E4B Instruct Pure Q5_K_M | 7.51 GiB | 48.03 tok/s | N/A | 45.02 tok/s | 22/25 | 60/60 | 60/60 |
| Smoffyy GPT-OSS 20B Instruct Pure | 13.74 GiB | 47.13 tok/s | N/A | 44.78 tok/s | 23/25 | 53/60 | 56/60 |
| Smoffyy Qwen3.6 35B A3B Revised Q5_K_M | 28.98 GiB | 65.12 tok/s | 59.22 tok/s | 59.38 tok/s | 23/25 | 56/60 | 55/60 |
| Smoffyy Qwen3.6 27B Revised Q4_K_M | 27.38 GiB | 12.80 tok/s | 12.71 tok/s | 12.82 tok/s | 16/25 | 55/60 | 55/60 |
| Smoffyy Gemma4 26B A4B Instruct Pure Q5_K_M | 22.99 GiB | 54.40 tok/s | N/A | 51.12 tok/s | 23/25 | 60/60 | 56/60 |
| Jackrong Qwopus3.5 9B Coder Exp Q5_K_M | 13.21 GiB | 33.87 tok/s | 33.08 tok/s | 33.68 tok/s | 11/25 | 55/60 | 55/60 |
| Smoffyy Qwen3.5 9B Revised Q5_K_M | 13.21 GiB | 33.82 tok/s | 33.04 tok/s | 33.26 tok/s | 5/25 | 55/60 | 60/60 |

### Requested Batch Hard TypeScript Breakdown

| Model | LRU cache | Expression parser | Weighted grid Dijkstra | Topological scheduler | Total |
|---|---:|---:|---:|---:|---:|
| Unsloth Gemma4 26B A4B it UD Q5_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| Unsloth Gemma4 E4B it UD Q5_K_XL | 6/6 | 2/7 | 4/6 | 6/6 | 18/25 |
| Unsloth Gemma4 E2B it UD Q5_K_XL | 4/6 | 5/7 | 4/6 | 6/6 | 19/25 |
| Smoffyy Gemma4 E4B Instruct Pure Q5_K_M | 6/6 | 6/7 | 4/6 | 6/6 | 22/25 |
| Smoffyy GPT-OSS 20B Instruct Pure | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| Smoffyy Qwen3.6 35B A3B Revised Q5_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| Smoffyy Qwen3.6 27B Revised Q4_K_M | 6/6 | 0/7 | 4/6 | 6/6 | 16/25 |
| Smoffyy Gemma4 26B A4B Instruct Pure Q5_K_M | 6/6 | 7/7 | 4/6 | 6/6 | 23/25 |
| Jackrong Qwopus3.5 9B Coder Exp Q5_K_M | 5/6 | 0/7 | 0/6 | 6/6 | 11/25 |
| Smoffyy Qwen3.5 9B Revised Q5_K_M | 0/6 | 0/7 | 4/6 | 1/6 | 5/25 |

### Requested Batch Takeaway

Best high-speed/high-quality row in this batch was `Smoffyy Qwen3.6 35B A3B Revised Q5_K_M`: it matched the 23/25 hard TypeScript leaders while producing about 65 tok/s text and 59 tok/s image. For smaller models, `Smoffyy Gemma4 E4B Instruct Pure Q5_K_M` was the strongest quality result at 22/25 while staying under 8 GiB loaded.
