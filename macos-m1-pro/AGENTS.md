# macOS M1 Pro Agent Notes

## Promoted Gemma 4 12B serving — Unsloth MTP nmax2, KV Q4, no cap

Default to **Unsloth MTP, `--spec-draft-n-max 2`, reasoning off, KV `q4_0`, `-c 0` with `--fit-target 28672`** on Apple M1 Pro 32 GB. Serve through the **merged Gemma/Qwen harness proxy** on port **8092** (upstream llama-server on **8091**).

Current selected shared harness policy is `proxy-lan-server/gemma_qwen_merged_policy.json`. It keeps Gemma 4 and Qwen/Qwopus sampler profiles separate, respects explicit client sampler values, and uses shared generic parsing/output-normalization behavior. The 2026-06-15 same-runtime q4_0 BenchLoop rerun improved quality and overall score on E2B, E4B, 12B, and 26B. The current harness policy removes prompt-derived direct answers, prompt-to-tool-call synthesis, prompt-specific answer formatting, and benchmark-specific phrase/word transforms.

| item | value |
|---|---|
| Target | `models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` |
| MTP draft | `models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf` |
| Server sampler | `--temp 1 --top-p 0.95 --top-k 64 -n 256` |
| Harness policy sampler | Gemma defaults: `temperature=1.0`, `top_p=0.95`, `top_k=64`, `min_p=0.0`; Qwen defaults: `temperature=0.85`, `top_p=0.95`, `top_k=20`, `min_p=0.0` |
| KV cache | `--cache-type-k q4_0 --cache-type-v q4_0 --spec-draft-type-k q4_0 --spec-draft-type-v q4_0` |
| Context | `-c 0` with `--fit on --fit-target 28672` (no 16 GB cap) |
| Harness policy | `proxy-lan-server/gemma_qwen_merged_policy.json` |
| Model alias | `gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4_harness` |

```bash
# Daily serve: llama-server + harness proxy (from repo root)
bash macos-m1-pro/scripts/run_gemma4_12b_promoted_serve.sh
# OpenAI endpoint: http://127.0.0.1:8092/v1
```

```bash
# BenchLoop rerun with harness (from macos-m1-pro/)
bash scripts/run_gemma4_12b_harness_optimized.sh
```

Direct `llama-server` (no harness):

```bash
llama-server \
  -m models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf \
  --model-draft models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf \
  -c 0 --fit on --fit-target 28672 \
  -ngl 999 -ngld 999 -fa on \
  --cache-type-k q4_0 --cache-type-v q4_0 \
  --spec-draft-type-k q4_0 --spec-draft-type-v q4_0 \
  --spec-type draft-mtp --spec-draft-n-max 2 \
  --reasoning off --jinja -np 1 \
  --temp 1 --top-p 0.95 --top-k 64 -n 256
```

Do not use **reasoning on** with MTP for quality work (instructfollow/reasonmath regress badly). Do not use Janvitos MTP configs in this tree.

For merged Gemma/Qwen harness policy work, keep family sampler settings pinned and separate: Gemma 4 uses `temperature=1.0`, `top_p=0.95`, `top_k=64`, `min_p=0.0`; Qwen/Qwopus uses `temperature=0.85`, `top_p=0.95`, `top_k=20`, `min_p=0.0`. Treat those as defaults for clients that omit sampler fields, and respect explicit sampler values from raw-compatible clients. Do not change those sampler baselines unless the user explicitly asks for a sampler sweep; optimize generic parsing, protocol adaptation, retries, and output normalization instead.

## Gemma 4 E2B/E4B QAT + harness

- Benchmark artifacts live under `results/benchloop/`.
- Merged Gemma/Qwen harness: `proxy-lan-server/` (`npm install && npm test` from there).
- Promoted harness policy: `proxy-lan-server/gemma_qwen_merged_policy.json`.
- Optimized all-category runner: `./scripts/run_gemma4_harness_optimized.sh`.
- Keep the harness generic for BenchLoop, OpenClaw/ClawBench, Hermes Agent, opencode, and other OpenAI-compatible clients.
- Models and `llama.cpp` are local-only; not committed to the repo.
