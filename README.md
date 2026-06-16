# Local LLM Experiments

Benchmarks run locally on Windows with llama.cpp Vulkan and on macOS with llama.cpp Metal. New benchmark results should be added to this README when they are run.

Shared LAN/proxy server tooling lives in [`proxy-lan-server/`](proxy-lan-server/). Windows scripts, llama.cpp builds, and benchmark harnesses live in [`windows-strix-halo/`](windows-strix-halo/). macOS M1 Pro Gemma 4 QAT / MTP BenchLoop runs live in [`macos-m1-pro/`](macos-m1-pro/).

The merged Gemma/Qwen harness lives in [`proxy-lan-server/`](proxy-lan-server/): [`proxy.mjs`](proxy-lan-server/proxy.mjs), [`test.mjs`](proxy-lan-server/test.mjs), [`lan-adapter.js`](proxy-lan-server/lan-adapter.js), and [`gemma_qwen_merged_policy.json`](proxy-lan-server/gemma_qwen_merged_policy.json). It is the single shared OpenAI-compatible adapter for BenchLoop, OpenClaw/ClawBench, Hermes Agent, opencode, and similar local agent clients.

## macOS M1 Pro (Metal)

Apple M1 Pro, 32 GB unified memory, llama.cpp Metal. Full macOS notes: [`macos-m1-pro/README.md`](macos-m1-pro/README.md).

**Gemma 4 shared-policy BenchLoop, no cap** (`-c 0`, `--fit-target 28672`, reasoning off). E2B/E4B use no MTP draft; 12B/26B use Unsloth MTP n-max=2. The current merged policy keeps family sampler profiles separate and pinned while sharing generic response behavior. Harness: [`gemma_qwen_merged_policy.json`](proxy-lan-server/gemma_qwen_merged_policy.json).

Artifacts: [E2B/E4B current-policy rerun](macos-m1-pro/results/benchloop/gemma4-e2b-e4b-current-policy-rerun-20260614/) · [12B current harness](macos-m1-pro/results/benchloop/gemma4-12b-quality-goal-20260613/loop-03-temp090/) · [26B current harness](macos-m1-pro/results/benchloop/gemma4-26b-quality-goal-20260613/temp090/) · [12B restored baseline](macos-m1-pro/results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter186-restore-safe-baseline-full/)


**Merged Gemma/Qwen v18 q4_0 same-runtime rerun (2026-06-15)** used the requested target/draft cache settings: `CACHE_TYPE_K=q4_0`, `CACHE_TYPE_V=q4_0`, `CACHE_TYPE_K_DRAFT=q4_0`, and `CACHE_TYPE_V_DRAFT=q4_0`. Raw and harness rows used the same matrix/runtime for each size. v18 improved quality and overall score on all four Gemma 4 sizes; proxy repair audits had zero suspicious prompt/task/answer/action repair labels. Artifact: [v18-q4-raw-harness-rerun](macos-m1-pro/results/benchloop/gemma-qwen-merged-policy-20260615/v18-q4-raw-harness-rerun/).

| Model | Runtime | Raw quality | v18 quality | Quality Δ | Raw overall | v18 overall | Overall Δ | v18 dataextract | v18 toolcall |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| E2B | no MTP, `q4_0` KV | 82.4817 | 85.5700 | +3.0883 | 76.3573 | 79.1966 | +2.8393 | 87.23 | 90.00 |
| E4B | no MTP, `q4_0` KV | 81.7217 | 83.3300 | +1.6083 | 74.3993 | 76.2926 | +1.8933 | 91.02 | 75.00 |
| 12B | MTP n-max=2, target/draft `q4_0` KV | 86.2483 | 86.5233 | +0.2750 | 76.6313 | 77.1335 | +0.5021 | 83.38 | 83.33 |
| 26B | MTP n-max=2, target/draft `q4_0` KV | 82.7367 | 83.3250 | +0.5883 | 75.8454 | 76.7168 | +0.8714 | 84.73 | 83.33 |

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
- `--cache-type-k q4_0`
- `--cache-type-v q4_0`
- `--spec-draft-type-k q4_0` for MTP rows
- `--spec-draft-type-v q4_0` for MTP rows
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

Agent-facing LAN shortcuts use the prompt-reuse profile `-c 131072 -CacheReuse 256`. Native-max benchmark rows and historical tables keep their documented context sizes.

Notes:

- Vision runs used the matching `mmproj` when it loaded successfully.
- `Image gen` is `N/A` when no usable vision run was completed.
- Jackrong Qwopus3.6 35B files are from `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF` (base) and `Jackrong/Qwopus3.6-35B-A3B-v1-MTP-GGUF` (MTP). Vision uses `mmproj.gguf`. **Primary 35B profile:** `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` with Jackrong MTP weights, `--spec-draft-n-max 2`, sampler `0.85 / 0.95 / 20`, `--reasoning off`.
- The 2026-06-09 refresh reran reasoning-on rows with `q8_0/q8_0` KV cache, model-card or family sampler settings, hard TypeScript max output at `7168`, and llama.cpp `b9535` Vulkan. The 2026-06-10 reasoning-off refresh used llama.cpp `b9551` Vulkan.
- The 2026-06-03 requested batch used existing compatible `mmproj` files where they loaded: Gemma E2B with the Unsloth E2B projector and Qwen/Qwopus 27B/35B variants with the matching local 27B/35B projectors.
- `Unsloth Gemma4 E4B` and `Unsloth Gemma4 E2B` required `--image-min-tokens 256` for their `mmproj` files to load; the earlier `1024` setting exceeded their image pixel limits.
- Earlier Gemma4 QAT refresh rows used `--temp 1.0 --top-p 0.95 --top-k 64` and `q8_0/q8_0` KV cache; current serving and benchmark defaults use `q4_0/q4_0` target and draft KV unless a matrix overrides it. Per the [Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4), E2B/E4B native context is 128K (`131072`); 12B, 26B A4B, and 31B native context is 256K (`262144`). Local Unsloth QAT GGUFs match those `n_ctx_train` values. The 12B, 26B, and 31B QAT rows used `--cache-ram 0 --ctx-checkpoints 0` for stable vision/cache behavior.
- Qwopus rows use native `262144` context per the [Qwen3.6](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) model card and matching GGUF `n_ctx_train`.
- `Jackrong Qwopus3.6 27B v2 MTP` rows used `--spec-type draft-mtp --spec-draft-n-min 1 --spec-draft-n-max 2`; the 2026-06-06 sampler sweep used `mmproj-F32.gguf` from the MTP repo snapshot.
- Older Qwen/Qwopus harness BenchLoop tables live in [`windows-strix-halo/historical-benchloop.md`](windows-strix-halo/historical-benchloop.md).

## Reasoning-Off 131K q4_0 MTP Toggle BenchLoop (2026-06-15)

BenchLoop v0.2.3 raw rerun with family sampler settings, `--ctx-size 131072`, target KV `q4_0/q4_0`, draft KV `q4_0/q4_0` for MTP rows, and reasoning disabled with `--reasoning off --reasoning-budget -1 --chat-template-kwargs '{"enable_thinking":false,"preserve_thinking":false}'`. MTP rows use Gemma draft models or Jackrong MTP GGUFs; no-MTP rows omit speculative decoding. BenchLoop has no image suite, so these rows were run without `mmproj`. E4B MTP used `--flash-attn on` because q4_0 V-cache requires flash attention in this llama.cpp build.

The initial full run used `--reasoning-format none`, which left leading thought markers in `message.content` for the larger Gemma and Qwopus rows. The table below keeps the original full-run speed, coding, toolcall, agent, and reasonmath scores, and replaces only the affected `dataextract` and `instructfollow` scores with reduced-suite reruns through the thought-strip proxy. E2B/E4B did not emit those markers and remain from the original full runs.

Config: [`reasoning-off-131k-q4-mtp-toggle.json`](windows-strix-halo/configs/reasoning-off-131k-q4-mtp-toggle.json). Reduced-suite manifest: local ignored `windows-strix-halo/logs/rerun-131k-q4-mtp-toggle-affected-suites.json`.

| Model / file | Mode | Max ctx | Sampler | BL overall | BL quality | BL speed | BL gen | Coding | Toolcall | Agent | Dataextract | Instructfollow | Reasonmath |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` | MTP | 131072 | `1.0 / 0.95 / 64` | 80.0 | 82.5 | 80.3 | 85.62 tok/s | 91.7 | 90.0 | 96.9 | 68.7 | 67.8 | 80.0 |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` | No MTP | 131072 | `1.0 / 0.95 / 64` | 79.9 | 83.1 | 78.3 | 74.84 tok/s | 100.0 | 90.0 | 96.9 | 70.9 | 67.8 | 73.3 |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf` | MTP | 131072 | `1.0 / 0.95 / 64` | 78.7 | 82.8 | 74.3 | 60.28 tok/s | 100.0 | 80.0 | 96.9 | 76.8 | 63.3 | 80.0 |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf` | No MTP | 131072 | `1.0 / 0.95 / 64` | 77.0 | 82.2 | 69.0 | 44.22 tok/s | 100.0 | 75.0 | 96.9 | 81.0 | 63.3 | 77.0 |
| `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` | MTP | 131072 | `1.0 / 0.95 / 64` | 81.1 | 86.9 | 65.6 | 36.86 tok/s | 100.0 | 83.3 | 96.9 | 81.2 | 80.0 | 80.0 |
| `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` | MTP | 131072 | `1.0 / 0.95 / 64` | 80.1 | 84.1 | 73.9 | 58.81 tok/s | 91.7 | 83.3 | 96.9 | 80.4 | 85.6 | 66.7 |
| `Qwopus3.6-27B-Coder-MTP-Q5_K_M.gguf` | MTP | 131072 | `0.85 / 0.95 / 20` | 76.2 | 84.6 | 52.5 | 17.61 tok/s | 100.0 | 90.0 | 96.9 | 80.9 | 66.7 | 73.3 |
| `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` | MTP | 131072 | `0.85 / 0.95 / 20` | 83.5 | 88.4 | 71.7 | 51.16 tok/s | 100.0 | 96.7 | 96.9 | 91.3 | 72.2 | 73.3 |
| `gemma-4-31B-it-qat-UD-Q4_K_XL.gguf` | MTP | 131072 | `1.0 / 0.95 / 64` | 80.8 | 89.2 | 54.6 | 19.87 tok/s | 100.0 | 83.3 | 96.9 | 89.3 | 85.6 | 80.0 |

## Benchmark Results

BenchLoop v0.2.3 was run locally through llama.cpp's OpenAI-compatible endpoint with `--harness raw`, `BENCHLOOP_NO_SUBMIT=1`, and suites `speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent`. BenchLoop has no image/vision suite, so `Image gen` comes from the custom harness only.

Each row is the best of `--reasoning auto` vs `--reasoning off` for that model and sampler config, ranked by BL overall, then BL toolcall, then BL agent. **Reasoning** shows which mode was kept. Gemma reasoning-off rows also use `--chat-template-kwargs '{"enable_thinking":false}'`. Gemma4 QAT MTP rows use Unsloth drafters at `--spec-draft-n-max 2`. Qwopus3.6 35B MTP rows use Jackrong `*-MTP-GGUF` weights at `--spec-draft-n-max 2`.

Sampler column uses `temp / top_p / top_k`. Every row uses `presence_penalty=0` and the largest practical `--ctx-size` on this hardware (`262144` unless noted in **Max ctx**). Rerun with `windows-strix-halo/Run-Readme-NoReasoning.ps1` and refresh via `windows-strix-halo/Export-ReadmeBenchmarkTable.ps1`.

`Model / file` uses `family / on-disk.gguf` when the GGUF filename alone is ambiguous.

Standalone 27B Coder result retained from the raw Windows/Vulkan BenchLoop run (`--reasoning off`, MTP draft `1-2`, sampler `0.85 / 0.95 / 20`, `q8_0/q8_0` KV):

| Model / file | Max ctx | BL overall | BL quality | BL speed | BL gen | Coding | Toolcall | Agent | Dataextract | Instructfollow | Reasonmath | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `Qwopus3.6-27B-Coder-MTP-Q5_K_M.gguf` | 32768 | 76.87 | 85.74 | 51.64 | 16.82 tok/s | 100.00 | 96.67 | 96.88 | 80.88 | 66.67 | 73.33 | 987.4s |

<!-- benchmark-table-start -->
| Mem bucket | Model / file | Max ctx | Sampler settings | Reasoning | Load mem | Text gen | Image gen | Tool gen | Hard TS | BL overall | BL quality | BL gen | BL coding | BL toolcall | BL agent |
|---|---|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Under 8 GiB | `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` | 131072 | `1.0 / 0.95 / 64` | auto | 3.99 GiB | 135.32 tok/s | 130.9 tok/s | 130.78 tok/s | 17/25 | 81.8 | 83.9 | 100.16 tok/s | 85.4 | 78.3 | 100.0 |
| Under 14 GiB | `gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf` | 131072 | `1.0 / 0.95 / 64` | auto | 10.71 GiB | 87.79 tok/s | 87.95 tok/s | 94.81 tok/s | 22/25 | 80.6 | 85.4 | 53.44 tok/s | 100.0 | 78.3 | 96.9 |
| Under 14 GiB | `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | off | 11.45 GiB | 42.56 tok/s | 41.35 tok/s | 46.24 tok/s | 19/25 | 79.5 | 84.8 | 37.6 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64` | auto | 19.85 GiB | 74.73 tok/s | 76.66 tok/s | 84.13 tok/s | 15/25 | 80.6 | 84.2 | 58.95 tok/s | 100.0 | 83.3 | 96.9 |
| Over 14 GiB | `Qwopus3.6-27B-v2-MTP-IQ4_XS.gguf` | 262144 | `0.85 / 0.95 / 20`, `MTP draft 1-2` | off | 27.65 GiB | 18.25 tok/s | 21.24 tok/s | 22.6 tok/s | 21/25 | 77.4 | 85.7 | 19.52 tok/s | 100.0 | 90.0 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` | 262144 | `0.85 / 0.95 / 20` | off | 28.25 GiB | 66.26 tok/s | 57.04 tok/s | 60.83 tok/s | 16/25 | 81.4 | 85.7 | 51.02 tok/s | 100.0 | 93.3 | 96.9 |
| Over 14 GiB | `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf`| 262144 | `0.85 / 0.95 / 20`, `MTP draft 1-2` | off | 30.02 GiB | 60.06 tok/s | 57.45 tok/s | 68.3 tok/s | 15/25 | 82.3 | 87.2 | 51.97 tok/s | 100.0 | 96.7 | 96.9 |
| Over 14 GiB | `gemma-4-31B-it-qat-UD-Q4_K_XL.gguf` | 262144 | `1.0 / 0.95 / 64`, `MTP draft 1-2` | off | 31.68 GiB | 23.26 tok/s | 24.45 tok/s | 28.76 tok/s | 23/25 | 80.2 | 88.9 | 19.58 tok/s | 100.0 | 83.3 | 96.9 |
<!-- benchmark-table-end -->
