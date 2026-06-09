# Local LLM Experiments

Benchmarks run locally on Windows with llama.cpp Vulkan. New benchmark results should be added to this README when they are run.

Shared LAN tooling (`lan-adapter.js`, `lan-models.json`) lives at the repo root. Windows scripts, llama.cpp builds, and benchmark harnesses live in [`windows-strix-halo/`](windows-strix-halo/).

## Hardware

Runs were done on a Strix Halo mini PC:

- System: `GMKtec NucBox_EVO-X2`
- APU: `AMD Ryzen AI Max+ 395 w/ Radeon 8060S (Strix Halo)`
- CPU: `16` cores / `32` threads
- GPU backend: llama.cpp Vulkan
- System RAM reported by Windows: `32 GiB`
- Vulkan-visible GPU memory in llama.cpp logs: `114507 MiB` total, about `111.82 GiB`, on the Radeon 8060S UMA pool

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

Notes:

- Vision runs used the matching `mmproj` when it loaded successfully.
- `Image gen` is `N/A` when no usable vision run was completed.
- Jackrong Qwopus3.6 35B files are from `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF`; they support vision through `mmproj.gguf`, but the repo is not marked MTP-preserved, so these were run without speculative MTP flags.
- `Smoffyy GPT-OSS 20B Instruct Pure` was run at `--ctx-size 8192` with `--jinja` and `--reasoning auto`; the repo did not provide an `mmproj`.
- The 2026-06-09 refresh reran every kept README row with `q8_0/q8_0` KV cache, model-card or family sampler settings, hard TypeScript max output at `7168`, and llama.cpp `b9535` Vulkan except CHADROCK35, which uses its custom Vulkan runtime. `Smoffyy/Qwen3.6-27B-Instruct-Revised-GGUF` finished the custom benchmark but its BenchLoop row was stopped after a long active timeout.
- The BenchLoop `Smoffyy GPT-OSS 20B Instruct Pure` row required a stable server profile with prompt/cache reuse disabled: `--cache-ram 0 --no-cache-prompt --ctx-checkpoints 0 --slot-prompt-similarity 0.0`. The newer llama.cpp build rejected the older `--checkpoint-every-n-tokens` flag.
- `Nex-N2-mini` was tested through `eramax/Nex-N2-mini-gguf` plus `Akicou/Nex-N2-mini-GGUF` `mmproj`; the official card recommends a custom SGLang fork, so this row represents local llama.cpp/Vulkan GGUF behavior rather than the upstream preferred runtime.
- The 2026-06-03 requested batch used existing compatible `mmproj` files where they loaded: Gemma E2B with the Unsloth E2B projector, Qwen/Qwopus 27B/35B variants with the matching local 27B/35B projectors, and Holo with the local 35B A3B projector. LFM2.5 was run text-only.
- `Unsloth Gemma4 E4B` and `Unsloth Gemma4 E2B` required `--image-min-tokens 256` for their `mmproj` files to load; the earlier `1024` setting exceeded their image pixel limits.
- Gemma4 QAT rows used `--temp 1.0 --top-p 0.95 --top-k 64`, `--ctx-size 262144`, `q8_0/q8_0` KV cache, and `--reasoning off`. The 12B, 26B, and 31B QAT rows used `--cache-ram 0 --ctx-checkpoints 0` for stable vision/cache behavior.
- `Jackrong Qwopus3.6 27B v2 MTP` rows used `--spec-type draft-mtp --spec-draft-n-min 1 --spec-draft-n-max 2`; the 2026-06-06 sampler sweep used `mmproj-F32.gguf` from the MTP repo snapshot.

## Benchmark Results

BenchLoop v0.2.3 was run locally through llama.cpp's OpenAI-compatible endpoint with `--harness raw`, `BENCHLOOP_NO_SUBMIT=1`, and suites `speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent`. BenchLoop has no image/vision suite, so `Image gen` comes from the custom harness only.

CHADROCK35 uses the custom `charlie12345/rocmfp4-llama` Vulkan0 runtime with `temp=0.91`, `top_p=0.9`, `top_k=20`, `--reasoning off`, and `--reasoning-format deepseek`. HIP was fixed separately with AMD HIP SDK 7.1.1, MSVC Build Tools, and the Windows SDK; `hipcc` works, `hipInfo` sees `gfx1151`, and the custom fork builds a HIP server at `windows-strix-halo\tools\rocmfp4-llama\build-rocmfp4-hip-win-msvc`. CHADROCK35 still failed the HIP runtime smoke during model load with `ROCm error: unspecified launch failure`, so its trusted row remains Vulkan0.

| Mem bucket | Source / model file | Load mem | Text gen | Image gen | Tool gen | Hard TS | BL overall | BL quality | BL gen | BL coding | BL toolcall | BL agent |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Under 8 GiB | `unsloth/gemma-4-E2B-it-qat-GGUF` / `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` | 4.26 GiB | 97.86 tok/s | 95.68 tok/s | 94.56 tok/s | 9/25 | 73.7 | 75.8 | 86.11 tok/s | 85.4 | 71.7 | 96.9 |
| Under 8 GiB | `unsloth/gemma-4-E4B-it-qat-GGUF` / `gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf` | 7.00 GiB | 55.58 tok/s | 53.17 tok/s | 53.28 tok/s | 11/25 | 74.4 | 79.1 | 49.38 tok/s | 91.7 | 75.0 | 93.8 |
| Under 8 GiB | `LiquidAI/LFM2.5-8B-A1B-GGUF` / `LFM2.5-8B-A1B-Q5_K_M.gguf` | 7.11 GiB | 123.70 tok/s | N/A | 120.61 tok/s | 0/25 | 69.4 | 68.6 | 115.88 tok/s | 58.3 | 73.3 | 81.2 |
| Under 14 GiB | `Jackrong/Qwopus3.5-4B-v3-GGUF` / `Qwen3.5-4B.Q5_K_M.gguf` | 9.34 GiB | 55.74 tok/s | 53.64 tok/s | 53.74 tok/s | 2/25 | 69.8 | 69.8 | 52.85 tok/s | 64.6 | 90.0 | 96.9 |
| Under 14 GiB | `unsloth/Qwen3.5-4B-GGUF` / `Qwen3.5-4B-Q5_K_M.gguf` | 9.41 GiB | 55.74 tok/s | 52.89 tok/s | 53.26 tok/s | 6/25 | 62.1 | 60.0 | 51.49 tok/s | 85.4 | 86.7 | 90.6 |
| Under 14 GiB | `unsloth/gemma-4-12B-it-qat-GGUF` / `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` | 10.39 GiB | 25.40 tok/s | 24.79 tok/s | 25.59 tok/s | 23/25 | 77.4 | 84.1 | 23.19 tok/s | 100.0 | 83.3 | 96.9 |
| Under 14 GiB | `Jackrong/Qwopus3.5-9B-Coder-GGUF` / `Qwopus3.5-9B-coder-Exp-Q5_K_M.gguf` | 11.40 GiB | 34.06 tok/s | N/A | 33.68 tok/s | 12/25 | 69.4 | 73.3 | 32.77 tok/s | 77.1 | 96.7 | 81.2 |
| Under 14 GiB | `Smoffyy/gpt-oss-20b-instruct-pure-gguf` / `gpt-oss.gguf` | 13.41 GiB | 48.02 tok/s | N/A | 46.90 tok/s | 23/25 | 80.8 | 86.8 | 41.74 tok/s | 93.8 | 83.3 | 90.6 |
| Over 14 GiB | `unsloth/gemma-4-26B-A4B-it-qat-GGUF` / `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` | 18.82 GiB | 72.56 tok/s | 65.37 tok/s | 65.77 tok/s | 16/25 | 80.6 | 84.2 | 58.95 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-IQ4_XS.gguf` | 22.71 GiB | 67.03 tok/s | 65.07 tok/s | 65.36 tok/s | 11/25 | 75.4 | 75.8 | 62.63 tok/s | 91.7 | 81.7 | 96.9 |
| Over 14 GiB | `Hcompany/Holo-3.1-35B-A3B-GGUF` / `q4_k_m.gguf` | 24.78 GiB | 68.68 tok/s | 65.57 tok/s | 66.13 tok/s | 12/25 | 78.2 | 81.3 | 63.05 tok/s | 79.2 | 81.7 | 96.9 |
| Over 14 GiB | `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-Q4_K_M.gguf` | 24.78 GiB | 72.59 tok/s | 65.00 tok/s | 65.32 tok/s | 16/25 | 70.4 | 70.4 | 62.59 tok/s | 75.0 | 81.7 | 90.6 |
| Over 14 GiB | `Smoffyy/Qwen3.6-27B-Instruct-Revised-GGUF` / `Qwen3.6-27B-Revised-q4_k_m.gguf` | 26.69 GiB | 12.87 tok/s | 12.78 tok/s | 12.86 tok/s | 13/25 | timeout | timeout | timeout | timeout | timeout | timeout |
| Over 14 GiB | `Jackrong/Qwopus3.6-27B-v2-MTP-GGUF` / `Qwopus3.6-27B-v2-MTP-IQ4_XS.gguf` | 27.65 GiB | 19.07 tok/s | 23.36 tok/s | 24.81 tok/s | 18/25 | 77.0 | 83.3 | 21.08 tok/s | 83.3 | 96.7 | 96.9 |
| Over 14 GiB | `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` / `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` | 28.25 GiB | 66.39 tok/s | 61.09 tok/s | 61.32 tok/s | 20/25 | 70.3 | 70.0 | 58.70 tok/s | 54.2 | 88.3 | 93.8 |
| Over 14 GiB | `unsloth/gemma-4-31B-it-qat-GGUF` / `gemma-4-31B-it-qat-UD-Q4_K_XL.gguf` | 30.58 GiB | 11.95 tok/s | 12.07 tok/s | 12.48 tok/s | 23/25 | 79.2 | 89.5 | 11.23 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `jcbtc/CHADROCK3.6-35B-UNCENSORED-MTP-STRIX-LEAN` / `CHADROCK3.6-35B-UNCENSORED-MTP-STRIX-LEAN.gguf` | 23.84 GiB | 63.11 tok/s | N/A | 83.22 tok/s | 22/25 | 77.8 | 81.4 | 53.22 tok/s | 93.8 | 81.7 | 96.9 |
| Over 14 GiB | `eramax/Nex-N2-mini-gguf` / `Nex-N2-mini.Q4_K_M.gguf` | 24.78 GiB | 71.90 tok/s | 73.05 tok/s | 66.83 tok/s | 12/25 | 61.8 | 58.8 | 62.56 tok/s | 93.8 | 86.7 | 96.9 |
