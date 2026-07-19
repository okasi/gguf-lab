# macOS M1 Pro

Gemma 4 QAT/MTP experiments for an Apple M1 Pro with 32 GB unified memory and llama.cpp Metal. Models, llama.cpp builds, logs, and BenchLoop result trees are local-only; promoted results are retained in the repository root [`README.md`](../README.md).

## Promoted 12B Profile

- target: `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf`
- draft: `MTP/gemma-4-12B-it-Q8_0-MTP.gguf`
- speculative decoding: MTP, n-max 2
- context: `-c 0 --fit on --fit-target 28672`
- target/draft KV: `q4_0`
- reasoning: off
- sampler: `temp 1.0`, `top_p 0.95`, `top_k 64`
- upstream: `http://127.0.0.1:8091`
- shared harness: `http://127.0.0.1:8092/v1`

```bash
# Serve the promoted profile.
bash scripts/run_gemma4_12b_promoted_serve.sh

# Run its harness benchmark.
bash scripts/run_gemma4_12b_harness_optimized.sh

# Run a configurable raw/harness matrix.
bash scripts/run_gemma4_nmax2_benchloop_matrix.sh
```

Paths resolve from `LLM_ROOT`, then `CODEX_ROOT`, then this directory. See [`AGENTS.md`](AGENTS.md) for the maintained script map and [`docs/proxy-lan-server-clients.md`](docs/proxy-lan-server-clients.md) for client configuration.
