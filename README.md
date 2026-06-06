# Local LLM Experiments

Benchmarks run locally on Windows with llama.cpp Vulkan. New benchmark results should be added to this README when they are run.

## Hardware

Runs were done on a Strix Halo mini PC:

- System: `GMKtec NucBox_EVO-X2`
- APU: `AMD Ryzen AI Max+ 395 w/ Radeon 8060S (Strix Halo)`
- CPU: `16` cores / `32` threads
- GPU backend: llama.cpp Vulkan on `AMD Radeon(TM) 8060S Graphics`
- System RAM reported by Windows: `32 GiB`
- Vulkan-visible GPU memory in llama.cpp logs: `114507 MiB` total, about `111.82 GiB`, on the Radeon 8060S UMA pool
- llama.cpp device log for these runs reported `Vulkan0 : AMD Radeon(TM) 8060S Graphics` and AVX512-capable CPU paths.

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
- The BenchLoop `Smoffyy GPT-OSS 20B Instruct Pure` row required a stable server profile with prompt/cache reuse disabled: `--cache-ram 0 --no-cache-prompt --ctx-checkpoints 0 --checkpoint-every-n-tokens -1 --slot-prompt-similarity 0.0`. The default prompt-checkpoint path caused llama-server to disappear during early BenchLoop tool prompts.
- The 2026-06-03 requested batch used existing compatible `mmproj` files where they loaded: Gemma E2B with the Unsloth E2B projector, Qwen/Qwopus 27B/35B variants with the matching local 27B/35B projectors, and Holo with the local 35B A3B projector. LFM2.5 was run text-only.
- `Unsloth Gemma4 E4B` and `Unsloth Gemma4 E2B` required `--image-min-tokens 256` for their `mmproj` files to load; the earlier `1024` setting exceeded their image pixel limits.
- QAT Gemma4 E4B/12B rows were run on llama.cpp `b9534`; the E2B QAT and 26B A4B QAT rows were run on `b9535`. All used `--temp 1.0 --top-p 0.95 --top-k 64`, `--ctx-size 262144`, `q8_0/q8_0` KV cache, and `--reasoning off`. The 12B and 26B QAT rows used `--cache-ram 0 --ctx-checkpoints 0` for stable vision/cache behavior.
- `Jackrong Qwopus3.6 27B v2 MTP` rows used `--spec-type draft-mtp --spec-draft-n-min 1 --spec-draft-n-max 2`; the MTP repo did not include an `mmproj`, so vision used `mmproj.gguf` from `Jackrong/Qwopus3.6-27B-v2-GGUF`.
- TeichAI Gemma4 Opus Q5 used `--reasoning auto`.
- KV-cache comparison rows used the same benchmark harness as the main table, changing only `--cache-type-k` and `--cache-type-v`; agent suites were not rerun for KV variants.

## Combined Benchmark Results

### Models Under 8 GiB Mem

| Source / model file | Load mem | Text gen | Image gen | Tool gen | Hard TS | Agent scoped | Agent broad |
|---|---:|---:|---:|---:|---:|---:|---:|
| `unsloth/gemma-4-E2B-it-qat-GGUF` / `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` | 4.24 GiB | 105.28 tok/s | 94.38 tok/s | 94.39 tok/s | 13/25 | N/A | N/A |
| `unsloth/gemma-4-E4B-it-qat-GGUF` / `gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf` | 7.06 GiB | 59.10 tok/s | 56.15 tok/s | 56.15 tok/s | 14/25 | N/A | N/A |
| `unsloth/gemma-4-E4B-it-GGUF` / `gemma-4-E4B-it-IQ4_XS.gguf` | 7.94 GiB | 52.62 tok/s | 48.81 tok/s | 49.70 tok/s | 20/25 | 60/60 | 60/60 |

### Models Under 14 GiB Mem

| Source / model file | Load mem | Text gen | Image gen | Tool gen | Hard TS | Agent scoped | Agent broad |
|---|---:|---:|---:|---:|---:|---:|---:|
| **`unsloth/gemma-4-E4B-it-GGUF` / `gemma-4-E4B-it-Q4_K_M.gguf`** | 8.19 GiB | 52.93 tok/s | 48.43 tok/s | 48.80 tok/s | 23/25 | 60/60 | 60/60 |
| `LiquidAI/LFM2.5-8B-A1B-GGUF` / `LFM2.5-8B-A1B-Q5_K_M.gguf` | 8.90 GiB | 142.28 tok/s | N/A | 140.95 tok/s | 1/25 | 60/60 | 56/60 |
| `Jackrong/Qwopus3.5-4B-v3-GGUF` / `Qwen3.5-4B.Q5_K_M.gguf` | 10.07 GiB | 56.36 tok/s | 53.18 tok/s | 53.33 tok/s | 6/25 | 55/60 | 55/60 |
| `unsloth/Qwen3.5-4B-GGUF` / `Qwen3.5-4B-Q5_K_M.gguf` | 10.13 GiB | 54.90 tok/s | 52.30 tok/s | 52.38 tok/s | 12/25 | 48/60 | 55/60 |
| `unsloth/gemma-4-12B-it-qat-GGUF` / `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` | 10.39 GiB | 25.40 tok/s | 24.56 tok/s | 25.45 tok/s | 23/25 | N/A | N/A |
| `Jackrong/Qwopus3.5-9B-Coder-GGUF` / `Qwopus3.5-9B-coder-Exp-Q5_K_M.gguf` | 13.21 GiB | 33.87 tok/s | 33.08 tok/s | 33.68 tok/s | 11/25 | 55/60 | 55/60 |
| `Smoffyy/gpt-oss-20b-instruct-pure-gguf` / `gpt-oss.gguf` | 13.74 GiB | 47.13 tok/s | N/A | 44.78 tok/s | 23/25 | 53/60 | 56/60 |

### Models Over 14 GiB Mem

| Source / model file | Load mem | Text gen | Image gen | Tool gen | Hard TS | Agent scoped | Agent broad |
|---|---:|---:|---:|---:|---:|---:|---:|
| `unsloth/gemma-4-26B-A4B-it-qat-GGUF` / `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` | 18.80 GiB | 67.89 tok/s | 61.85 tok/s | 64.84 tok/s | 23/25 | N/A | N/A |
| `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-IQ4_XS.gguf` | 23.43 GiB | 70.97 tok/s | 62.81 tok/s | 63.62 tok/s | 16/25 | 60/60 | 60/60 |
| **`TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2-GGUF` / `gemma-4-26B-A4B-it-Claude-Opus-Distill.q5_k_m.gguf`** | 24.27 GiB | 54.14 tok/s | 49.73 tok/s | 50.81 tok/s | 23/25 | 60/60 | 57/60 |
| `Hcompany/Holo-3.1-35B-A3B-GGUF` / `q4_k_m.gguf` | 25.50 GiB | 68.77 tok/s | 64.09 tok/s | 64.62 tok/s | 13/25 | 60/60 | 60/60 |
| `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-Q4_K_M.gguf` | 25.50 GiB | 70.03 tok/s | 62.95 tok/s | 63.05 tok/s | 16/25 | 55/60 | 55/60 |
| `Smoffyy/Qwen3.6-27B-Instruct-Revised-GGUF` / `Qwen3.6-27B-Revised-q4_k_m.gguf` | 27.38 GiB | 12.80 tok/s | 12.71 tok/s | 12.82 tok/s | 16/25 | 55/60 | 55/60 |
| `jcbtc/qwen3.6-35b-a3b-crown-halo-mtp-dynamic` / `Qwen3.6-35B-A3B-HaloStrix-Dyn-MTP-v7.gguf` | 28.42 GiB | 63.37 tok/s | 59.11 tok/s | 58.92 tok/s | 6/25 | 56/60 | 30/60 |
| `Jackrong/Qwopus3.6-27B-v2-MTP-GGUF` / `Qwopus3.6-27B-v2-MTP-IQ4_XS.gguf` | 28.63 GiB | 20.19 tok/s | 21.46 tok/s | 21.80 tok/s | 23/25 | 55/60 | 55/60 |
| **`Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf`** | 28.98 GiB | 65.68 tok/s | 59.20 tok/s | 59.84 tok/s | 23/25 | 60/60 | 60/60 |

## KV Cache Comparison

| Model | KV cache | Load mem | Text gen | Image gen | Tool gen | Hard TS |
|---|---|---:|---:|---:|---:|---:|
| Jackrong Qwopus3.6 35B A3B v1 Q5_K_M | `q4_0/q4_0` | 27.72 GiB | 65.59 tok/s | 59.04 tok/s | 58.86 tok/s | 23/25 |
| Jackrong Qwopus3.6 35B A3B v1 Q5_K_M | `q5_1/q5_1` | 28.16 GiB | 63.67 tok/s | 58.94 tok/s | 59.41 tok/s | 16/25 |
| Jackrong Qwopus3.6 35B A3B v1 Q5_K_M | `q4_0/q8_0` | 28.38 GiB | 64.62 tok/s | 58.90 tok/s | 59.24 tok/s | 20/25 |

## BenchLoop Results

BenchLoop v0.2.3 was run locally through llama.cpp's OpenAI-compatible endpoint with `--harness raw`, `BENCHLOOP_NO_SUBMIT=1`, and suites `speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent`. The Qwopus3.6 27B MTP rows used `--spec-type draft-mtp --spec-draft-n-min 1 --spec-draft-n-max 2`. These scores are not directly comparable with the custom tables above because BenchLoop uses its own tasks and scoring; it also has no image/vision suite.

| Source / model file | Overall | Quality | Speed | Reliability | Gen tok/s | Toolcall | Coding | Data extract | Instruct | Reason/math | Agent |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `unsloth/gemma-4-E2B-it-qat-GGUF` / `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` | 80.4 | 83.1 | 80.7 | 74.2 | 82.72 | 90.0 | 100.0 | 70.7 | 67.8 | 73.3 | 96.9 |
| `unsloth/gemma-4-E4B-it-GGUF` / `gemma-4-E4B-it-IQ4_XS.gguf` | 79.0 | 82.7 | 70.8 | 77.5 | 47.64 | 73.3 | 100.0 | 89.4 | 70.0 | 66.7 | 96.9 |
| `unsloth/gemma-4-E4B-it-qat-GGUF` / `gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf` | 78.4 | 82.8 | 71.3 | 74.2 | 49.25 | 75.0 | 100.0 | 81.8 | 63.3 | 80.0 | 96.9 |
| `unsloth/gemma-4-E4B-it-GGUF` / `gemma-4-E4B-it-Q4_K_M.gguf` | 75.7 | 79.9 | 70.5 | 70.8 | 46.86 | 73.3 | 85.4 | 84.6 | 65.6 | 73.3 | 96.9 |
| `unsloth/gemma-4-E4B-it-GGUF` / `gemma-4-E4B-it-Q5_K_M.gguf` | 78.3 | 83.7 | 68.5 | 74.2 | 41.93 | 73.3 | 100.0 | 83.3 | 75.6 | 73.3 | 96.9 |
| `unsloth/gemma-4-12B-it-qat-GGUF` / `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` | 78.6 | 85.7 | 57.6 | 79.8 | 23.01 | 83.3 | 100.0 | 80.5 | 73.3 | 80.0 | 96.9 |
| `unsloth/gemma-4-26B-A4B-it-qat-GGUF` / `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` | 79.0 | 82.7 | 73.6 | 75.3 | 56.01 | 83.3 | 83.3 | 80.4 | 78.9 | 73.3 | 96.9 |
| `Jackrong/Qwopus3.6-27B-v2-MTP-GGUF` / `Qwopus3.6-27B-v2-MTP-IQ4_XS.gguf` | 75.7 | 82.9 | 55.0 | 76.4 | 19.96 | 85.0 | 75.0 | 72.8 | 87.8 | 80.0 | 96.9 |
| `Jackrong/Qwopus3.6-27B-v2-MTP-GGUF` / `Qwopus3.6-27B-v2-MTP-Q4_K_M.gguf` | 74.0 | 80.1 | 55.7 | 75.3 | 20.69 | 85.0 | 77.1 | 73.3 | 74.4 | 80.0 | 90.6 |
| `TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2-GGUF` / `gemma-4-26B-A4B-it-Claude-Opus-Distill.q5_k_m.gguf` | 65.6 | 65.0 | 70.6 | 62.9 | 47.03 | 83.3 | 93.8 | 42.6 | 33.3 | 40.0 | 96.9 |
| `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` | 72.3 | 73.5 | 73.3 | 68.5 | 54.89 | 81.7 | 83.3 | 46.8 | 65.6 | 73.3 | 90.6 |
| `Jackrong/Qwopus3.5-9B-Coder-GGUF` / `Qwopus3.5-9B-coder-Exp-Q5_K_M.gguf` | 67.8 | 71.7 | 63.2 | 62.9 | 31.34 | 91.7 | 85.4 | 38.5 | 60.0 | 73.3 | 81.2 |
| `Smoffyy/gpt-oss-20b-instruct-pure-gguf` / `gpt-oss.gguf` | 78.4 | 83.2 | 67.9 | 76.4 | 40.55 | 88.3 | 93.8 | 76.4 | 83.3 | 66.7 | 90.6 |
| `LiquidAI/LFM2.5-8B-A1B-GGUF` / `LFM2.5-8B-A1B-Q5_K_M.gguf` | 69.0 | 67.9 | 86.7 | 57.3 | 114.66 | 85.0 | 64.6 | 65.3 | 61.1 | 53.3 | 78.1 |
| `jcbtc/qwen3.6-35b-a3b-crown-halo-mtp-dynamic` / `Qwen3.6-35B-A3B-HaloStrix-Dyn-MTP-v7.gguf` | 26.8 | 15.2 | 73.8 | 14.6 | 56.26 | 38.3 | 0.0 | 0.0 | 0.0 | 0.0 | 53.1 |
| `Hcompany/Holo-3.1-35B-A3B-GGUF` / `q4_k_m.gguf` | 76.6 | 79.0 | 74.7 | 73.0 | 59.33 | 81.7 | 75.0 | 85.7 | 67.8 | 66.7 | 96.9 |

## Qwopus35 Q5 Sampler Sweep

`Jackrong/Qwopus3.6-35B-A3B-v1-GGUF / Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` was rerun on 2026-06-06 with `top_p=0.95`, `top_k=20`, `q8_0/q8_0` KV cache, `--ctx-size 262144`, and llama.cpp `b9535`. The custom benchmark used `CodeMaxTokens 7168`.

| Temp | Load mem | Text gen | Image gen | Tool gen | Hard TS | BenchLoop overall | BenchLoop quality | BenchLoop gen | BenchLoop coding | BenchLoop toolcall | BenchLoop agent |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.85 | 28.25 GiB | 58.82 tok/s | 58.51 tok/s | 59.95 tok/s | 23/25 | 74.2 | 75.8 | 57.19 tok/s | 77.1 | 88.3 | 96.9 |
| 0.88 | 28.25 GiB | 63.27 tok/s | 59.64 tok/s | 59.57 tok/s | 16/25 | 74.3 | 75.8 | 58.41 tok/s | 77.1 | 88.3 | 96.9 |
| 0.90 | 28.25 GiB | 63.44 tok/s | 59.25 tok/s | 59.49 tok/s | 16/25 | 74.2 | 75.8 | 57.98 tok/s | 77.1 | 88.3 | 96.9 |
| 0.92 | 28.25 GiB | 61.80 tok/s | 59.49 tok/s | 59.99 tok/s | 16/25 | 74.3 | 75.8 | 58.90 tok/s | 77.1 | 88.3 | 96.9 |
| 0.95 | 28.25 GiB | 63.19 tok/s | 59.32 tok/s | 60.06 tok/s | 10/25 | 74.3 | 75.8 | 58.63 tok/s | 77.1 | 88.3 | 96.9 |
| 1.00 | 28.25 GiB | 63.25 tok/s | 59.50 tok/s | 60.17 tok/s | 16/25 | 74.3 | 75.8 | 58.28 tok/s | 77.1 | 88.3 | 96.9 |

## Current Takeaways

- Best under 8 GiB: `Unsloth Gemma4 E4B it IQ4_XS` is the strongest retained small model by custom Hard TS quality at `20/25`; `Unsloth Gemma4 E2B it QAT UD-Q4_K_XL` is the speed/BenchLoop standout at `105.28 tok/s` custom text and `80.4` BenchLoop overall, but only `13/25` on the harder TypeScript set.
- Compact E4B note: `IQ4_XS` is the best tested sub-8 GiB E4B quant at `20/25` Hard TS with working vision and full agent scores.
- Best under 14 GiB: `Unsloth Gemma4 E4B it Q4_K_M` is now the best all-around result in this bucket: `23/25`, `52.93 tok/s` text, working vision, and `60/60` on both agent tests.
- BenchLoop highlighted-model result: `Unsloth Gemma4 E4B it IQ4_XS` had the best BenchLoop overall score (`79.0`) and quality score (`82.7`) among the tested highlighted/small E4B models, with a perfect BenchLoop coding score (`100.0`) and strong data extraction (`89.4`).
- BenchLoop Gemma E4B Q5 note: `Unsloth Gemma4 E4B it Q5_K_M` raised the E4B quality score to `83.7` and kept perfect coding/agent results, but the lower speed (`41.93 tok/s`) kept overall just behind IQ4_XS.
- QAT E4B note: `Unsloth Gemma4 E4B it QAT UD-Q4_K_XL` is fast for its memory class (`59.10 tok/s` custom text, `49.25 tok/s` BenchLoop) and has perfect BenchLoop coding, but its custom Hard TS score was weak at `14/25`.
- QAT 12B note: `Unsloth Gemma4 12B it QAT UD-Q4_K_XL` is a strong retained mid-size Gemma row with `23/25` custom Hard TS, `78.6` BenchLoop overall, and about `10.39 GiB` load memory.
- QAT 26B note: `Unsloth Gemma4 26B A4B it QAT UD-Q4_K_XL` is the strongest Gemma BenchLoop row so far at `79.0` overall, with working vision, `23/25` custom Hard TS, `67.89 tok/s` custom text, and `18.80 GiB` load memory.
- BenchLoop Qwopus27 note: `Jackrong Qwopus3.6 27B v2 MTP IQ4_XS` remains the better Qwopus27 BenchLoop row overall (`75.7` vs `74.0`), while Q4_K_M was slightly faster (`20.69 tok/s`) but weaker on instruction/agent scores.
- BenchLoop GPT-OSS note: `Smoffyy GPT-OSS 20B Instruct Pure` is now the second-best BenchLoop overall row (`78.4`) and the best newly added row, with strong coding (`93.8`), toolcall (`88.3`), and data extraction (`76.4`), but it needed the stable no-cache/no-checkpoint server profile above.
- BenchLoop LFM note: the 2026-06-03 rerun of `LiquidAI LFM2.5 8B A1B Q5_K_M` improved sharply to `69.0` overall and `67.9` quality at `114.66 tok/s`; it is still weak on the custom Hard TS test (`1/25`).
- New requested large-model note: `Hcompany Holo 3.1 35B A3B Q4_K_M` was the strongest new large row overall: working vision, `13/25` Hard TS, `60/60` on both custom agent passes, and `76.6` BenchLoop overall with `96.9` BenchLoop agent.
- New requested MTP caution: the jcbtc HaloStrix MTP variant loaded and ran, but its custom Hard TS score was poor at `6/25`.
- BenchLoop Qwopus3.5 Coder note: `Jackrong Qwopus3.5 9B Coder Exp Q5_K_M` had good toolcall (`91.7`) and coding (`85.4`) scores, but it was very verbose in BenchLoop and took about 30.5 minutes to finish at `31.34 tok/s`.
- BenchLoop caution: `TeichAI Gemma4 26B A4B Opus Distill Q5_K_M` scored highest on BenchLoop coding (`93.8`) and matched the best agent score (`96.9`), but its instruction-following and reason/math scores were weak in this harness.
- In the E4B quant batch, `Q4_K_M` is the remaining standout: `23/25` Hard TS with full agent scores.
- KV cache result: `q4_0/q4_0` was the only tested lower-memory KV setting that preserved `23/25` Hard TS on the two larger highlighted models.
- KV cache caution: the smaller highlighted Gemma models lost substantial Hard TS score with all three tested lower-precision KV settings, so their main `q8_0/q8_0` rows remain the safer quality choice.
- Best over 14 GiB: `Jackrong Qwopus3.6 35B A3B v1 Q5_K_M` had the best all-around mix: `23/25`, strong vision speed, and `60/60` on both agent tests.
- Qwopus35 Q5 sampler sweep: `temp=0.85` is the best retained coding setting in this sweep (`23/25` Hard TS). BenchLoop was almost flat from `0.85` through `1.00`, but the custom hard TypeScript benchmark degraded above `0.85`.
- Best Qwopus3.6 27B v2 row: `MTP IQ4_XS` clearly won this batch with `23/25` Hard TS and around `20-22 tok/s`.
- The non-MTP replacement rows are generally stronger than the deleted MTP rows on this benchmark, especially `Jackrong Qwopus3.6 35B A3B v1 Q4_K_M`, which restored vision and improved Hard TS from `10/25` to `16/25`.
