# Local LLM Agent Settings

Use this as the short runbook for agent-friendly local serving. Keep the current benchmark table in the repo root README; historical Windows BenchLoop notes live in `historical-benchloop.md`.

Run scripts from this directory (`windows-strix-halo/`). Paths below are relative to here.

All benchmark results should be written to `..\README.md` (repo root; same content as [okasi/local-llm-experiments](https://github.com/okasi/local-llm-experiments)).

## Defaults

Every model uses these unless a row-specific override is documented in the README:

- `--reasoning auto`
- `--ctx-size` at each model's largest supported window for native-max benchmark rows
- For agent-facing LAN serving, prefer the fast prefill profile: `-c 131072 -b 4096 -ub 1024`.
- Use `131072` as the maximum serving and benchmark context unless the user explicitly asks for a larger context run. Larger windows such as `262144` make prefills too slow for normal comparisons.
- Exact LAN preset we recommend for Qwopus 35B no-reasoning + Whisper ASR:

```powershell
--ctx-size 131072                         # Context window: 128K tokens
-n 32768                                  # Max generated tokens

-ngl 999                                  # Offload all layers to GPU
--flash-attn on                           # Enable Flash Attention
--no-mmap                                 # Better Strix Halo behavior

-b 4096                                   # Prompt batch size
-ub 1024                                  # Micro-batch size
--parallel 1                              # Single active sequence

--cache-type-k q4_0                       # Quantized K cache, saves memory
--cache-type-v q4_0                       # Quantized V cache, saves memory

--temp "0.85"                            # Model-family temperature
--top-k "20"                             # Model-family top-k
--top-p 0.95                              # Nucleus sampling
--min-p 0.0                               # Disable min-p cutoff
--presence-penalty 0.0                    # No topic novelty penalty
--repeat-penalty 1.0                      # No repetition penalty
--seed 3407                               # Reproducible sampling

--reasoning off                           # Disable reasoning mode
--chat-template-kwargs '{"enable_thinking":false,"preserve_thinking":false}' # Disable/purge thinking

--image-min-tokens "1024"                  # Vision token floor

--spec-type draft-mtp                     # Use MTP speculative decoding
--spec-draft-n-min 1                      # Minimum draft tokens
--spec-draft-n-max 2                      # Maximum draft tokens
--spec-draft-type-k q4_0                  # Quantized draft K cache
--spec-draft-type-v q4_0                  # Quantized draft V cache
```

The launch scripts expose `-BatchSize`, `-UBatchSize`, and `-ThreadsBatch`; keep benchmark defaults on the fast prefill profile with `-BatchSize 4096` and `-UBatchSize 1024`, and set these to `0` only when explicitly testing memory-sensitive baselines.

For merged Gemma/Qwen harness work, do not tune sampler settings unless the user explicitly requests a sampler sweep. Keep Gemma 4 pinned to `temp=1.0`, `top_p=0.95`, `top_k=64`, `min_p=0.0`; keep Qwen/Qwopus pinned to `temp=0.85`, `top_p=0.95`, `top_k=20`, `min_p=0.0`. Treat those as defaults for clients that omit sampler fields, and respect explicit sampler values from raw-compatible clients. Improvements should come from generic protocol adaptation, parser behavior, retries, and output normalization.

## Runtime Base

Start `llama-server` with the model file, then add the shared runtime, KV cache, family sampler, and any family add-ons.

```powershell
.\tools\llama-b9551-bin-win-vulkan-x64\llama-server.exe `
  --model <model.gguf> `
  --host 0.0.0.0 `
  --port 8080 `
  -c 131072 `
  --ngl 99 `
  -np 1 `
  --flash-attn on `
  --reasoning auto `
  --seed 3407 `
  -n 32768
```

## KV Cache

Default:

```powershell
--cache-type-k q4_0 `
--cache-type-v q4_0
```

For MTP draft KV, use the same cache precision:

```powershell
--spec-draft-type-k q4_0 `
--spec-draft-type-v q4_0
```

Use q8/q8 or f16/f16 only when deliberately running a comparison matrix or reproducing an older benchmark.

## Qwopus

Use the shared defaults for `--reasoning auto`. Native-max benchmark rows use `--ctx-size 262144`; agent-facing LAN shortcuts use the prompt-reuse profile `-c 131072 -b 4096 -ub 1024`.

Sampler:

```powershell
--temp 0.85 `
--top-p 0.95 `
--top-k 20 `
--min-p 0.0 `
--presence-penalty 0.0 `
--repeat-penalty 1.0
```

MTP add-on, only for MTP GGUF files:

```powershell
--spec-type draft-mtp `
--spec-draft-n-min 1 `
--spec-draft-n-max 2
```

Models covered by this preset:

- `Jackrong/Qwopus3.6-27B-v2-MTP-GGUF / Qwopus3.6-27B-v2-MTP-IQ4_XS.gguf`
- **Primary 35B:** `Jackrong/Qwopus3.6-35B-A3B-v1-MTP-GGUF / Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M.gguf` with `--spec-draft-n-max 2`, sampler `0.85 / 0.95 / 20`, `--reasoning off`

Vision:

- Qwopus 27B MTP: use the matching non-MTP Qwopus 27B v2 mmproj.
- Qwopus 35B: use the Jackrong 35B `mmproj-F32.gguf`.
- For image-heavy runs, compare with MTP off.

## Gemma 4

Context:

- E2B/E4B: `--ctx-size 131072` (128K max)
- 12B, 26B A4B, 31B: `--ctx-size 131072` for normal serving and benchmarks, even though these models support 256K, because `262144` prefills are too slow.

Sampler:

```powershell
--temp 1.0 `
--top-p 0.95 `
--top-k 64 `
--min-p 0.0 `
--presence-penalty 0.0 `
--repeat-penalty 1.0 `
--reasoning auto
```

Models covered by this preset:

- `unsloth/gemma-4-E2B-it-GGUF / gemma-4-E2B-it-Q5_K_M.gguf`
- `unsloth/gemma-4-E4B-it-GGUF / gemma-4-E4B-it-Q4_K_M.gguf`
- `unsloth/gemma-4-E4B-it-qat-GGUF / gemma-4-E4B-it-qat-UD-Q4_K_XL.gguf`
- `unsloth/gemma-4-12b-it-GGUF / gemma-4-12b-it-UD-Q4_K_XL.gguf`
- `unsloth/gemma-4-12B-it-qat-GGUF / gemma-4-12B-it-qat-UD-Q4_K_XL.gguf`
- `TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2-GGUF / gemma-4-26B-A4B-it-Claude-Opus-Distill.q5_k_m.gguf`
- `AEON-7/Gemma-4-12B-it-AEON-Abliterated-K4-BF16 / AEON-Gemma-4-12B-it-AEON-Abliterated-K4-BF16.BF16.gguf`

Vision:

- E2B/E4B: `--mmproj <matching-gemma4-mmproj.gguf> --image-min-tokens 256`
- 12B/AEON: use `ggml-org/gemma-4-12B-it-GGUF / mmproj-gemma-4-12B-it-Q8_0.gguf`; add `--image-min-tokens 280` only for complex images.
- 26B A4B: use the matching repo `mmproj-F16.gguf` with `--image-min-tokens 256`.

MTP add-on for Unsloth Gemma 4 QAT (needs llama.cpp b9551+ with Gemma4 MTP, merged 2026-06-07/08):

```powershell
--model-draft <repo>/MTP/gemma-4-<size>-it-Q8_0-MTP.gguf `
--spec-type draft-mtp `
--spec-draft-n-max 2
```

QAT repos also ship root `mtp-gemma-4-<size>-it.gguf` for `-hf` auto-discovery. Our harness resolves `ModelDraftFile` under the model snapshot's `MTP/` folder.

- E2B/E4B QAT: PR ggml-org/llama.cpp#24282
- 12B/26B-A4B/31B QAT: PR ggml-org/llama.cpp#23398
- E4B QAT MTP: run with `--flash-attn off` (Unsloth note)

Notes:

- Use llama.cpp b9551 or newer for Gemma 4 QAT MTP; b9535 cannot load `gemma4-assistant` drafters.
- For 12B/26B/31B QAT vision, add `--cache-ram 0 --ctx-checkpoints 0`.
- Only use `--ctx-size 262144` for explicit long-context runs requested by the user.
- Bench Gemma 4 QAT + MTP: `.\Run-Gemma4-QAT-MTP.ps1`

## Tool Calling

Use the same family preset for normal replies, coding, and tool calls.

Agent loop rules:

- Cap tool turns in the client.
- Stop after a tool result is sufficient to answer.
- Preserve OpenAI `tools` exactly when proxying `/v1/chat/completions`.
- Preserve Anthropic `tools`, `tool_use`, and `tool_result` blocks.
- Prefer compact, explicit tool schemas.
