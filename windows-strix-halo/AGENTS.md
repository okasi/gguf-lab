# Local LLM Agent Settings

Use this as the short runbook for agent-friendly local serving. Keep benchmark tables, shortcut details, and long model commentary in the repo root README.

Run scripts from this directory (`windows-strix-halo/`). Paths below are relative to here.

All benchmark results should be written to `..\README.md` (repo root; same content as [okasi/local-llm-experiments](https://github.com/okasi/local-llm-experiments)).

## Runtime Base

Start `llama-server` with the model file, then add the shared runtime, KV cache, family sampler, and any family add-ons.

```powershell
.\tools\llama-b9535-bin-win-vulkan-x64\llama-server.exe `
  --model <model.gguf> `
  --host 0.0.0.0 `
  --port 8080 `
  --ctx-size 262144 `
  --ngl 99 `
  -np 1 `
  --flash-attn on `
  --seed 3407 `
  -n 32768
```

Do not add `--batch-size`, `--ubatch-size`, or `--split-mode` by default. Local tests showed llama.cpp defaults were as good or better and used less memory.

## KV Cache

Default:

```powershell
--cache-type-k q8_0 `
--cache-type-v q8_0
```

Memory fallback for large models only:

```powershell
--cache-type-k q4_0 `
--cache-type-v q4_0
```

Keep q8/q8 for small Gemma E2B/E4B unless you are deliberately retesting quality loss.

## Qwen/Qwopus/Holo

Sampler:

```powershell
--temp 0.75 `
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
- `Jackrong/Qwopus3.6-35B-A3B-v1-GGUF / Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf`
- `Hcompany/Holo-3.1-35B-A3B-GGUF / q4_k_m.gguf`
- `Jackrong/Qwopus3.5-9B-Coder-GGUF / Qwopus3.5-9B-coder-Exp-Q5_K_M.gguf`

Vision:

- Qwopus 27B MTP: use the matching non-MTP Qwopus 27B v2 mmproj.
- Qwopus 35B/Holo 35B: use a compatible 35B A3B mmproj.
- For image-heavy runs, compare with MTP off.

## Gemma 4

Sampler:

```powershell
--temp 1.0 `
--top-p 0.95 `
--top-k 64 `
--min-p 0.0 `
--presence-penalty 0.0 `
--repeat-penalty 1.0 `
--reasoning off `
--chat-template-kwargs '{"enable_thinking":false}'
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

Notes:

- Use llama.cpp b9518 or newer.
- Keep thinking disabled for coding and agent benchmarks.
- Use `--reasoning auto` only as a separately labeled Gemma reasoning test.
- For 12B QAT vision on b9535, add `--cache-ram 0 --ctx-checkpoints 0`.
- If a large Gemma file does not fit, lower `--ctx-size` to `131072` before lowering KV precision.

## Tool Calling

Use the same family preset for normal replies, coding, and tool calls.

Agent loop rules:

- Cap tool turns in the client.
- Stop after a tool result is sufficient to answer.
- Preserve OpenAI `tools` exactly when proxying `/v1/chat/completions`.
- Preserve Anthropic `tools`, `tool_use`, and `tool_result` blocks.
- Prefer compact, explicit tool schemas.
