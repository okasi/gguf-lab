# macOS M1 Pro Agent Notes

## Promoted Gemma 4 12B serving — Unsloth MTP nmax2, KV Q4, no cap

Default to **Unsloth MTP, `--spec-draft-n-max 2`, reasoning off, KV `q4_0`, `-c 0` with `--fit-target 28672`** on Apple M1 Pro 32 GB. Serve through the **Gemma 4 harness proxy** on port **8092** (upstream llama-server on **8091**).

Current selected shared harness policy is `temperature=0.90`, `top_p=0.95`, `top_k=64`. Latest 12B all-suite BenchLoop result with harness: overall **79.0**, quality **87.2**, **18.13 gen tok/s**, ~1219s runtime, load RSS **~8.4 GB**. Artifacts: [`results/benchloop/gemma4-12b-quality-goal-20260613/loop-03-temp090/`](results/benchloop/gemma4-12b-quality-goal-20260613/loop-03-temp090/). Matching 26B check: overall **78.8**, quality **84.5** at [`results/benchloop/gemma4-26b-quality-goal-20260613/temp090/`](results/benchloop/gemma4-26b-quality-goal-20260613/temp090/). The current harness policy removes prompt-derived direct answers, prompt-to-tool-call synthesis, prompt-specific answer formatting, and benchmark-specific phrase/word transforms.

| item | value |
|---|---|
| Target | `models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` |
| MTP draft | `models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf` |
| Server sampler | `--temp 1 --top-p 0.95 --top-k 64 -n 256` |
| Harness policy sampler | `temperature=0.90`, `top_p=0.95`, `top_k=64` |
| KV cache | `--cache-type-k q4_0 --cache-type-v q4_0 --spec-draft-type-k q4_0 --spec-draft-type-v q4_0` |
| Context | `-c 0` with `--fit on --fit-target 28672` (no 16 GB cap) |
| Harness policy | `gemma4_harness/configs/gemma4_qat_q4_optimized_policy.json` |
| Model alias | `gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized` |

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

## Gemma 4 E2B/E4B QAT + harness

- Benchmark artifacts live under `results/benchloop/`.
- General Gemma 4 harness: `gemma4_harness/` (`npm install && npm test`).
- Promoted harness policy: `gemma4_harness/configs/gemma4_qat_q4_optimized_policy.json`.
- Optimized all-category runner: `./scripts/run_gemma4_harness_optimized.sh`.
- Keep the harness generic for BenchLoop, OpenClaw/ClawBench, Hermes Agent, opencode, and other OpenAI-compatible clients.
- Models and `llama.cpp` are local-only; not committed to the repo.
