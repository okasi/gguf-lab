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
- `--reasoning auto` or `off` per model (see **Reasoning** column in benchmark table)
- `--temp 0.75` (Qwopus family: `0.85`; see `windows-strix-halo/AGENTS.md`)
- `--top-p 0.95`
- `--top-k 20`
- `--presence-penalty 0.0`
- `--seed 3407`
- `-n 32768`

Notes:

- Vision runs used the matching `mmproj` when it loaded successfully.
- `Image gen` is `N/A` when no usable vision run was completed.
- Jackrong Qwopus3.6 35B files are from `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` (base) and `Jackrong/Qwopus3.6-35B-A3B-v1-MTP-GGUF` (MTP). Vision uses `mmproj.gguf`. **Primary 35B profile:** `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` with Jackrong MTP weights, `--spec-draft-n-max 2`, sampler `0.85 / 0.95 / 20`, `--reasoning off`.
- The 2026-06-09 refresh reran reasoning-on rows with `q8_0/q8_0` KV cache, model-card or family sampler settings, hard TypeScript max output at `7168`, and llama.cpp `b9535` Vulkan. The 2026-06-10 reasoning-off refresh used llama.cpp `b9551` Vulkan.
- The 2026-06-03 requested batch used existing compatible `mmproj` files where they loaded: Gemma E2B with the Unsloth E2B projector and Qwen/Qwopus 27B/35B variants with the matching local 27B/35B projectors.
- `Unsloth Gemma4 E4B` and `Unsloth Gemma4 E2B` required `--image-min-tokens 256` for their `mmproj` files to load; the earlier `1024` setting exceeded their image pixel limits.
- Gemma4 QAT rows used `--temp 1.0 --top-p 0.95 --top-k 64` and `q8_0/q8_0` KV cache. Per the [Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4), E2B/E4B native context is 128K (`131072`); 12B, 26B A4B, and 31B native context is 256K (`262144`). Local Unsloth QAT GGUFs match those `n_ctx_train` values. The 12B, 26B, and 31B QAT rows used `--cache-ram 0 --ctx-checkpoints 0` for stable vision/cache behavior.
- Qwopus rows use native `262144` context per the [Qwen3.6](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) model card and matching GGUF `n_ctx_train`.
- `Jackrong Qwopus3.6 27B v2 MTP` rows used `--spec-type draft-mtp --spec-draft-n-min 1 --spec-draft-n-max 2`; the 2026-06-06 sampler sweep used `mmproj-F32.gguf` from the MTP repo snapshot.

## Benchmark Results

BenchLoop v0.2.3 was run locally through llama.cpp's OpenAI-compatible endpoint with `--harness raw`, `BENCHLOOP_NO_SUBMIT=1`, and suites `speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent`. BenchLoop has no image/vision suite, so `Image gen` comes from the custom harness only.

Each row is the best of `--reasoning auto` vs `--reasoning off` for that model and sampler config, ranked by BL overall, then BL toolcall, then BL agent. **Reasoning** shows which mode was kept. Gemma reasoning-off rows also use `--chat-template-kwargs '{"enable_thinking":false}'`. Gemma4 QAT MTP rows use Unsloth drafters at `--spec-draft-n-max 2`. Qwopus3.6 35B MTP rows use Jackrong `*-MTP-GGUF` weights at `--spec-draft-n-max 2`.

Sampler column uses `temp / top_p / top_k`. Every row uses `presence_penalty=0` and the largest practical `--ctx-size` on this hardware (`262144` unless noted in **Max ctx**). Rerun with `windows-strix-halo/Run-Readme-NoReasoning.ps1` and refresh via `windows-strix-halo/Export-ReadmeBenchmarkTable.ps1`.

`Model / file` uses `family / on-disk.gguf` when the GGUF filename alone is ambiguous.

<!-- benchmark-table-start -->
| Mem bucket | Model / file | Max ctx | Sampler settings | Reasoning | Load mem | Text gen | Image gen | Tool gen | Hard TS | BL overall | BL quality | BL gen | BL coding | BL toolcall | BL agent |
|---|---|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Under 8 GiB | `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` | 131072 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | off | 3.99 GiB | 121.54 tok/s | 176.33 tok/s | 220.57 tok/s | 9/25 | 81.1 | 84.1 | 82.63 tok/s | 100.0 | 90.0 | 96.9 |
| Under 14 GiB | `gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf` | 131072 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | off | 10.71 GiB | 87.15 tok/s | 80.87 tok/s | 105.74 tok/s | 16/25 | 77.5 | 82.9 | 44.22 tok/s | 100.0 | 75.0 | 96.9 |
| Under 14 GiB | `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | off | 11.45 GiB | 42.23 tok/s | 42.95 tok/s | 46.28 tok/s | 22/25 | 79.5 | 84.8 | 37.6 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64` | auto | 18.82 GiB | 72.56 tok/s | 65.37 tok/s | 65.77 tok/s | 16/25 | 80.6 | 84.2 | 58.95 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-IQ4_XS.gguf` | 262144 | `0.85 / 0.95 / 20` | off | 22.71 GiB | 69.7 tok/s | 62.27 tok/s | 60.11 tok/s | 18/25 | 79.8 | 83.8 | 54.17 tok/s | 93.8 | 90.0 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-IQ4_XS.gguf` | 262144 | `0.85 / 0.95 / 20`, `MTP draft 1-2` | off | 24.32 GiB | 57.54 tok/s | 72.44 tok/s | 56.65 tok/s | 15/25 | 82.2 | 87.3 | 50.23 tok/s | 100.0 | 96.7 | 96.9 |
| Over 14 GiB | `Qwopus3.6-27B-v2-MTP-IQ4_XS.gguf` | 262144 | `0.85 / 0.95 / 20`, `MTP draft 1-2` | off | 27.65 GiB | 18.5 tok/s | 21.41 tok/s | 26.05 tok/s | 12/25 | 77.4 | 85.7 | 19.52 tok/s | 100.0 | 90.0 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` | 262144 | `0.85 / 0.95 / 20` | off | 28.25 GiB | 59 tok/s | 57.57 tok/s | 55.8 tok/s | 18/25 | 81.4 | 85.7 | 51.02 tok/s | 100.0 | 93.3 | 96.9 |
| Over 14 GiB | **`Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` (main 35B)** | 262144 | `0.85 / 0.95 / 20`, `MTP draft 1-2` | off | 30.02 GiB | 51.81 tok/s | 58.08 tok/s | 63.41 tok/s | 20/25 | 82.1 | 87.2 | 49.54 tok/s | 100.0 | 96.7 | 96.9 |
| Over 14 GiB | `gemma-4-31B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | off | 31.68 GiB | 23.2 tok/s | 25.55 tok/s | 28.96 tok/s | 23/25 | 80.2 | 88.9 | 19.58 tok/s | 100.0 | 83.3 | 96.9 |
<!-- benchmark-table-end -->