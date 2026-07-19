# macOS M1 Pro Agent Guide

## Supported Entry Points

- `scripts/run_gemma4_12b_promoted_serve.sh`: starts the promoted 12B llama-server on `:8091` and shared harness on `:8092`.
- `scripts/run_gemma4_12b_harness_optimized.sh`: thin 12B harness benchmark wrapper.
- `scripts/run_gemma4_nmax2_benchloop_matrix.sh`: configurable raw/harness matrix runner.
- `scripts/analyze_gemma4_run.mjs`: summarizes one BenchLoop `run.json`.
- `scripts/copy_latest_benchloop_run.mjs`: copies the newest BenchLoop result into a requested output directory.

Scripts resolve local assets from `LLM_ROOT`, then `CODEX_ROOT`, then this directory. Models, llama.cpp builds, logs, and result trees are not committed.

## Promoted Profile

Gemma 4 12B QAT uses the Unsloth Q4 target and Q8 MTP draft, `--spec-draft-n-max 2`, reasoning off, q4 target/draft KV, and `-c 0 --fit on --fit-target 28672`. The harness uses `../proxy-lan-server/gemma_qwen_merged_policy.json`.

```bash
bash scripts/run_gemma4_12b_promoted_serve.sh
bash scripts/run_gemma4_12b_harness_optimized.sh
```

The OpenAI-compatible harness endpoint is `http://127.0.0.1:8092/v1`.

## Guidance

Keep Gemma sampler defaults at `1.0 / 0.95 / 64 / min_p 0.0`; preserve explicit client values. Do not enable reasoning for the promoted MTP profile without a measured quality rerun. Add durable benchmark results to the repository root README, not generated artifact directories.
