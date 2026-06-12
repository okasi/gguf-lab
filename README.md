# Local LLM Experiments

Benchmarks run locally on Windows with llama.cpp Vulkan. New benchmark results should be added to this README when they are run.

Shared LAN tooling (`lan-adapter.js`, `lan-models.json`) lives at the repo root. Windows scripts, llama.cpp builds, and benchmark harnesses live in [`windows-strix-halo/`](windows-strix-halo/). macOS M1 Pro Gemma 4 QAT / MTP BenchLoop runs live in [`macos-m1-pro/`](macos-m1-pro/).

The Gemma 4 optimized Fastify BenchLoop harness lives in [`gemma4_benchloop_harness_fastify/`](gemma4_benchloop_harness_fastify/).
The Qwen/Qwopus LAN-adapter harness lives in [`qwen_benchloop_harness/`](qwen_benchloop_harness/); its promoted 35B MTP policy reached **91.66** overall / **96.66** quality after 51 improvement loops, beating the raw README main 35B MTP row by **+9.32** overall / **+9.42** quality.

## macOS M1 Pro (Metal)

Apple M1 Pro, 32 GB unified memory, llama.cpp Metal. Full macOS notes: [`macos-m1-pro/README.md`](macos-m1-pro/README.md).

**Gemma 4 Unsloth MTP n-max=2, KV `q4_0`, no cap** (`-c 0`, `--fit-target 28672`, reasoning off, temp 1 / top-p 0.95 / top-k 64). Harness: [`gemma4_qat_q4_optimized_policy.json`](gemma4_benchloop_harness_fastify/configs/gemma4_qat_q4_optimized_policy.json).

Artifacts: [12B KV Q4](macos-m1-pro/results/benchloop/gemma4-12b-nmax2-kvq4-no-cap-20260611T000135Z/) · [26B KV Q4](macos-m1-pro/results/benchloop/gemma4-26b-nmax2-kvq4-no-cap-20260611T083329Z/)

| Model | Mode | Quality | Speed | Reliability | Value | **Overall** | Gen tok/s | Runtime | Agent | Coding | Dataextract | Instructfollow | Reasonmath | Toolcall | Load RSS | Peak cache | ≈ Peak |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 12B | raw | 86.2 | 44.7 | 80.9 | 8.0 | **76.6** | 11.50 | 2143s | 96.9 | 100.0 | 81.7 | 82.2 | 73.3 | 83.3 | 8.2 GB | 3.1 GB | ~11.3 GB |
| 12B | harness | 89.3 | 44.3 | 85.4 | 8.5 | **79.4** | 11.17 | 2088s | 96.9 | 100.0 | 82.5 | 76.7 | 80.0 | 100.0 | 8.2 GB | 3.5 GB | ~11.7 GB |
| 26B | raw | 82.7 | 56.2 | 75.3 | 13.5 | **75.6** | 21.69 | 1201s | 96.9 | 91.7 | 81.2 | 70.0 | 73.3 | 83.3 | 14.1 GB | 2.1 GB | ~16.2 GB |
| 26B | harness | 89.5 | 56.3 | 84.3 | 16.5 | **81.6** | 21.89 | 1132s | 96.9 | 100.0 | 83.7 | 70.0 | 86.7 | 100.0 | 14.1 GB | 2.4 GB | ~16.5 GB |

Promoted 12B daily serve: `bash macos-m1-pro/scripts/run_gemma4_12b_promoted_serve.sh` → `http://127.0.0.1:8092/v1`.

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

## Qwopus 27B Coder MTP BenchLoop (2026-06-12)

Requested raw BenchLoop runs for [`Jackrong/Qwopus3.6-27B-Coder-MTP-GGUF`](https://huggingface.co/Jackrong/Qwopus3.6-27B-Coder-MTP-GGUF). The model card's completed local result emphasizes Q5_K_M, MTP enabled, and thinking-off / no-thinking mode; it also notes the 32K fine-tuning target and recommends RoPE/YaRN for contexts beyond 32K. The initial BenchLoop-only runs used `--ctx-size 32768`; the later Q5_K_M max-context rerun used `--ctx-size 262144`. All rows in this table used `--reasoning off`, `--spec-type draft-mtp --spec-draft-n-min 1 --spec-draft-n-max 2`, launcher sampler defaults `0.85 / 0.95 / 20`, `q8_0/q8_0` KV, and llama.cpp `b9551` Vulkan. Server logs confirmed `chat template, thinking = 0`; saved `run.json` files contained zero `<think>` / `</think>` tags.

| Model / file | Max ctx | BL overall | BL quality | BL speed | BL gen | Coding | Toolcall | Agent | Dataextract | Instructfollow | Reasonmath | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `Qwopus3.6-27B-Coder-MTP-Q4_K_M.gguf` | 32768 | 75.36 | 83.91 | 53.35 | 18.52 tok/s | 100.00 | 78.33 | 96.88 | 81.57 | 66.67 | 80.00 | 933.1s |
| `Qwopus3.6-27B-Coder-MTP-Q5_K_M.gguf` | 32768 | 76.87 | 85.74 | 51.64 | 16.82 tok/s | 100.00 | 96.67 | 96.88 | 80.88 | 66.67 | 73.33 | 987.4s |
| `Qwopus3.6-27B-Coder-MTP-Q5_K_M.gguf` | 262144 | 76.76 | 85.74 | 51.11 | 16.40 tok/s | 100.00 | 96.67 | 96.88 | 80.88 | 66.67 | 73.33 | 1018.5s |

The Q5_K_M `262144` row is the max-context rerun requested after the initial `32768` pass. Server logs confirmed `new slot, n_ctx = 262144`; peak prompt cache reached `8191.6 MiB` of the `8192 MiB` cap.

Follow-up Q5_K_M temperature sweep used `Run-Qwen-Harness-BenchLoop.ps1` with sampler-only policies because raw BenchLoop task payloads override server sampler defaults. These rows enforced outgoing request sampler values, kept `--reasoning off` and MTP draft `1-2`, and left result scoring otherwise to BenchLoop. Adapter logs had 120 calls per run and no retries; server logs confirmed `n_max=2`, `new slot, n_ctx = 32768`, and `chat template, thinking = 0`. The adapter stripped residual think blocks from 3 responses in each run, and saved `run.json` files contained zero `<think>` / `</think>` tags.

| Model / file | Request sampler | Max ctx | BL overall | BL quality | BL speed | BL gen | Coding | Toolcall | Agent | Dataextract | Instructfollow | Reasonmath | Runtime |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `Qwopus3.6-27B-Coder-MTP-Q5_K_M.gguf` | `0.90 / 0.95 / 20` | 32768 | 75.70 | 84.20 | 51.46 | 16.59 tok/s | 87.50 | 90.00 | 96.88 | 80.83 | 70.00 | 80.00 | 1080.0s |
| `Qwopus3.6-27B-Coder-MTP-Q5_K_M.gguf` | `0.95 / 0.95 / 20` | 32768 | 75.18 | 83.84 | 51.26 | 16.41 tok/s | 93.75 | 90.00 | 96.88 | 81.30 | 67.78 | 73.33 | 1096.8s |

## Nex N2 Mini BenchLoop (2026-06-12)

Requested run for [`bartowski/nex-agi_Nex-N2-mini-GGUF`](https://huggingface.co/bartowski/nex-agi_Nex-N2-mini-GGUF) file `nex-agi_Nex-N2-mini-IQ4_NL.gguf` (`19,861,346,304` bytes). The model card lists the prompt format with `<think>` and notes the quants were made with llama.cpp `b9590`; local run used the newer local `rocmfp4-llama` Vulkan build (`1faa48e`) because the packaged `b9551` runner predates the local Qwen3Next build. The requested `--tp 2`, `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder`, and `--mamba-scheduler-strategy extra_buffer` flags are not accepted by local llama.cpp; parser behavior was mapped through `qwen_benchloop_harness/configs/nex_n2_mini_qwen3_parser_policy.json` with sampler enforcement and Qwen reasoning/tool-call cleanup.

Server settings: `--ctx-size 262144`, `--reasoning auto`, `q8_0/q8_0` KV, no speculative decoding, request sampler `0.7 / 0.95 / 40`. Server logs confirmed `new slot, n_ctx = 262144`, `chat template, thinking = 1`, and peak prompt cache `8190.3 MiB`; saved `run.json` contained zero `<think>` / `</think>` tags after the parser pass.

| Model / file | Mode | Max ctx | BL overall | BL quality | BL speed | BL gen | Coding | Toolcall | Agent | Dataextract | Instructfollow | Reasonmath | Runtime |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `nex-agi_Nex-N2-mini-IQ4_NL.gguf` | Qwen3 parser harness | 262144 | 79.13 | 82.49 | 70.49 | 48.67 tok/s | 85.42 | 80.00 | 96.88 | 75.98 | 83.33 | 73.33 | 667.0s |

## Benchmark Results

BenchLoop v0.2.3 was run locally through llama.cpp's OpenAI-compatible endpoint with `--harness raw`, `BENCHLOOP_NO_SUBMIT=1`, and suites `speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent`. BenchLoop has no image/vision suite, so `Image gen` comes from the custom harness only.

Each row is the best of `--reasoning auto` vs `--reasoning off` for that model and sampler config, ranked by BL overall, then BL toolcall, then BL agent. **Reasoning** shows which mode was kept. Gemma reasoning-off rows also use `--chat-template-kwargs '{"enable_thinking":false}'`. Gemma4 QAT MTP rows use Unsloth drafters at `--spec-draft-n-max 2`. Qwopus3.6 35B MTP rows use Jackrong `*-MTP-GGUF` weights at `--spec-draft-n-max 2`.

Sampler column uses `temp / top_p / top_k`. Every row uses `presence_penalty=0` and the largest practical `--ctx-size` on this hardware (`262144` unless noted in **Max ctx**). Rerun with `windows-strix-halo/Run-Readme-NoReasoning.ps1` and refresh via `windows-strix-halo/Export-ReadmeBenchmarkTable.ps1`.

`Model / file` uses `family / on-disk.gguf` when the GGUF filename alone is ambiguous.

<!-- benchmark-table-start -->
| Mem bucket | Model / file | Max ctx | Sampler settings | Reasoning | Load mem | Text gen | Image gen | Tool gen | Hard TS | BL overall | BL quality | BL gen | BL coding | BL toolcall | BL agent |
|---|---|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Under 8 GiB | `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` | 131072 | `1.0 / 0.95 / 64` | auto | 3.99 GiB | 135.32 tok/s | 130.9 tok/s | 130.78 tok/s | 17/25 | 81.8 | 83.9 | 100.16 tok/s | 85.4 | 78.3 | 100.0 |
| Under 14 GiB | `gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf` | 131072 | `1.0 / 0.95 / 64` | auto | 10.71 GiB | 87.79 tok/s | 87.95 tok/s | 94.81 tok/s | 22/25 | 80.6 | 85.4 | 53.44 tok/s | 100.0 | 78.3 | 96.9 |
| Under 14 GiB | `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | off | 11.45 GiB | 42.56 tok/s | 41.35 tok/s | 46.24 tok/s | 19/25 | 79.5 | 84.8 | 37.6 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64` | auto | 19.85 GiB | 74.73 tok/s | 76.66 tok/s | 84.13 tok/s | 15/25 | 80.6 | 84.2 | 58.95 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-IQ4_XS.gguf` | 262144 | `0.85 / 0.95 / 20` | off | 22.71 GiB | 71.25 tok/s | 60.04 tok/s | 61.27 tok/s | 23/25 | 79.8 | 83.8 | 54.17 tok/s | 93.8 | 90.0 | 96.9 |
| Over 14 GiB | `Qwopus3.6-27B-v2-MTP-IQ4_XS.gguf` | 262144 | `0.85 / 0.95 / 20`, `MTP draft 1-2` | off | 27.65 GiB | 18.25 tok/s | 21.24 tok/s | 22.6 tok/s | 21/25 | 77.4 | 85.7 | 19.52 tok/s | 100.0 | 90.0 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` | 262144 | `0.85 / 0.95 / 20` | off | 28.25 GiB | 66.26 tok/s | 57.04 tok/s | 60.83 tok/s | 16/25 | 81.4 | 85.7 | 51.02 tok/s | 100.0 | 93.3 | 96.9 |
| Over 14 GiB | **`Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` (main 35B)** | 262144 | `0.85 / 0.95 / 20`, `MTP draft 1-2` | off | 30.02 GiB | 60.06 tok/s | 57.45 tok/s | 68.3 tok/s | 15/25 | 82.3 | 87.2 | 51.97 tok/s | 100.0 | 96.7 | 96.9 |
| Over 14 GiB | `gemma-4-31B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | off | 31.68 GiB | 23.26 tok/s | 24.45 tok/s | 28.76 tok/s | 23/25 | 80.2 | 88.9 | 19.58 tok/s | 100.0 | 83.3 | 96.9 |
<!-- benchmark-table-end -->

