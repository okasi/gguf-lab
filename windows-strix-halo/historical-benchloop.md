# Historical BenchLoop Notes

These are retained Windows/Vulkan benchmark notes for older Qwen/Qwopus/Nex runs. The retired Qwen harness directories and scripts have been removed; new shared harness work should use `proxy-lan-server/gemma_qwen_merged_policy.json`.

## Qwen/Qwopus Harness Fair BenchLoop (2026-06-13)

These historical rows used the retired Qwen/Qwopus LAN-adapter policies with answer-changing normalizers removed. BenchLoop ran through the adapter with `--harness raw`, suites `speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent`, copied `run.json` files, adapter JSONL, policy/model snapshots, and summaries under the retired Windows harness log directory.

| Model / file | Max ctx | BL overall | BL quality | BL speed | Reliability | BL gen | Coding | Toolcall | Agent | Dataextract | Instructfollow | Reasonmath |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `Qwopus3.6-27B-Coder-MTP-Q4_K_M.gguf` | 32768 | 74.59 | 82.28 | 52.59 | 75.28 | 17.80 tok/s | 93.75 | 75.00 | 96.88 | 86.92 | 67.78 | 73.33 |
| `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` (MTP Q5 weights) | 262144 | 76.95 | 81.64 | 70.36 | 71.91 | 48.25 tok/s | 93.75 | 91.67 | 96.88 | 83.07 | 51.11 | 73.33 |

## Qwopus 27B Coder MTP BenchLoop (2026-06-12)

Requested raw BenchLoop runs for [`Jackrong/Qwopus3.6-27B-Coder-MTP-GGUF`](https://huggingface.co/Jackrong/Qwopus3.6-27B-Coder-MTP-GGUF). The model card's completed local result emphasizes Q5_K_M, MTP enabled, and thinking-off / no-thinking mode; it also notes the 32K fine-tuning target and recommends RoPE/YaRN for contexts beyond 32K. The initial BenchLoop-only runs used `--ctx-size 32768`; the later Q5_K_M max-context rerun used `--ctx-size 262144`. All rows in this table used `--reasoning off`, `--spec-type draft-mtp --spec-draft-n-min 1 --spec-draft-n-max 2`, launcher sampler defaults `0.85 / 0.95 / 20`, `q8_0/q8_0` KV, and llama.cpp `b9551` Vulkan. Server logs confirmed `chat template, thinking = 0`; saved `run.json` files contained zero `<think>` / `</think>` tags.

| Model / file | Max ctx | BL overall | BL quality | BL speed | BL gen | Coding | Toolcall | Agent | Dataextract | Instructfollow | Reasonmath | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `Qwopus3.6-27B-Coder-MTP-Q4_K_M.gguf` | 32768 | 75.36 | 83.91 | 53.35 | 18.52 tok/s | 100.00 | 78.33 | 96.88 | 81.57 | 66.67 | 80.00 | 933.1s |
| `Qwopus3.6-27B-Coder-MTP-Q5_K_M.gguf` | 32768 | 76.87 | 85.74 | 51.64 | 16.82 tok/s | 100.00 | 96.67 | 96.88 | 80.88 | 66.67 | 73.33 | 987.4s |
| `Qwopus3.6-27B-Coder-MTP-Q5_K_M.gguf` | 262144 | 76.76 | 85.74 | 51.11 | 16.40 tok/s | 100.00 | 96.67 | 96.88 | 80.88 | 66.67 | 73.33 | 1018.5s |

The Q5_K_M `262144` row is the max-context rerun requested after the initial `32768` pass. Server logs confirmed `new slot, n_ctx = 262144`; peak prompt cache reached `8191.6 MiB` of the `8192 MiB` cap.

Follow-up Q5_K_M temperature sweep used the retired Qwen adapter runner with sampler-only policies because raw BenchLoop task payloads override server sampler defaults. These rows enforced outgoing request sampler values, kept `--reasoning off` and MTP draft `1-2`, and left result scoring otherwise to BenchLoop. Adapter logs had 120 calls per run and no retries; server logs confirmed `n_max=2`, `new slot, n_ctx = 32768`, and `chat template, thinking = 0`. The adapter stripped residual think blocks from 3 responses in each run, and saved `run.json` files contained zero `<think>` / `</think>` tags.

| Model / file | Request sampler | Max ctx | BL overall | BL quality | BL speed | BL gen | Coding | Toolcall | Agent | Dataextract | Instructfollow | Reasonmath | Runtime |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `Qwopus3.6-27B-Coder-MTP-Q5_K_M.gguf` | `0.90 / 0.95 / 20` | 32768 | 75.70 | 84.20 | 51.46 | 16.59 tok/s | 87.50 | 90.00 | 96.88 | 80.83 | 70.00 | 80.00 | 1080.0s |
| `Qwopus3.6-27B-Coder-MTP-Q5_K_M.gguf` | `0.95 / 0.95 / 20` | 32768 | 75.18 | 83.84 | 51.26 | 16.41 tok/s | 93.75 | 90.00 | 96.88 | 81.30 | 67.78 | 73.33 | 1096.8s |

## Nex N2 Mini BenchLoop (2026-06-12)

Requested run for [`bartowski/nex-agi_Nex-N2-mini-GGUF`](https://huggingface.co/bartowski/nex-agi_Nex-N2-mini-GGUF) file `nex-agi_Nex-N2-mini-IQ4_NL.gguf` (`19,861,346,304` bytes). The model card lists the prompt format with `<think>` and notes the quants were made with llama.cpp `b9590`; local run used the newer local `rocmfp4-llama` Vulkan build (`1faa48e`) because the packaged `b9551` runner predates the local Qwen3Next build. The requested `--tp 2`, `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder`, and `--mamba-scheduler-strategy extra_buffer` flags are not accepted by local llama.cpp; parser behavior for this historical run used the retired Qwen parser policy. New parser work should use `proxy-lan-server/gemma_qwen_merged_policy.json`.

Server settings: `--ctx-size 262144`, `--reasoning auto`, `q8_0/q8_0` KV, no speculative decoding, request sampler `0.7 / 0.95 / 40`. Server logs confirmed `new slot, n_ctx = 262144`, `chat template, thinking = 1`, and peak prompt cache `8190.3 MiB`; saved `run.json` contained zero `<think>` / `</think>` tags after the parser pass.

| Model / file | Mode | Max ctx | BL overall | BL quality | BL speed | BL gen | Coding | Toolcall | Agent | Dataextract | Instructfollow | Reasonmath | Runtime |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `nex-agi_Nex-N2-mini-IQ4_NL.gguf` | Qwen3 parser harness | 262144 | 79.13 | 82.49 | 70.49 | 48.67 tok/s | 85.42 | 80.00 | 96.88 | 75.98 | 83.33 | 73.33 | 667.0s |
