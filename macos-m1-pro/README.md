# macOS M1 Pro — Gemma 4 QAT BenchLoop Experiments

Apple **M1 Pro, 32 GB unified memory**, Metal backend via `llama.cpp` `llama-server`.

## Hardware & stack

| item | value |
|---|---|
| Machine | GMKtec-style dev Mac / M1 Pro 32 GB |
| Backend | llama.cpp Metal (`-ngl 999` or `all`) |
| BenchLoop | v0.2.3, `BENCHLOOP_NO_SUBMIT=1` |
| Model | `unsloth/gemma-4-12b-it-qat-GGUF` · `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` |
| MTP draft | `MTP/gemma-4-12B-it-Q8_0-MTP.gguf` (official Unsloth) |
| llama.cpp | `76da245` (Gemma4 MTP, PR #23398) |

Models and `llama.cpp` builds are **not** vendored in this repo. Place GGUF files under `macos-m1-pro/models/` locally, or override paths in the run scripts.

## Quick links

| artifact | path |
|---|---|
| **Full 12B summary table** | [results/benchloop/gemma4-12b-qat-full-summary.md](results/benchloop/gemma4-12b-qat-full-summary.md) |
| KV Q8 2×2 comparison | [results/benchloop/kv-q8-2x2-comparison.md](results/benchloop/kv-q8-2x2-comparison.md) |
| Unsloth MTP sweep (8 configs) | [results/benchloop/gemma4-12b-qat-unsloth-mtp-sweep-16gb-maxctx/](results/benchloop/gemma4-12b-qat-unsloth-mtp-sweep-16gb-maxctx/) |
| Fastify harness optimization | [results/benchloop/gemma4-fastify-optimization-forensic3/](results/benchloop/gemma4-fastify-optimization-forensic3/) |
| Run scripts | [scripts/](scripts/) |
| Original project README | [SOURCE-README.md](SOURCE-README.md) |

## Best 12B config (reasoning off)

**Unsloth MTP, n-max=2, f16 KV, `-c 0`:**

- overall **78.9**, **21.65 gen tok/s**, 957s runtime
- draft acceptance ~84%
- load RSS ~11.6 GB

```bash
llama-server \
  -m models/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf \
  --model-draft models/gemma-4-12B-it-qat-GGUF/MTP/gemma-4-12B-it-Q8_0-MTP.gguf \
  -c 0 -ngl 999 -ngld 999 -fa on \
  --spec-type draft-mtp --spec-draft-n-max 2 \
  --reasoning off --temp 1 --top-p 0.95 --top-k 64 -n 256 --jinja -np 1
```

## Master results (12 configs + baselines)

See [gemma4-12b-qat-full-summary.md](results/benchloop/gemma4-12b-qat-full-summary.md) for the complete table. Highlights:

| config | overall | gen tok/s | runtime | load RSS |
|---|---:|---:|---:|---:|
| No MTP f16 (`-c 4096`) | 77.8 | 15.70 | 1477s | 7.0 GB |
| No MTP KV Q8 (`-c 0`) | 76.9 | 14.12 | 1735s | 9.0 GB |
| **Unsloth MTP nmax2 f16** | **78.9** | **21.65** | **957s** | 11.6 GB |
| Unsloth MTP nmax2 KV Q8 | 76.9 | 15.83 | 1723s | 9.6 GB |

Janvitos MTP results are **excluded** from this directory.

## Optimized Fastify harness

The promoted Gemma 4 BenchLoop harness is [`../gemma4_benchloop_harness_fastify/`](../gemma4_benchloop_harness_fastify/).

```bash
cd ../gemma4_benchloop_harness_fastify && npm install && npm test
./scripts/run_gemma4_harness_optimized.sh   # from macos-m1-pro/
```

## Re-running benchmarks

From `macos-m1-pro/` (requires local `llama.cpp` build and models):

```bash
# 12B MTP single config
OUT_DIR=results/benchloop/my-run \
  SPEC_DRAFT_N_MAX=2 REASONING=off CTX_SIZE=0 \
  bash scripts/run_gemma4_12b_qat_mtp_benchloop.sh

# 12B no-MTP KV Q8
OUT_DIR=results/benchloop/my-run \
  CACHE_TYPE_K=q8_0 CACHE_TYPE_V=q8_0 CTX_SIZE=0 \
  bash scripts/run_gemma4_12b_qat_benchloop.sh

# Regenerate summary tables
node scripts/summarize_gemma4_12b_full.mjs
```
