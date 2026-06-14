# Local LLM Experiments

Benchmarks run locally on Windows with llama.cpp Vulkan and on macOS with llama.cpp Metal. New benchmark results should be added to this README when they are run.

Shared LAN tooling (`lan-adapter.js`, `lan-models.json`) lives at the repo root. Windows scripts, llama.cpp builds, and benchmark harnesses live in [`windows-strix-halo/`](windows-strix-halo/). macOS M1 Pro Gemma 4 QAT / MTP BenchLoop runs live in [`macos-m1-pro/`](macos-m1-pro/).

The general Gemma 4 harness lives in [`gemma4_harness/`](gemma4_harness/). It is the shared OpenAI-compatible adapter for BenchLoop, OpenClaw/ClawBench, Hermes Agent, opencode, and similar local agent clients.
The Qwen/Qwopus LAN-adapter harness lives in [`qwen_harness/`](qwen_harness/). It is intended for OpenClaw/ClawBench, Hermes Agent, BenchLoop, and similar local agent clients. Its active policies are parser/tool-call/code/JSON-envelope cleanup only, with extraction value coercion and answer-changing repairs disabled. Current fair evidence includes a 30-loop toolcall optimization pass, a full two-model BenchLoop run, and real-use validation; see [`qwen_harness/OPTIMIZATION_REPORT.md`](qwen_harness/OPTIMIZATION_REPORT.md). A prior 35B MTP promoted result of **91.66** overall / **96.66** quality is invalidated because it used answer-changing normalizers that have since been removed.

## macOS M1 Pro (Metal)

Apple M1 Pro, 32 GB unified memory, llama.cpp Metal. Full macOS notes: [`macos-m1-pro/README.md`](macos-m1-pro/README.md).

**Gemma 4 shared-policy BenchLoop, no cap** (`-c 0`, `--fit-target 28672`, reasoning off). E2B/E4B use no MTP draft and the matrix defaults (`f16` KV); 12B/26B use Unsloth MTP n-max=2 with KV `q4_0`. Raw rows use temp 1 / top-p 0.95 / top-k 64; the current harness policy uses temp 0.90 / top-p 0.95 / top-k 64. Harness: [`gemma4_qat_q4_optimized_policy.json`](gemma4_harness/configs/gemma4_qat_q4_optimized_policy.json).

Artifacts: [E2B/E4B current-policy rerun](macos-m1-pro/results/benchloop/gemma4-e2b-e4b-current-policy-rerun-20260614/) · [12B current harness](macos-m1-pro/results/benchloop/gemma4-12b-quality-goal-20260613/loop-03-temp090/) · [26B current harness](macos-m1-pro/results/benchloop/gemma4-26b-quality-goal-20260613/temp090/) · [12B restored baseline](macos-m1-pro/results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter186-restore-safe-baseline-full/)

Latest harness rows use the same selected shared policy (`shared-current-best-temp090`) across E2B, E4B, 12B, and 26B; benchmark-specific phrase/word transforms and task-answer/tool-call synthesis remain removed. This policy helps 12B/26B but does **not** pass an all-four-model promotion gate because E2B/E4B regress versus raw. Rejected 12B/26B sampler candidates from 2026-06-14:

| Candidate | 12B overall / quality | 26B overall / quality | Outcome |
|---|---:|---:|---|
| [`temp=1.00 / top_p=0.95 / top_k=64`](macos-m1-pro/results/benchloop/gemma4-12b-quality-200loops-20260614/loop-001-temp100/) | 72.8 / 82.6 | [79.2 / 86.0](macos-m1-pro/results/benchloop/gemma4-26b-quality-200loops-20260614/loop-001-temp100/) | rejected; 12B regressed |
| [`temp=0.92 / top_p=0.95 / top_k=64`](macos-m1-pro/results/benchloop/gemma4-12b-quality-200loops-20260614/loop-002-temp092/) | 76.4 / 85.9 | [77.4 / 84.2](macos-m1-pro/results/benchloop/gemma4-26b-quality-200loops-20260614/loop-002-temp092/) | rejected; both regressed |
| [`temp=0.90 / top_p=0.95 / top_k=80`](macos-m1-pro/results/benchloop/gemma4-12b-quality-200loops-20260614/loop-003-topk80/) | 77.3 / 87.0 | [74.8 / 80.9](macos-m1-pro/results/benchloop/gemma4-26b-quality-200loops-20260614/loop-003-topk80/) | rejected; 26B regressed |

All-size candidate search on 2026-06-14 stopped at the E2B gate because no clean candidate beat raw E2B (`79.7` overall / `84.1` quality). Best E2B candidate was [`candidate-002`](macos-m1-pro/results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-002-temp095-topp090-e2-gate/) at `78.4` overall / `82.6` quality. Best non-sampler E2B candidate was [`candidate-012`](macos-m1-pro/results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-012-single-retry-e2-gate/) at `77.7` overall / `81.6` quality, but its [E4B follow-up](macos-m1-pro/results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-012-single-retry-e4-gate/) regressed to `71.9` / `79.5`. A follow-up E4B run for candidate-002 also failed raw E4B, scoring `73.3` overall / `79.7` quality versus raw `77.7` / `83.3`. Candidate artifacts: [`gemma4-allsize-policy-candidates-20260614`](macos-m1-pro/results/benchloop/gemma4-allsize-policy-candidates-20260614/).

| Candidate | Shared policy change | E2B overall / quality | Outcome |
|---|---|---:|---|
| 001 | `temp=0.90 / top_p=0.90 / top_k=64` | 76.4 / 81.9 | failed E2B gate |
| 002 | `temp=0.95 / top_p=0.90 / top_k=64` | 78.4 / 82.6 | failed E2B gate |
| 003 | `temp=1.00 / top_p=0.90 / top_k=64` | 75.9 / 80.5 | failed E2B gate |
| 004 | `temp=0.95 / top_p=0.925 / top_k=64` | 77.3 / 81.1 | failed E2B gate |
| 005 | `temp=0.95 / top_p=0.95 / top_k=64` | 76.5 / 81.2 | failed E2B gate |
| 006 | `temp=0.80 / top_p=0.95 / top_k=64` | 76.3 / 80.8 | failed E2B gate |
| 007 | candidate 002 + tool arg normalization/dedupe | 77.7 / 82.1 | failed E2B gate |
| 008 | selected sampler + tool arg normalization/dedupe | 76.6 / 80.1 | failed E2B gate |
| 009 | selected sampler + no harness code extraction | 76.3 / 82.4 | failed E2B gate |
| 010 | candidate 009 + no malformed-code retries | 76.4 / 80.0 | failed E2B gate |
| 011 | selected parser + no malformed-code retries | 75.7 / 79.4 | failed E2B gate |
| 012 | selected parser + `max_retries=1` | 77.7 / 81.6 | failed E2B gate; best non-sampler candidate |
| 013 | selected parser + `max_retries=0` | 75.5 / 78.7 | failed E2B gate |
| 014 | selected parser + no malformed-JSON retries | 73.0 / 77.4 | failed E2B gate |

| Candidate | E4B overall / quality | Outcome |
|---|---:|---|
| current policy | 75.4 / 81.2 | failed E4B raw gate |
| 002 | 73.3 / 79.7 | failed E4B raw gate |
| 012 | 71.9 / 79.5 | failed E4B current-harness/raw gates |

| Model | Mode | Runtime config | Quality | Speed | Reliability | Value | **Overall** | Harness Δ overall | Gen tok/s | Runtime | Agent | Coding | Dataextract | Instructfollow | Reasonmath | Toolcall | Load RSS | Peak cache | ≈ Peak |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| E2B | raw | no MTP, `f16` KV | 84.1 | 72.9 | 75.3 | - | **79.7** | - | - | - | 96.9 | 100.0 | 70.1 | 67.8 | 80.0 | 90.0 | - | - | - |
| E2B | harness | no MTP, `f16` KV | 80.2 | 71.8 | 68.5 | - | **75.6** | -4.1 | - | - | 90.6 | 93.8 | 73.9 | 64.5 | 73.3 | 85.0 | - | - | - |
| E4B | raw | no MTP, `f16` KV | 83.3 | 65.2 | 75.3 | - | **77.7** | - | - | - | 96.9 | 100.0 | 81.4 | 66.7 | 80.0 | 75.0 | - | - | - |
| E4B | harness | no MTP, `f16` KV | 81.2 | 63.9 | 71.9 | - | **75.4** | -2.3 | - | - | 96.9 | 93.8 | 80.3 | 61.1 | 80.0 | 75.0 | - | - | - |
| 12B | raw | MTP n-max=2, `q4_0` KV | 86.2 | 44.7 | 80.9 | 8.0 | **76.6** | - | 11.50 | 2143s | 96.9 | 100.0 | 81.7 | 82.2 | 73.3 | 83.3 | 8.2 GB | 3.1 GB | ~11.3 GB |
| 12B | harness | MTP n-max=2, `q4_0` KV | 87.2 | 52.7 | 82.0 | 13.0 | **79.0** | +2.3 | 18.13 | 1219s | 96.9 | 100.0 | 79.4 | 83.3 | 80.0 | 83.3 | 8.4 GB | 3.4 GB | ~11.8 GB |
| 26B | raw | MTP n-max=2, `q4_0` KV | 82.7 | 56.2 | 75.3 | 13.5 | **75.6** | - | 21.69 | 1201s | 96.9 | 91.7 | 81.2 | 70.0 | 73.3 | 83.3 | 14.1 GB | 2.1 GB | ~16.2 GB |
| 26B | harness | MTP n-max=2, `q4_0` KV | 84.5 | 64.5 | 77.5 | 22.3 | **78.8** | +3.2 | 33.96 | 728s | 96.9 | 100.0 | 81.4 | 72.2 | 73.3 | 83.3 | 14.1 GB | 2.3 GB | ~16.4 GB |

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

## Qwen/Qwopus Harness Fair BenchLoop (2026-06-13)

These rows use the cleaned `qwen_harness/` LAN-adapter policies with answer-changing normalizers removed. BenchLoop ran through the adapter with `--harness raw`, suites `speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent`, copied `run.json` files, adapter JSONL, policy/model snapshots, and summaries under `windows-strix-halo/logs/qwen-harness-final-full-20260613/`. See `qwen_harness/OPTIMIZATION_REPORT.md` for the 30-loop optimization summary, failure audit, real-use validation, and anti-cheating audit.

| Model / file | Max ctx | BL overall | BL quality | BL speed | Reliability | BL gen | Coding | Toolcall | Agent | Dataextract | Instructfollow | Reasonmath |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `Qwopus3.6-27B-Coder-MTP-Q4_K_M.gguf` | 32768 | 74.59 | 82.28 | 52.59 | 75.28 | 17.80 tok/s | 93.75 | 75.00 | 96.88 | 86.92 | 67.78 | 73.33 |
| `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` (MTP Q5 weights) | 262144 | 76.95 | 81.64 | 70.36 | 71.91 | 48.25 tok/s | 93.75 | 91.67 | 96.88 | 83.07 | 51.11 | 73.33 |

## Qwopus 35B MTP Reasoning Toggle BenchLoop (2026-06-13)

Requested raw rerun for the main 35B profile: `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` label served from `Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M.gguf`, `--ctx-size 262144`, sampler `0.85 / 0.95 / 20`, `--spec-type draft-mtp --spec-draft-n-min 1 --spec-draft-n-max 2`, `q8_0/q8_0` KV, llama.cpp `b9551` Vulkan, BenchLoop raw harness.

Artifacts: reasoning auto run `C:\Users\Admin\.bench-loop\runs\20260613-162833-jackrong-qwopus3.6-35b-a3b-v1-mtp-q5-k-m-nmax2-reasoning-auto-mtp2-20260613-local-openai_compat\run.json`; reasoning off run `C:\Users\Admin\.bench-loop\runs\20260613-163957-jackrong-qwopus3.6-35b-a3b-v1-mtp-q5-k-m-nmax2-noreason-mtp2-20260613-local-openai_compat\run.json`.

| Reasoning | BL overall | BL quality | BL speed | Reliability | BL gen | Coding | Toolcall | Agent | Dataextract | Instructfollow | Reasonmath | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| auto | 64.97 | 63.20 | 73.81 | 61.80 | 56.37 tok/s | 60.42 | 81.67 | 93.75 | 0.00 | 70.00 | 73.33 | 1146.6s |
| off | 82.08 | 87.25 | 70.76 | 79.78 | 48.55 tok/s | 100.00 | 96.67 | 96.88 | 88.82 | 67.78 | 73.33 | 389.8s |

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

Requested run for [`bartowski/nex-agi_Nex-N2-mini-GGUF`](https://huggingface.co/bartowski/nex-agi_Nex-N2-mini-GGUF) file `nex-agi_Nex-N2-mini-IQ4_NL.gguf` (`19,861,346,304` bytes). The model card lists the prompt format with `<think>` and notes the quants were made with llama.cpp `b9590`; local run used the newer local `rocmfp4-llama` Vulkan build (`1faa48e`) because the packaged `b9551` runner predates the local Qwen3Next build. The requested `--tp 2`, `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder`, and `--mamba-scheduler-strategy extra_buffer` flags are not accepted by local llama.cpp; parser behavior was mapped through `qwen_harness/configs/nex_n2_mini_qwen3_parser_policy.json` with sampler enforcement and Qwen reasoning/tool-call cleanup.

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
