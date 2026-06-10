# macOS M1 Pro Agent Notes

## Promoted Gemma 4 12B serving — Unsloth MTP nmax2

Default to **Unsloth MTP, `--spec-draft-n-max 2`, reasoning off, f16 KV, `-c 0`** on Apple M1 Pro 32 GB. Best all-suite BenchLoop result: overall **78.9**, **21.65 gen tok/s**, ~957s runtime. Full table: [`results/benchloop/gemma4-12b-qat-full-summary.md`](results/benchloop/gemma4-12b-qat-full-summary.md).

| item | value |
|---|---|
| Target | `models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` |
| MTP draft | `models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf` |
| Sampler | `--temp 1 --top-p 0.95 --top-k 64 -n 256` |
| Context | `-c 0` with `--fit on --fit-target 16384` (16 GB inference cap) |

```bash
# BenchLoop rerun (from macos-m1-pro/)
SPEC_DRAFT_N_MAX=2 REASONING=off CTX_SIZE=0 \
  bash scripts/run_gemma4_12b_qat_mtp_benchloop.sh
```

Direct `llama-server`:

```bash
llama-server \
  -m models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf \
  --model-draft models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf \
  -c 0 --fit on --fit-target 16384 \
  -ngl 999 -ngld 999 -fa on \
  --spec-type draft-mtp --spec-draft-n-max 2 \
  --reasoning off --jinja -np 1 \
  --temp 1 --top-p 0.95 --top-k 64 -n 256
```

Do not use **reasoning on** with MTP for quality work (instructfollow/reasonmath regress badly). Do not use Janvitos MTP configs in this tree.

## Gemma 4 E2B/E4B QAT + Fastify harness

- Benchmark artifacts live under `results/benchloop/`.
- Fastify BenchLoop harness: `gemma4_benchloop_harness_fastify/` (`npm install && npm test`).
- Promoted harness policy: `gemma4_benchloop_harness_fastify/configs/gemma4_qat_q4_optimized_policy.json`.
- Optimized all-category runner: `./scripts/run_gemma4_harness_optimized.sh`.
- Models and `llama.cpp` are local-only; not committed to the repo.
