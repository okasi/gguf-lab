# Local LLM Experiments

Benchmarks run locally on Windows with llama.cpp Vulkan. New benchmark results should be added to this README when they are run.

Shared LAN tooling (`lan-adapter.js`, `lan-models.json`) lives at the repo root. Windows scripts, llama.cpp builds, and benchmark harnesses live in [`windows-strix-halo/`](windows-strix-halo/). macOS M1 Pro Gemma 4 QAT / MTP BenchLoop runs live in [`macos-m1-pro/`](macos-m1-pro/).

The Gemma 4 optimized Fastify BenchLoop harness lives in [`gemma4_benchloop_harness_fastify/`](gemma4_benchloop_harness_fastify/).

## macOS M1 Pro (Metal)

Apple M1 Pro, 32 GB unified memory, llama.cpp Metal. Full tables: [`macos-m1-pro/README.md`](macos-m1-pro/README.md) and [`macos-m1-pro/results/benchloop/gemma4-12b-qat-full-summary.md`](macos-m1-pro/results/benchloop/gemma4-12b-qat-full-summary.md).

| config | overall | gen tok/s | runtime |
|---|---:|---:|---:|
| No MTP f16 (`-c 4096`) | 77.8 | 15.70 | 1477s |
| No MTP KV Q8 (`-c 0`) | 76.9 | 14.12 | 1735s |
| **Unsloth MTP nmax2 f16** | **78.9** | **21.65** | **957s** |
| Unsloth MTP nmax2 + Fastify harness | **81.0** | — | ~941s |
| Unsloth MTP nmax2 KV Q8 | 76.9 | 15.83 | 1723s |

## Hardware

Runs were done on a Strix Halo mini PC:

- System: `GMKtec NucBox_EVO-X2`
- APU: `AMD Ryzen AI Max+ 395 w/ Radeon 8060S (Strix Halo)`
- CPU: `16` cores / `32` threads
- GPU backend: llama.cpp Vulkan
- System RAM reported by Windows: `32 GiB`
- Vulkan-visible GPU memory in llama.cpp logs: `114507 MiB` total, about `111.82 GiB`, on the Radeon 8060S UMA pool

Unless noted otherwise, runs used:

- `--ctx-size` set to each model's native maximum (see **Max ctx** column; most rows use `262144`)
- `--cache-type-k q8_0`
- `--cache-type-v q8_0`
- `--ngl 99`
- `-np 1`
- `--flash-attn on`
- `--reasoning auto`
- `--temp 0.75` (Qwopus family: `0.85`; see `windows-strix-halo/AGENTS.md`)
- `--top-p 0.95`
- `--top-k 20`
- `--presence-penalty 0.0`
- `--seed 3407`
- `-n 32768`

Notes:

- Vision runs used the matching `mmproj` when it loaded successfully.
- `Image gen` is `N/A` when no usable vision run was completed.
- Jackrong Qwopus3.6 35B files are from `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF`; they support vision through `mmproj.gguf`, but the repo is not marked MTP-preserved, so these were run without speculative MTP flags.
- `Smoffyy GPT-OSS 20B Instruct Pure` used `--jinja`; the repo did not provide an `mmproj`. Native context is `131072` per the [gpt-oss model card](https://arxiv.org/html/2508.10925) and GGUF `n_ctx_train`.
- The 2026-06-09 refresh reran every kept README row with `q8_0/q8_0` KV cache, model-card or family sampler settings, hard TypeScript max output at `7168`, and llama.cpp `b9535` Vulkan except CHADROCK35, which uses its custom Vulkan runtime.
- The BenchLoop `Smoffyy GPT-OSS 20B Instruct Pure` row required a stable server profile with prompt/cache reuse disabled: `--cache-ram 0 --no-cache-prompt --ctx-checkpoints 0 --slot-prompt-similarity 0.0`. The newer llama.cpp build rejected the older `--checkpoint-every-n-tokens` flag.
- The 2026-06-03 requested batch used existing compatible `mmproj` files where they loaded: Gemma E2B with the Unsloth E2B projector, Qwen/Qwopus 27B/35B variants with the matching local 27B/35B projectors, and Holo with the local 35B A3B projector.
- `Unsloth Gemma4 E4B` and `Unsloth Gemma4 E2B` required `--image-min-tokens 256` for their `mmproj` files to load; the earlier `1024` setting exceeded their image pixel limits.
- Gemma4 QAT rows used `--temp 1.0 --top-p 0.95 --top-k 64` and `q8_0/q8_0` KV cache. Per the [Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4), E2B/E4B native context is 128K (`131072`); 12B, 26B A4B, and 31B native context is 256K (`262144`). Local Unsloth QAT GGUFs match those `n_ctx_train` values. The 12B, 26B, and 31B QAT rows used `--cache-ram 0 --ctx-checkpoints 0` for stable vision/cache behavior.
- Qwen3.6/Qwopus/Holo/CHADROCK rows use native `262144` context per the [Qwen3.6](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) model card and matching GGUF `n_ctx_train`.
- `Jackrong Qwopus3.6 27B v2 MTP` rows used `--spec-type draft-mtp --spec-draft-n-min 1 --spec-draft-n-max 2`; the 2026-06-06 sampler sweep used `mmproj-F32.gguf` from the MTP repo snapshot.

## Benchmark Results

BenchLoop v0.2.3 was run locally through llama.cpp's OpenAI-compatible endpoint with `--harness raw`, `BENCHLOOP_NO_SUBMIT=1`, and suites `speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent`. BenchLoop has no image/vision suite, so `Image gen` comes from the custom harness only.

CHADROCK35 uses the custom `charlie12345/rocmfp4-llama` Vulkan0 runtime with the Qwopus sampler (`temp=0.85`, `top_p=0.95`, `top_k=20`), plus `--reasoning auto` and `--reasoning-format deepseek`. HIP was fixed separately with AMD HIP SDK 7.1.1, MSVC Build Tools, and the Windows SDK; `hipcc` works, `hipInfo` sees `gfx1151`, and the custom fork builds a HIP server at `windows-strix-halo\tools\rocmfp4-llama\build-rocmfp4-hip-win-msvc`. CHADROCK35 still failed the HIP runtime smoke during model load with `ROCm error: unspecified launch failure`, so its trusted row remains Vulkan0.

Sampler column uses `temp / top_p / top_k`. Every row uses `--reasoning auto`, `presence_penalty=0`, and the largest practical `--ctx-size` on this hardware (`262144` unless noted in `Max ctx`). Benchmark scores are from the 2026-06-09 refresh; some rows were originally run with shorter context or reasoning disabled before these defaults were adopted.

`Model / file` uses `family / on-disk.gguf` when the GGUF filename alone is ambiguous.

| Mem bucket | Model / file | Max ctx | Sampler settings | Load mem | Text gen | Image gen | Tool gen | Hard TS | BL overall | BL quality | BL gen | BL coding | BL toolcall | BL agent |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Under 8 GiB | `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` | 131072 | `1.0 / 0.95 / 64` | 4.26 GiB | 97.86 tok/s | 95.68 tok/s | 94.56 tok/s | 9/25 | 73.7 | 75.8 | 86.11 tok/s | 85.4 | 71.7 | 96.9 |
| Under 8 GiB | `gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf` | 131072 | `1.0 / 0.95 / 64` | 7.00 GiB | 55.58 tok/s | 53.17 tok/s | 53.28 tok/s | 11/25 | 74.4 | 79.1 | 49.38 tok/s | 91.7 | 75.0 | 93.8 |
| Under 14 GiB | `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64` | 10.39 GiB | 25.40 tok/s | 24.79 tok/s | 25.59 tok/s | 23/25 | 77.4 | 84.1 | 23.19 tok/s | 100.0 | 83.3 | 96.9 |
| Under 14 GiB | `Qwopus3.5-9B-coder-Exp-Q5_K_M.gguf` | 262144 | `0.85 / 0.95 / 20` | 11.40 GiB | 34.06 tok/s | N/A | 33.68 tok/s | 12/25 | 69.4 | 73.3 | 32.77 tok/s | 77.1 | 96.7 | 81.2 |
| Under 14 GiB | `gpt-oss.gguf` | 131072 | `0.7 / 0.95 / 20` | 13.41 GiB | 48.02 tok/s | N/A | 46.90 tok/s | 23/25 | 80.8 | 86.8 | 41.74 tok/s | 93.8 | 83.3 | 90.6 |
| Over 14 GiB | `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64` | 18.82 GiB | 72.56 tok/s | 65.37 tok/s | 65.77 tok/s | 16/25 | 80.6 | 84.2 | 58.95 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-IQ4_XS.gguf` | 262144 | `0.85 / 0.95 / 20` | 22.71 GiB | 67.03 tok/s | 65.07 tok/s | 65.36 tok/s | 11/25 | 75.4 | 75.8 | 62.63 tok/s | 91.7 | 81.7 | 96.9 |
| Over 14 GiB | `Holo-3.1-35B-A3B / q4_k_m.gguf` | 262144 | `0.85 / 0.95 / 20` | 24.78 GiB | 68.68 tok/s | 65.57 tok/s | 66.13 tok/s | 12/25 | 78.2 | 81.3 | 63.05 tok/s | 79.2 | 81.7 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-Q4_K_M.gguf` | 262144 | `0.85 / 0.95 / 20` | 24.78 GiB | 72.59 tok/s | 65.00 tok/s | 65.32 tok/s | 16/25 | 70.4 | 70.4 | 62.59 tok/s | 75.0 | 81.7 | 90.6 |
| Over 14 GiB | `Qwopus3.6-27B-v2-MTP-IQ4_XS.gguf` | 262144 | `0.85 / 0.95 / 20`, `MTP draft 1-2` | 27.65 GiB | 19.07 tok/s | 23.36 tok/s | 24.81 tok/s | 18/25 | 77.0 | 83.3 | 21.08 tok/s | 83.3 | 96.7 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` | 262144 | `0.85 / 0.95 / 20` | 28.25 GiB | 66.39 tok/s | 61.09 tok/s | 61.32 tok/s | 20/25 | 70.3 | 70.0 | 58.70 tok/s | 54.2 | 88.3 | 93.8 |
| Over 14 GiB | `gemma-4-31B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64` | 30.58 GiB | 11.95 tok/s | 12.07 tok/s | 12.48 tok/s | 23/25 | 79.2 | 89.5 | 11.23 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `CHADROCK3.6-35B-UNCENSORED-MTP-STRIX-LEAN.gguf` | 262144 | `0.85 / 0.95 / 20`, `deepseek format`, `MTP` | 23.84 GiB | 63.11 tok/s | N/A | 83.22 tok/s | 22/25 | 77.8 | 81.4 | 53.22 tok/s | 93.8 | 81.7 | 96.9 |

## Benchmark Results (reasoning off)

Same harness and hardware as the table above, but every row uses `--reasoning off`. Gemma rows also use `--chat-template-kwargs '{"enable_thinking":false}'`. Gemma4 QAT rows use llama.cpp `b9551` with Unsloth MTP drafters at `--spec-draft-n-max 2`. BenchLoop scores are from the 2026-06-10 reasoning-off refresh; rerun with `Run-Readme-NoReasoning.ps1` and refresh this section via `Export-ReadmeNoReasoningTable.ps1`.

<!-- reasoning-off-table-start -->
| Mem bucket | Model / file | Max ctx | Sampler settings | Load mem | Text gen | Image gen | Tool gen | Hard TS | BL overall | BL quality | BL gen | BL coding | BL toolcall | BL agent |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Under 8 GiB | `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` | 131072 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | 3.99 GiB | 121.54 tok/s | 176.33 tok/s | 220.57 tok/s | 9/25 | 81.1 | 84.1 | 82.63 tok/s | 100.0 | 90.0 | 96.9 |
| Under 14 GiB | `gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf` | 131072 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | 10.71 GiB | 87.15 tok/s | 80.87 tok/s | 105.74 tok/s | 16/25 | 77.5 | 82.9 | 44.22 tok/s | 100.0 | 75.0 | 96.9 |
| Under 14 GiB | `Qwopus3.5-9B-coder-Exp-Q5_K_M.gguf` | 262144 | `0.85 / 0.95 / 20` | 11.40 GiB | 34.24 tok/s | N/A | 33.90 tok/s | 0/25 | 72.9 | 77.2 | 31.72 tok/s | 75.0 | 96.7 | 93.8 |
| Under 14 GiB | `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | 11.45 GiB | 42.23 tok/s | 42.95 tok/s | 46.28 tok/s | 22/25 | 79.5 | 84.8 | 37.60 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `gpt-oss.gguf` | 131072 | `0.7 / 0.95 / 20` | 15.16 GiB | 49.08 tok/s | N/A | 47.43 tok/s | 23/25 | 78.5 | 83.5 | 40.24 tok/s | 93.8 | 88.3 | 90.6 |
| Over 14 GiB | `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | 19.85 GiB | 77.48 tok/s | 74.59 tok/s | 87.09 tok/s | 22/25 | 79.2 | 83.0 | 59.24 tok/s | 91.7 | 83.3 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-IQ4_XS.gguf` | 262144 | `0.85 / 0.95 / 20` | 22.71 GiB | 72.29 tok/s | 64.16 tok/s | 65.15 tok/s | 18/25 | 79.8 | 83.8 | 54.17 tok/s | 93.8 | 90.0 | 96.9 |
| Over 14 GiB | `CHADROCK3.6-35B-UNCENSORED-MTP-STRIX-LEAN.gguf` | 262144 | `0.85 / 0.95 / 20`, `MTP` | 23.84 GiB | 64.58 tok/s | N/A | 81.72 tok/s | 21/25 | 77.1 | 81.0 | 47.58 tok/s | 100.0 | 81.7 | 96.9 |
| Over 14 GiB | `Holo-3.1-35B-A3B / q4_k_m.gguf` | 262144 | `0.85 / 0.95 / 20` | 24.78 GiB | 71.84 tok/s | 65.89 tok/s | 66.06 tok/s | 6/25 | 77.9 | 81.5 | 53.86 tok/s | 100.0 | 80.0 | 93.8 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-Q4_K_M.gguf` | 262144 | `0.85 / 0.95 / 20` | 24.78 GiB | 71.80 tok/s | 65.42 tok/s | 66.10 tok/s | 20/25 | 81.3 | 85.6 | 54.87 tok/s | 100.0 | 93.3 | 96.9 |
| Over 14 GiB | `Qwopus3.6-27B-v2-MTP-IQ4_XS.gguf` | 262144 | `0.85 / 0.95 / 20`, `MTP draft 1-2` | 27.65 GiB | 19.28 tok/s | 22.03 tok/s | 26.77 tok/s | 12/25 | 77.4 | 85.7 | 19.52 tok/s | 100.0 | 90.0 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` | 262144 | `0.85 / 0.95 / 20` | 28.25 GiB | 66.50 tok/s | 60.37 tok/s | 61.48 tok/s | 18/25 | 81.4 | 85.7 | 51.02 tok/s | 100.0 | 93.3 | 96.9 |
| Over 14 GiB | `gemma-4-31B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | 31.68 GiB | 23.20 tok/s | 25.55 tok/s | 28.96 tok/s | 23/25 | 80.2 | 88.9 | 19.58 tok/s | 100.0 | 83.3 | 96.9 |
<!-- reasoning-off-table-end -->