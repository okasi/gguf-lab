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
- QAT Gemma4 E4B/12B rows were run on llama.cpp `b9534`; the E2B QAT, 26B A4B QAT, and 31B QAT rows were run on `b9535`. All used `--temp 1.0 --top-p 0.95 --top-k 64`, `--ctx-size 262144`, `q8_0/q8_0` KV cache, and `--reasoning off`. The 12B, 26B, and 31B QAT rows used `--cache-ram 0 --ctx-checkpoints 0` for stable vision/cache behavior.
- `Jackrong Qwopus3.6 27B v2 MTP` rows used `--spec-type draft-mtp --spec-draft-n-min 1 --spec-draft-n-max 2`; the 2026-06-06 sampler sweep used `mmproj-F32.gguf` from the MTP repo snapshot.

## Benchmark Results

BenchLoop v0.2.3 was run locally through llama.cpp's OpenAI-compatible endpoint with `--harness raw`, `BENCHLOOP_NO_SUBMIT=1`, and suites `speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent`. BenchLoop has no image/vision suite, so `Image gen` comes from the custom harness only.

CHADROCK35 uses the custom `charlie12345/rocmfp4-llama` Vulkan0 runtime with `temp=0.91`, `top_p=0.9`, `top_k=20`, `--reasoning off`, and `--reasoning-format deepseek`. HIP was fixed separately with AMD HIP SDK 7.1.1, MSVC Build Tools, and the Windows SDK; `hipcc` works, `hipInfo` sees `gfx1151`, and the custom fork builds a HIP server at `tools\rocmfp4-llama\build-rocmfp4-hip-win-msvc`. CHADROCK35 still failed the HIP runtime smoke during model load with `ROCm error: unspecified launch failure`, so its trusted row remains Vulkan0.

| Mem bucket | Source / model file | Load mem | Text gen | Image gen | Tool gen | Hard TS | Agent scoped | Agent broad | BL overall | BL quality | BL gen | BL coding | BL toolcall | BL agent |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Under 8 GiB | `unsloth/gemma-4-E2B-it-qat-GGUF` / `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` | 4.24 GiB | 105.28 tok/s | 94.38 tok/s | 94.39 tok/s | 13/25 | N/A | N/A | 80.4 | 83.1 | 82.72 tok/s | 100.0 | 90.0 | 96.9 |
| Under 8 GiB | `unsloth/gemma-4-E4B-it-qat-GGUF` / `gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf` | 7.06 GiB | 59.10 tok/s | 56.15 tok/s | 56.15 tok/s | 14/25 | N/A | N/A | 78.4 | 82.8 | 49.25 tok/s | 100.0 | 75.0 | 96.9 |
| Under 14 GiB | `LiquidAI/LFM2.5-8B-A1B-GGUF` / `LFM2.5-8B-A1B-Q5_K_M.gguf` | 8.90 GiB | 142.28 tok/s | N/A | 140.95 tok/s | 1/25 | 60/60 | 56/60 | 69.0 | 67.9 | 114.66 tok/s | 64.6 | 85.0 | 78.1 |
| Under 14 GiB | `Jackrong/Qwopus3.5-4B-v3-GGUF` / `Qwen3.5-4B.Q5_K_M.gguf` | 10.07 GiB | 56.36 tok/s | 53.18 tok/s | 53.33 tok/s | 6/25 | 55/60 | 55/60 | N/A | N/A | N/A | N/A | N/A | N/A |
| Under 14 GiB | `unsloth/Qwen3.5-4B-GGUF` / `Qwen3.5-4B-Q5_K_M.gguf` | 10.13 GiB | 54.90 tok/s | 52.30 tok/s | 52.38 tok/s | 12/25 | 48/60 | 55/60 | N/A | N/A | N/A | N/A | N/A | N/A |
| Under 14 GiB | `unsloth/gemma-4-12B-it-qat-GGUF` / `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` | 10.39 GiB | 25.40 tok/s | 24.56 tok/s | 25.45 tok/s | 23/25 | N/A | N/A | 78.6 | 85.7 | 23.01 tok/s | 100.0 | 83.3 | 96.9 |
| Under 14 GiB | `Jackrong/Qwopus3.5-9B-Coder-GGUF` / `Qwopus3.5-9B-coder-Exp-Q5_K_M.gguf` | 13.21 GiB | 33.87 tok/s | 33.08 tok/s | 33.68 tok/s | 11/25 | 55/60 | 55/60 | 67.8 | 71.7 | 31.34 tok/s | 85.4 | 91.7 | 81.2 |
| Under 14 GiB | `Smoffyy/gpt-oss-20b-instruct-pure-gguf` / `gpt-oss.gguf` | 13.74 GiB | 47.13 tok/s | N/A | 44.78 tok/s | 23/25 | 53/60 | 56/60 | 78.4 | 83.2 | 40.55 tok/s | 93.8 | 88.3 | 90.6 |
| Over 14 GiB | `unsloth/gemma-4-26B-A4B-it-qat-GGUF` / `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` | 18.80 GiB | 67.89 tok/s | 61.85 tok/s | 64.84 tok/s | 23/25 | N/A | N/A | 79.0 | 82.7 | 56.01 tok/s | 83.3 | 83.3 | 96.9 |
| Over 14 GiB | `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-IQ4_XS.gguf` | 23.43 GiB | 70.97 tok/s | 62.81 tok/s | 63.62 tok/s | 16/25 | 60/60 | 60/60 | N/A | N/A | N/A | N/A | N/A | N/A |
| Over 14 GiB | `Hcompany/Holo-3.1-35B-A3B-GGUF` / `q4_k_m.gguf` | 25.50 GiB | 68.77 tok/s | 64.09 tok/s | 64.62 tok/s | 13/25 | 60/60 | 60/60 | 76.6 | 79.0 | 59.33 tok/s | 75.0 | 81.7 | 96.9 |
| Over 14 GiB | `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-Q4_K_M.gguf` | 25.50 GiB | 70.03 tok/s | 62.95 tok/s | 63.05 tok/s | 16/25 | 55/60 | 55/60 | N/A | N/A | N/A | N/A | N/A | N/A |
| Over 14 GiB | `Smoffyy/Qwen3.6-27B-Instruct-Revised-GGUF` / `Qwen3.6-27B-Revised-q4_k_m.gguf` | 27.38 GiB | 12.80 tok/s | 12.71 tok/s | 12.82 tok/s | 16/25 | 55/60 | 55/60 | N/A | N/A | N/A | N/A | N/A | N/A |
| Over 14 GiB | `Jackrong/Qwopus3.6-27B-v2-MTP-GGUF` / `Qwopus3.6-27B-v2-MTP-IQ4_XS.gguf` | 28.63 GiB | 20.19 tok/s | 21.46 tok/s | 21.80 tok/s | 23/25 | 55/60 | 55/60 | 75.7 | 82.9 | 19.96 tok/s | 75.0 | 85.0 | 96.9 |
| Over 14 GiB | `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` | 28.98 GiB | 65.68 tok/s | 59.20 tok/s | 59.84 tok/s | 23/25 | 60/60 | 60/60 | 72.3 | 73.5 | 54.89 tok/s | 83.3 | 81.7 | 90.6 |
| Over 14 GiB | `unsloth/gemma-4-31B-it-qat-GGUF` / `gemma-4-31B-it-qat-UD-Q4_K_XL.gguf` | 30.56 GiB | 11.69 tok/s | 11.88 tok/s | 12.40 tok/s | 23/25 | N/A | N/A | 78.3 | 88.9 | 11.21 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `jcbtc/CHADROCK3.6-35B-UNCENSORED-MTP-STRIX-LEAN` / `CHADROCK3.6-35B-UNCENSORED-MTP-STRIX-LEAN.gguf` | N/A | 87.77 tok/s | N/A | N/A | 21/25 | N/A | N/A | 78.5 | 82.4 | 51.57 tok/s | 100.0 | 81.7 | 96.9 |

