# Unsloth Gemma 4 BenchLoop Results

Benchmarks run from 2026-06-05 through 2026-06-07 using `benchloop-cli 0.2.3` with `llama.cpp`.

- Backend: `llama.cpp` `llama-server` OpenAI-compatible endpoint
- Suites: all supported BenchLoop categories plus earlier speed-only comparison runs
- Submission: disabled with `BENCHLOOP_NO_SUBMIT=1`
- Hardware: Apple M1 Pro, 32GB unified memory
- Server settings for completed all-category runs: `-c 4096 -np 1 --jinja --reasoning off -n 256 --temp 1 --top-p 0.95 --top-k 64`

The first completed runs were speed-only, so those report `quality_score` as `0.0`. The all-category runs below include `agent`, `coding`, `dataextract`, `instructfollow`, `reasonmath`, `speed`, and `toolcall`; use these for quality comparisons.

## Gemma 4 Optimized BenchLoop Harness

Targets: `gemma-4-E2B-it-qat-UD-Q4_K_XL` and `gemma-4-E4B-it-qat-UD-Q4_K_XL` with `temp=1.00`, `top_p=0.95`, `top_k=64`.

This harness is a Fastify/OpenAI-compatible proxy in front of `llama.cpp`. BenchLoop still runs with `--provider openai_compat --harness raw`; the proxy preserves BenchLoop's original messages and tool schemas, enforces the requested sampler fields, then repairs Gemma 4 response structure before BenchLoop scores it.

Implemented harness pieces:

- [Fastify runtime proxy](../gemma4_benchloop_harness_fastify/proxy.mjs): `/health`, `/v1/models`, `/v1/chat/completions`, policy loading, sampler enforcement, Gemma response parsing/post-processing, Lezer AST validation for generated Python, Babel AST validation for generated JavaScript/TypeScript, upstream retry handling, JSONL diagnostics.
- [Node failure analyzer](scripts/analyze_gemma4_run.mjs): classifies BenchLoop failures and writes JSON/Markdown analysis reports.
- [Node run copier](scripts/copy_latest_benchloop_run.mjs): copies the latest BenchLoop `run.json` into the local artifact directory.
- [Optimized runner](scripts/run_gemma4_harness_optimized.sh): starts `llama-server`, starts the Fastify proxy, runs BenchLoop, copies the run JSON, and writes analysis artifacts.

Run the fast parser/proxy checks:

```bash
cd ../gemma4_benchloop_harness_fastify && npm install && npm test
```

Run one optimized all-category BenchLoop pass for both target models. The script starts `llama-server`, then the Fastify proxy, then BenchLoop:

```bash
./scripts/run_gemma4_harness_optimized.sh
```

Run only one target model when rechecking a result:

```bash
MODEL_FILTER=gemma-4-E2B-it-qat-UD-Q4_K_XL ./scripts/run_gemma4_harness_optimized.sh
```

The current promoted policy is [../gemma4_benchloop_harness_fastify/configs/gemma4_qat_q4_optimized_policy.json](../gemma4_benchloop_harness_fastify/configs/gemma4_qat_q4_optimized_policy.json), selected from the forensic 3-round Fastify/Node.js optimization sweep layered on top of the Extra5 policy. The historical 17-step schedule is in [../gemma4_benchloop_harness_fastify/configs/gemma4_qat_q4_iteration_schedule.json](../gemma4_benchloop_harness_fastify/configs/gemma4_qat_q4_iteration_schedule.json). Baseline failure analyses used to seed the rules are here:

- [E2B baseline harness analysis](results/benchloop/gemma4-harness-optimized/e2b-baseline-analysis.md)
- [E4B baseline harness analysis](results/benchloop/gemma4-harness-optimized/e4b-baseline-analysis.md)

## Gemma 4 Forensic 3 Optimization Results

Run date: 2026-06-07. This sweep first generated line-by-line task diffs from the Extra5 and Extra3 runs, then tested three targeted policy variants based on those failures. The active shared policy is now iteration 3, `forensic-tool-reason`, with policy version `fastify-forensic3-iter-03-forensic-tool-reason`.

Compared with the prior Extra5 promoted policy, the forensic policy improves average quality by +0.49 and average overall by +1.82. It is not a pure quality win for both models: E2B quality drops slightly while E2B overall improves, and E4B improves on both quality and overall.

| Model | Extra5 Quality | Forensic Quality | Quality Delta | Extra5 Overall | Forensic Overall | Overall Delta |
|---|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 85.53 | 85.39 | -0.15 | 79.75 | 81.35 | +1.60 |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 86.76 | 87.90 | +1.13 | 79.48 | 81.53 | +2.05 |

Best shared iteration: 3 (`forensic-tool-reason`)

| Iteration | Candidate | Avg Quality | Avg Overall | Avg Speed | Avg Reliability | Min Quality | Min Overall | Runtime |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | `forensic-repairs-shared` | 84.80 | 77.87 | 62.04 | 75.28 | 82.73 | 76.25 | 1134.62s |
| 2 | `forensic-json-agent-lean` | 86.60 | 79.65 | 62.48 | 78.09 | 85.55 | 77.92 | 1104.17s |
| 3 | `forensic-tool-reason` | 86.64 | 81.44 | 69.92 | 79.21 | 85.39 | 81.35 | 809.30s |

| Iteration | Model | Quality | Overall | Speed | Reliability | Value | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Tool Call | Gen tok/s | Runtime | Proxy Requests | Preflight | Coding Fallbacks | Real Retries |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 82.73 | 76.25 | 65.27 | 70.79 | 20.93 | 93.75 | 100.00 | 81.75 | 62.23 | 63.67 | 95.00 | 35.75 | 460.75s | 119 | 12 | 12 | 0 |
| 1 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 86.86 | 79.48 | 58.81 | 79.78 | 17.11 | 93.75 | 100.00 | 87.97 | 64.45 | 80.00 | 95.00 | 24.69 | 673.87s | 118 | 12 | 12 | 0 |
| 2 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 87.64 | 81.37 | 67.53 | 78.65 | 27.66 | 96.88 | 100.00 | 84.20 | 67.78 | 77.00 | 100.00 | 40.13 | 433.75s | 121 | 12 | 12 | 0 |
| 2 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 85.55 | 77.92 | 57.42 | 77.53 | 15.31 | 96.88 | 100.00 | 87.77 | 63.33 | 70.33 | 95.00 | 23.08 | 670.42s | 119 | 12 | 12 | 0 |
| 3 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 85.39 | 81.35 | 75.01 | 77.53 | 40.14 | 96.88 | 100.00 | 84.33 | 71.11 | 60.00 | 100.00 | 60.64 | 384.99s | 119 | 12 | 12 | 0 |
| 3 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 87.90 | 81.53 | 64.83 | 80.90 | 24.52 | 96.88 | 100.00 | 87.17 | 63.33 | 86.67 | 93.33 | 34.48 | 424.30s | 119 | 12 | 12 | 0 |

Forensic artifacts:

- [Forensic output analysis summary](results/benchloop/gemma4-forensic-output-analysis/summary.md)
- [Line-by-line task diff](results/benchloop/gemma4-forensic-output-analysis/full-task-diff.md)
- [Forensic3 optimization directory](results/benchloop/gemma4-fastify-optimization-forensic3)
- [Forensic3 summary](results/benchloop/gemma4-fastify-optimization-forensic3/summary.md)
- [Forensic3 run summary CSV](results/benchloop/gemma4-fastify-optimization-forensic3/summary.csv)
- [Forensic3 aggregate CSV](results/benchloop/gemma4-fastify-optimization-forensic3/aggregate-summary.csv)
- [Forensic3 best policy](results/benchloop/gemma4-fastify-optimization-forensic3/best-policy.json)

## Gemma 4 Extra 5 Optimization Results

Run date: 2026-06-07. This sweep tested 5 additional targeted policy variants on top of the previously promoted 20x policy, still preserving BenchLoop prompts and tool schemas.

Iteration 5, `balanced-retry-empty-json-320-896`, was promoted as the active shared policy before the later forensic 3-round sweep superseded it. Compared with the prior 20x promoted policy, it improved average quality by +1.69 and average overall by +4.71.

| Model | Prior 20x Quality | Extra5 Quality | Quality Delta | Prior 20x Overall | Extra5 Overall | Overall Delta |
|---|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 84.68 | 85.53 | +0.85 | 75.63 | 79.75 | +4.12 |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 84.22 | 86.76 | +2.54 | 74.18 | 79.48 | +5.30 |

Best shared iteration: 5 (balanced-retry-empty-json-320-896)

| Iteration | Candidate | Avg Quality | Avg Overall | Avg Speed | Avg Reliability | Min Quality | Min Overall | Runtime |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | `reasonmath-896-instruction-640-coding-128` | 85.27 | 79.08 | 62.57 | 78.65 | 84.30 | 78.68 | 1086.99s |
| 2 | `json-640-tool-256-coding-128` | 85.50 | 79.22 | 62.66 | 78.65 | 83.72 | 78.46 | 1040.03s |
| 3 | `tool-normalize-dedupe-retry-coding-128` | 83.50 | 77.18 | 62.87 | 74.72 | 82.79 | 77.04 | 1044.26s |
| 4 | `json-640-instruction-384-reasonmath-768` | 84.30 | 78.11 | 63.21 | 76.40 | 84.16 | 77.67 | 1053.99s |
| 5 | `balanced-retry-empty-json-320-896` | 86.15 | 79.62 | 62.16 | 79.21 | 85.53 | 79.48 | 1068.21s |

| Iteration | Model | Quality | Overall | Speed | Reliability | Value | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Tool Call | Gen tok/s | Runtime | Proxy Requests | Preflight | Coding Fallbacks | Real Retries |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 84.30 | 78.68 | 67.46 | 75.28 | 25.24 | 96.88 | 100.00 | 77.78 | 64.45 | 66.67 | 100.00 | 39.78 | 440.95s | 119 | 12 | 12 | 0 |
| 1 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 86.24 | 79.47 | 57.69 | 82.02 | 16.45 | 96.88 | 100.00 | 85.55 | 66.67 | 73.33 | 95.00 | 23.26 | 646.04s | 121 | 12 | 12 | 0 |
| 2 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 83.72 | 78.46 | 66.56 | 76.40 | 24.72 | 96.88 | 100.00 | 85.97 | 64.45 | 60.00 | 95.00 | 38.65 | 411.91s | 120 | 12 | 12 | 0 |
| 2 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 87.29 | 79.99 | 58.76 | 80.90 | 17.36 | 96.88 | 100.00 | 88.52 | 70.00 | 73.33 | 95.00 | 24.58 | 628.12s | 120 | 12 | 12 | 0 |
| 3 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 82.79 | 77.31 | 67.60 | 73.03 | 24.37 | 96.88 | 100.00 | 77.63 | 62.23 | 60.00 | 100.00 | 40.30 | 413.57s | 118 | 12 | 12 | 0 |
| 3 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 84.20 | 77.04 | 58.14 | 76.40 | 15.37 | 96.88 | 100.00 | 89.33 | 56.67 | 67.33 | 95.00 | 23.89 | 630.70s | 118 | 12 | 12 | 1 |
| 4 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 84.44 | 78.54 | 67.82 | 74.16 | 25.44 | 96.88 | 100.00 | 83.62 | 64.45 | 66.67 | 95.00 | 40.64 | 414.00s | 120 | 12 | 12 | 0 |
| 4 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 84.16 | 77.67 | 58.61 | 78.65 | 16.16 | 90.62 | 100.00 | 88.77 | 68.89 | 66.67 | 90.00 | 24.41 | 639.99s | 118 | 12 | 12 | 0 |
| 5 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 85.53 | 79.75 | 66.63 | 77.53 | 25.39 | 96.88 | 100.00 | 84.87 | 67.78 | 63.67 | 100.00 | 38.28 | 420.98s | 118 | 12 | 12 | 0 |
| 5 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 86.76 | 79.48 | 57.68 | 80.90 | 16.39 | 96.88 | 100.00 | 87.02 | 66.67 | 80.00 | 90.00 | 23.35 | 647.24s | 117 | 12 | 12 | 0 |

Artifacts:

- [Extra5 optimization directory](results/benchloop/gemma4-fastify-optimization-extra5)
- [Extra5 summary](results/benchloop/gemma4-fastify-optimization-extra5/summary.md)
- [Extra5 run summary CSV](results/benchloop/gemma4-fastify-optimization-extra5/summary.csv)
- [Extra5 aggregate CSV](results/benchloop/gemma4-fastify-optimization-extra5/aggregate-summary.csv)
- [Extra5 best policy](results/benchloop/gemma4-fastify-optimization-extra5/best-policy.json)

## Gemma 4 Extra 3 Analysis Sweep

Run date: 2026-06-07. This follow-up sweep tested 3 more analysis-driven candidates against the Extra5 promoted policy. No new shared policy was promoted: the best extra3 shared result was the control rerun of the existing Extra5 policy, and it remained slightly below the stored Extra5 winner on average quality and overall.

The split result is useful: iteration 2 was best for E2B, while iteration 3 was best for E4B. That suggests the next meaningful improvement is likely model-specific policy selection rather than another single shared policy.

| Iteration | Candidate | Avg Quality | Avg Overall | Avg Speed | Avg Reliability | Min Quality | Min Overall | Runtime |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | `promoted-extra5-control` | 86.01 | 79.08 | 61.96 | 77.53 | 85.68 | 79.01 | 1086.67s |
| 2 | `json-768-instruction-448-default-288` | 85.30 | 78.52 | 62.55 | 76.40 | 84.71 | 76.99 | 1065.75s |
| 3 | `tool-rescue-reason-1024-default-256` | 85.75 | 79.30 | 63.07 | 78.09 | 84.10 | 78.55 | 1096.55s |

| Iteration | Model | Quality | Overall | Speed | Reliability | Value | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Tool Call | Gen tok/s | Runtime | Proxy Requests | Preflight | Coding Fallbacks | Real Retries |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 85.68 | 79.15 | 66.03 | 75.28 | 24.26 | 96.88 | 100.00 | 82.77 | 61.11 | 73.33 | 100.00 | 37.61 | 448.97s | 121 | 12 | 12 | 0 |
| 1 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 86.33 | 79.01 | 57.89 | 79.78 | 16.21 | 96.88 | 100.00 | 87.80 | 63.33 | 80.00 | 90.00 | 23.53 | 637.70s | 118 | 12 | 12 | 0 |
| 2 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 85.88 | 80.06 | 67.21 | 77.53 | 26.45 | 100.00 | 100.00 | 85.87 | 61.11 | 73.33 | 95.00 | 39.73 | 419.26s | 118 | 12 | 12 | 0 |
| 2 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 84.71 | 76.99 | 57.88 | 75.28 | 15.20 | 96.88 | 100.00 | 85.27 | 64.45 | 66.67 | 95.00 | 23.84 | 646.49s | 119 | 12 | 12 | 0 |
| 3 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 84.10 | 78.55 | 67.39 | 75.28 | 25.20 | 87.50 | 100.00 | 84.33 | 64.45 | 73.33 | 95.00 | 39.80 | 460.14s | 122 | 12 | 12 | 0 |
| 3 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 87.40 | 80.04 | 58.75 | 80.90 | 17.43 | 96.88 | 100.00 | 89.17 | 63.33 | 80.00 | 95.00 | 24.65 | 636.41s | 119 | 12 | 12 | 0 |

Artifacts:

- [Extra3 optimization directory](results/benchloop/gemma4-fastify-optimization-extra3)
- [Extra3 summary](results/benchloop/gemma4-fastify-optimization-extra3/summary.md)
- [Extra3 run summary CSV](results/benchloop/gemma4-fastify-optimization-extra3/summary.csv)
- [Extra3 aggregate CSV](results/benchloop/gemma4-fastify-optimization-extra3/aggregate-summary.csv)
- [Extra3 best policy](results/benchloop/gemma4-fastify-optimization-extra3/best-policy.json)

## Gemma 4 Fastify 20-Iteration Optimization Results

Run date: 2026-06-07. `llama.cpp` was run through the Fastify/OpenAI-compatible proxy with `temp=1.00`, `top_p=0.95`, and `top_k=64`.

The optimizer completed 20 benchmark/analyze/re-benchmark iterations for both target models, for 40 all-category BenchLoop runs. Iteration 11, `reasonmath-cap-768-coding-128`, was the best shared policy in this run by average quality before the later Extra5 sweep superseded it. `Real Retries` below excludes the 12 coding preflight rows per run; those are shown separately as `Preflight`.

Compared with the earlier Fastify Node-AST rerun, the promoted 20x policy improves average quality by +3.07 points, while average overall drops by -1.44 because the optimized policy spends more time generating longer answers.

| Model | Earlier Fastify Quality | Promoted 20x Quality | Quality Delta | Earlier Overall | Promoted 20x Overall | Overall Delta |
|---|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 80.42 | 84.68 | +4.26 | 76.19 | 75.63 | -0.56 |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 82.35 | 84.22 | +1.87 | 76.51 | 74.18 | -2.33 |

Best shared iteration: 11 (reasonmath-cap-768-coding-128)

| Iteration | Candidate | Avg Quality | Avg Overall | Avg Speed | Avg Reliability | Min Quality | Min Overall | Runtime |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | `current-node-ast-baseline` | 82.45 | 73.24 | 48.20 | 73.03 | 82.38 | 72.44 | 2216.55s |
| 2 | `coding-cap-512` | 83.45 | 74.44 | 47.93 | 75.84 | 83.27 | 73.28 | 2279.72s |
| 3 | `coding-cap-256` | 81.87 | 72.71 | 47.10 | 73.03 | 80.05 | 71.86 | 2198.10s |
| 4 | `coding-cap-128` | 81.77 | 72.76 | 47.63 | 73.03 | 80.02 | 72.04 | 2265.89s |
| 5 | `coding-cap-64` | 81.79 | 72.67 | 47.83 | 72.47 | 80.16 | 71.93 | 2181.00s |
| 6 | `tool-cap-256-coding-128` | 81.00 | 72.30 | 47.47 | 73.03 | 79.46 | 71.66 | 2255.12s |
| 7 | `tool-cap-384-coding-128` | 81.78 | 72.68 | 47.20 | 73.03 | 80.03 | 71.97 | 2194.83s |
| 8 | `instruction-cap-384-coding-128` | 81.13 | 72.44 | 47.13 | 73.60 | 78.59 | 71.54 | 2215.70s |
| 9 | `instruction-cap-768-coding-128` | 83.08 | 74.19 | 46.95 | 76.40 | 81.63 | 73.90 | 2291.01s |
| 10 | `default-cap-384-coding-128` | 82.80 | 73.60 | 47.63 | 74.16 | 81.35 | 73.12 | 2449.33s |
| 11 | `reasonmath-cap-768-coding-128` | 84.45 | 74.91 | 46.79 | 76.40 | 84.22 | 74.18 | 2543.60s |
| 12 | `json-cap-768-coding-128` | 83.69 | 74.42 | 46.46 | 76.40 | 82.38 | 73.97 | 2367.56s |
| 13 | `normalize-tool-args-coding-128` | 83.09 | 74.02 | 46.09 | 76.40 | 82.55 | 73.49 | 2298.50s |
| 14 | `dedupe-tool-calls-coding-128` | 81.70 | 72.58 | 46.26 | 73.60 | 79.27 | 71.45 | 2342.38s |
| 15 | `normalize-and-dedupe-coding-128` | 83.31 | 73.88 | 45.52 | 75.84 | 82.95 | 72.72 | 2468.93s |
| 16 | `retry-malformed-json-coding-128` | 82.24 | 72.60 | 46.23 | 72.47 | 80.51 | 71.83 | 2385.40s |
| 17 | `retry-empty-and-json-coding-128` | 83.13 | 73.83 | 45.74 | 75.84 | 82.06 | 73.64 | 2522.37s |
| 18 | `single-retry-coding-128` | 84.35 | 74.54 | 45.23 | 76.40 | 83.11 | 74.19 | 2416.98s |
| 19 | `triple-retry-coding-128` | 82.50 | 72.97 | 45.27 | 74.16 | 82.11 | 72.40 | 2483.02s |
| 20 | `broad-quality-caps-coding-128` | 83.92 | 74.16 | 46.61 | 74.72 | 82.03 | 73.29 | 2772.68s |

| Iteration | Model | Quality | Overall | Speed | Reliability | Value | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Tool Call | Gen tok/s | Runtime | Proxy Requests | Preflight | Coding Fallbacks | Real Retries |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 82.38 | 74.05 | 53.84 | 71.91 | 11.13 | 96.88 | 100.00 | 82.95 | 61.11 | 53.33 | 100.00 | 18.79 | 831.70s | 119 | 12 | 12 | 1 |
| 1 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 82.52 | 72.44 | 42.56 | 74.16 | 6.15 | 100.00 | 100.00 | 80.65 | 57.78 | 66.67 | 90.00 | 10.06 | 1384.84s | 119 | 12 | 12 | 1 |
| 2 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 83.63 | 75.61 | 53.97 | 75.28 | 11.92 | 96.88 | 100.00 | 82.10 | 67.78 | 60.00 | 95.00 | 18.93 | 825.35s | 119 | 12 | 12 | 1 |
| 2 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 83.27 | 73.28 | 41.89 | 76.40 | 6.17 | 93.75 | 100.00 | 89.18 | 66.67 | 60.00 | 90.00 | 9.69 | 1454.36s | 118 | 12 | 12 | 1 |
| 3 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 80.05 | 71.86 | 52.08 | 69.66 | 9.58 | 90.62 | 100.00 | 79.90 | 64.45 | 50.33 | 95.00 | 17.18 | 820.00s | 118 | 12 | 12 | 0 |
| 3 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 83.70 | 73.56 | 42.12 | 76.40 | 6.29 | 96.88 | 100.00 | 86.97 | 63.33 | 60.00 | 95.00 | 9.84 | 1378.11s | 119 | 12 | 12 | 0 |
| 4 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 80.02 | 72.04 | 53.04 | 69.66 | 10.03 | 96.88 | 100.00 | 82.15 | 64.45 | 46.67 | 90.00 | 17.99 | 847.19s | 120 | 12 | 12 | 0 |
| 4 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 83.51 | 73.48 | 42.23 | 76.40 | 6.33 | 93.75 | 100.00 | 82.33 | 63.33 | 66.67 | 95.00 | 9.92 | 1418.70s | 120 | 12 | 12 | 0 |
| 5 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 80.16 | 71.93 | 53.56 | 68.54 | 10.23 | 93.75 | 100.00 | 79.40 | 61.11 | 46.67 | 100.00 | 18.63 | 798.67s | 119 | 12 | 12 | 0 |
| 5 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 83.42 | 73.40 | 42.10 | 76.40 | 6.28 | 96.88 | 100.00 | 85.33 | 66.67 | 60.00 | 91.67 | 9.85 | 1382.33s | 119 | 12 | 12 | 0 |
| 6 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 79.46 | 71.66 | 52.70 | 69.66 | 9.80 | 90.62 | 100.00 | 81.70 | 61.11 | 53.33 | 90.00 | 17.71 | 825.32s | 122 | 12 | 12 | 0 |
| 6 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 82.55 | 72.95 | 42.23 | 76.40 | 6.23 | 93.75 | 100.00 | 88.22 | 63.33 | 60.00 | 90.00 | 9.87 | 1429.80s | 119 | 12 | 12 | 0 |
| 7 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 80.03 | 71.97 | 52.69 | 69.66 | 9.84 | 93.75 | 100.00 | 79.22 | 65.56 | 46.67 | 95.00 | 17.64 | 838.58s | 120 | 12 | 12 | 0 |
| 7 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 83.53 | 73.38 | 41.72 | 76.40 | 6.15 | 96.88 | 100.00 | 85.95 | 63.33 | 60.00 | 95.00 | 9.64 | 1356.25s | 119 | 12 | 12 | 0 |
| 8 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 78.59 | 71.54 | 53.12 | 70.79 | 10.03 | 93.75 | 100.00 | 74.65 | 64.45 | 43.67 | 95.00 | 18.02 | 834.51s | 119 | 12 | 12 | 0 |
| 8 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 83.67 | 73.34 | 41.13 | 76.40 | 5.97 | 90.62 | 100.00 | 83.03 | 66.67 | 66.67 | 95.00 | 9.33 | 1381.19s | 118 | 12 | 12 | 0 |
| 9 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 81.63 | 73.90 | 52.31 | 74.16 | 10.55 | 96.88 | 100.00 | 81.75 | 64.45 | 46.67 | 100.00 | 17.43 | 873.53s | 118 | 12 | 12 | 0 |
| 9 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 84.54 | 74.48 | 41.58 | 78.65 | 6.35 | 90.62 | 100.00 | 88.30 | 73.33 | 60.00 | 95.00 | 9.56 | 1417.48s | 121 | 12 | 12 | 0 |
| 10 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 81.35 | 73.12 | 53.38 | 70.79 | 10.55 | 96.88 | 100.00 | 84.02 | 58.89 | 53.33 | 95.00 | 18.31 | 885.93s | 119 | 12 | 12 | 0 |
| 10 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 84.24 | 74.09 | 41.87 | 77.53 | 6.31 | 96.88 | 100.00 | 89.12 | 64.45 | 60.00 | 95.00 | 9.66 | 1563.40s | 119 | 12 | 12 | 0 |
| 11 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 84.68 | 75.63 | 52.59 | 74.16 | 11.05 | 96.88 | 100.00 | 79.57 | 63.33 | 73.33 | 95.00 | 17.59 | 903.98s | 120 | 12 | 12 | 0 |
| 11 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 84.22 | 74.18 | 40.99 | 78.65 | 6.11 | 96.88 | 100.00 | 83.45 | 63.33 | 66.67 | 95.00 | 9.22 | 1639.61s | 121 | 12 | 12 | 0 |
| 12 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 82.38 | 73.97 | 52.04 | 73.03 | 10.31 | 93.75 | 100.00 | 82.73 | 64.45 | 53.33 | 100.00 | 17.13 | 880.19s | 119 | 12 | 12 | 0 |
| 12 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 85.01 | 74.87 | 40.88 | 79.78 | 6.22 | 96.88 | 100.00 | 86.48 | 66.67 | 60.00 | 100.00 | 9.17 | 1487.37s | 120 | 12 | 12 | 0 |
| 13 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 82.55 | 74.55 | 51.65 | 75.28 | 10.52 | 96.88 | 100.00 | 81.98 | 64.45 | 57.00 | 95.00 | 16.92 | 891.53s | 119 | 12 | 12 | 0 |
| 13 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 83.64 | 73.49 | 40.52 | 77.53 | 5.83 | 96.88 | 100.00 | 84.38 | 65.55 | 60.00 | 95.00 | 8.99 | 1406.96s | 119 | 12 | 12 | 0 |
| 14 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 79.27 | 71.45 | 52.17 | 69.66 | 9.53 | 93.75 | 100.00 | 75.78 | 64.45 | 46.67 | 95.00 | 17.25 | 879.93s | 120 | 12 | 12 | 0 |
| 14 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 84.12 | 73.72 | 40.34 | 77.53 | 5.83 | 96.88 | 100.00 | 82.85 | 63.33 | 66.67 | 95.00 | 8.94 | 1462.46s | 119 | 12 | 12 | 0 |
| 15 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 83.66 | 75.05 | 51.06 | 75.28 | 10.14 | 96.88 | 100.00 | 82.30 | 74.45 | 53.33 | 95.00 | 16.10 | 879.02s | 119 | 12 | 12 | 0 |
| 15 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 82.95 | 72.72 | 39.98 | 76.40 | 5.54 | 90.62 | 100.00 | 87.63 | 64.45 | 60.00 | 95.00 | 8.75 | 1589.91s | 118 | 12 | 12 | 0 |
| 16 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 80.51 | 71.83 | 52.08 | 68.54 | 9.42 | 84.38 | 100.00 | 85.55 | 61.11 | 57.00 | 95.00 | 17.07 | 918.95s | 121 | 12 | 12 | 0 |
| 16 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 83.97 | 73.36 | 40.39 | 76.40 | 5.71 | 96.88 | 100.00 | 85.25 | 66.67 | 66.67 | 88.33 | 8.90 | 1466.44s | 119 | 12 | 12 | 0 |
| 17 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 82.06 | 73.64 | 51.24 | 73.03 | 9.81 | 96.88 | 100.00 | 81.03 | 67.78 | 46.67 | 100.00 | 16.37 | 905.81s | 119 | 12 | 12 | 0 |
| 17 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 84.20 | 74.02 | 40.24 | 78.65 | 5.84 | 96.88 | 100.00 | 87.75 | 72.22 | 53.33 | 95.00 | 8.82 | 1616.56s | 119 | 12 | 12 | 1 |
| 18 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 83.11 | 74.19 | 51.11 | 73.03 | 9.87 | 96.88 | 100.00 | 79.52 | 62.23 | 60.00 | 100.00 | 16.26 | 917.21s | 119 | 12 | 12 | 0 |
| 18 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 85.60 | 74.89 | 39.35 | 79.78 | 5.82 | 96.88 | 100.00 | 84.52 | 65.55 | 73.33 | 93.33 | 8.52 | 1499.77s | 119 | 12 | 12 | 0 |
| 19 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 82.11 | 73.54 | 50.58 | 73.03 | 9.45 | 96.88 | 100.00 | 78.02 | 64.45 | 53.33 | 100.00 | 15.76 | 922.56s | 119 | 12 | 12 | 0 |
| 19 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 82.89 | 72.40 | 39.96 | 75.28 | 5.44 | 96.88 | 100.00 | 87.10 | 63.33 | 60.00 | 90.00 | 8.71 | 1560.46s | 121 | 12 | 12 | 0 |
| 20 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 82.03 | 73.29 | 52.40 | 70.79 | 10.08 | 96.88 | 100.00 | 79.40 | 58.89 | 57.00 | 100.00 | 17.36 | 1030.14s | 120 | 12 | 12 | 0 |
| 20 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 85.82 | 75.02 | 40.81 | 78.65 | 6.14 | 96.88 | 100.00 | 88.58 | 61.11 | 73.33 | 95.00 | 9.10 | 1742.54s | 119 | 12 | 12 | 0 |

Artifacts:

- [20x optimization directory](results/benchloop/gemma4-fastify-optimization-20x)
- [20x summary](results/benchloop/gemma4-fastify-optimization-20x/summary.md)
- [20x run summary CSV](results/benchloop/gemma4-fastify-optimization-20x/summary.csv)
- [20x aggregate CSV](results/benchloop/gemma4-fastify-optimization-20x/aggregate-summary.csv)
- [20x best policy](results/benchloop/gemma4-fastify-optimization-20x/best-policy.json)
- [20x run JSON copies](results/benchloop/gemma4-fastify-optimization-20x/)

## Gemma 4 Harness 17-Iteration Results

Run date: 2026-06-06. `llama.cpp` commit: `308f61c`.

Suites: `agent`, `coding`, `dataextract`, `instructfollow`, `reasonmath`, `speed`, and `toolcall`.

The optimizer completed 17 benchmark/analyze/apply/re-benchmark iterations for both target models, for 34 all-category BenchLoop runs. Iteration 6 was the best shared policy by average quality and average overall across E2B/E4B, so that policy is promoted for the one-shot optimized runner.

The original Python harness code has been removed. The historical Fastify rerun below used the promoted iteration-6 policy plus Fastify-specific token/coding safeguards; the active config is now the Extra5 promoted policy from iteration 5. Both paths preserve BenchLoop prompts and tool schemas.

| Model | Runtime | Quality | vs Historical Iter 6 | Overall | vs Historical Iter 6 | Speed | Reliability | Value | Gen tok/s | Runtime |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | Fastify Node-AST rerun | 80.42 | +4.44 | 76.19 | +3.63 | 72.71 | 69.66 | 30.67 | 54.75 | 463.81s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | Fastify Node-AST rerun | 82.35 | +5.46 | 76.51 | +3.92 | 60.58 | 76.40 | 17.19 | 27.32 | 640.57s |

| Model | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Speed | Tool Call |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 96.9 (7/8) | 100.0 (12/12) | 76.7 (6/15) | 62.2 (6/15) | 46.7 (7/15) | 72.7 (9/9) | 100.0 (15/15) |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 96.9 (7/8) | 100.0 (12/12) | 82.2 (10/15) | 66.7 (8/15) | 60.0 (9/15) | 60.6 (9/9) | 88.3 (13/15) |

Fastify rerun artifacts:

- [Fastify Node-AST rerun directory](results/benchloop/gemma4-fastify-promoted-rerun-v4-node-ast)
- [E2B Fastify Node-AST run JSON](results/benchloop/gemma4-fastify-promoted-rerun-v4-node-ast/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json)
- [E4B Fastify Node-AST run JSON](results/benchloop/gemma4-fastify-promoted-rerun-v4-node-ast/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json)

| Model | Promoted Iteration | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 6 | 75.97 | 72.56 | 71.01 | 66.29 | 24.51 | 48.66 | 378.65s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 6 | 76.89 | 72.59 | 61.63 | 71.91 | 16.02 | 28.98 | 619.76s |

| Model | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Speed | Tool Call |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 96.9 (7/8) | 62.5 (6/12) | 79.5 (7/15) | 66.7 (8/15) | 50.3 (7/15) | 71.0 (9/9) | 100.0 (15/15) |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 90.6 (6/8) | 54.2 (5/12) | 88.8 (12/15) | 67.8 (8/15) | 60.0 (9/15) | 61.6 (9/9) | 100.0 (15/15) |

All 17 iterations, including the original iteration-1 baseline:

| Iteration | Model | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 48.92 | 50.46 | 65.79 | 41.57 | 7.98 | 39.25 | 937.82s |
| 1 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 58.52 | 58.18 | 61.17 | 55.06 | 9.10 | 28.25 | 534.20s |
| 2 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 56.30 | 57.73 | 70.62 | 50.56 | 13.55 | 47.61 | 323.84s |
| 2 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 60.62 | 60.27 | 61.61 | 58.43 | 10.23 | 28.89 | 537.49s |
| 3 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 73.59 | 70.98 | 71.06 | 65.17 | 23.42 | 48.83 | 388.34s |
| 3 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 74.86 | 70.28 | 61.26 | 67.42 | 14.34 | 28.42 | 585.99s |
| 4 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 71.10 | 68.76 | 71.05 | 61.80 | 21.44 | 48.79 | 395.71s |
| 4 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 77.61 | 72.93 | 61.36 | 71.91 | 15.98 | 28.63 | 585.62s |
| 5 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 72.98 | 70.06 | 70.95 | 62.92 | 22.22 | 48.39 | 385.64s |
| 5 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 74.76 | 70.29 | 61.58 | 67.42 | 14.55 | 28.87 | 599.80s |
| 6 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 75.97 | 72.56 | 71.01 | 66.29 | 24.51 | 48.66 | 378.65s |
| 6 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 76.89 | 72.59 | 61.63 | 71.91 | 16.02 | 28.98 | 619.76s |
| 7 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 71.35 | 68.95 | 71.30 | 61.80 | 21.78 | 49.41 | 377.95s |
| 7 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 74.90 | 70.35 | 61.51 | 67.42 | 14.51 | 28.74 | 586.62s |
| 8 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 70.34 | 67.77 | 70.96 | 59.55 | 20.33 | 48.54 | 383.08s |
| 8 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 75.72 | 71.37 | 61.55 | 69.66 | 15.22 | 28.85 | 624.39s |
| 9 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 72.80 | 70.29 | 71.19 | 64.04 | 22.92 | 49.17 | 378.92s |
| 9 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 76.55 | 71.81 | 61.46 | 69.66 | 15.35 | 28.79 | 573.67s |
| 10 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 71.16 | 68.79 | 70.98 | 61.80 | 21.35 | 48.54 | 380.48s |
| 10 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 74.50 | 70.10 | 61.38 | 67.42 | 14.39 | 28.64 | 603.66s |
| 11 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 75.31 | 71.63 | 70.98 | 64.04 | 23.43 | 48.58 | 381.35s |
| 11 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 72.58 | 68.79 | 61.50 | 66.29 | 13.86 | 28.81 | 618.13s |
| 12 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 70.47 | 67.86 | 71.05 | 59.55 | 20.48 | 48.81 | 383.50s |
| 12 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 75.92 | 71.48 | 61.54 | 69.66 | 15.24 | 28.81 | 601.25s |
| 13 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 74.93 | 71.48 | 71.32 | 64.04 | 23.69 | 49.36 | 370.50s |
| 13 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 76.61 | 72.72 | 61.63 | 73.03 | 16.22 | 29.00 | 608.67s |
| 14 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 70.63 | 68.28 | 71.32 | 60.67 | 21.21 | 49.49 | 387.60s |
| 14 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 76.08 | 70.99 | 61.45 | 67.42 | 14.72 | 28.70 | 600.99s |
| 15 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 72.35 | 69.95 | 70.70 | 64.04 | 22.25 | 48.01 | 373.33s |
| 15 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 74.60 | 70.46 | 61.47 | 68.54 | 14.70 | 28.75 | 578.99s |
| 16 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 70.78 | 68.01 | 70.97 | 59.55 | 20.46 | 48.54 | 384.49s |
| 16 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 76.91 | 72.04 | 61.61 | 69.66 | 15.54 | 29.00 | 611.20s |
| 17 | `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 71.33 | 68.55 | 70.74 | 60.67 | 20.76 | 47.97 | 377.53s |
| 17 | `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 76.40 | 71.70 | 61.33 | 69.66 | 15.20 | 28.57 | 596.79s |

Artifacts:

- [Harness optimization summary](results/benchloop/gemma4-harness-optimized/summary.md)
- [Harness optimization summary CSV](results/benchloop/gemma4-harness-optimized/summary.csv): 34 rows
- [Harness run-level all columns CSV](results/benchloop/gemma4-harness-optimized/benchloop-runs-all-columns.csv): 34 rows
- [Harness suite-level all columns CSV](results/benchloop/gemma4-harness-optimized/benchloop-suites-all-columns.csv): 238 rows
- [Harness task-level all columns CSV](results/benchloop/gemma4-harness-optimized/benchloop-tasks-all-columns.csv): 3026 rows, includes `task_output` and `task_metadata_json`
- [Harness trial-level all columns CSV](results/benchloop/gemma4-harness-optimized/benchloop-trials-all-columns.csv): 918 rows
- [Harness column reference](results/benchloop/gemma4-harness-optimized/benchloop-all-columns.md)
- [Harness optimization summarizer](scripts/summarize_gemma4_harness_optimization.mjs)

## QAT Latest llama.cpp All-Category Results

Run date: 2026-06-06. `llama.cpp` commit: `308f61c`.

Sampler settings: `--temp 1 --top-p 0.95 --top-k 64`

UD-Q4 models used Metal with `-ngl all`.

| Model | Backend | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-12B-it-qat-UD-Q4_K_XL` | Metal | 86.2 | 77.8 | 50.6 | 80.9 | 11.0 | 15.70 | 1477.4s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | Metal | 83.3 | 77.5 | 64.4 | 75.3 | 21.2 | 33.75 | 757.3s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | Metal | 84.1 | 79.8 | 73.4 | 75.3 | 35.0 | 55.29 | 535.6s |

| Model | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Speed | Tool Call |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-12B-it-qat-UD-Q4_K_XL` | 96.9 (7/8) | 100.0 (12/12) | 81.7 (10/15) | 75.5 (10/15) | 80.0 (12/15) | 50.6 (9/9) | 83.3 (12/15) |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 96.9 (7/8) | 100.0 (12/12) | 81.4 (9/15) | 66.7 (8/15) | 80.0 (12/15) | 64.4 (9/9) | 75.0 (10/15) |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 96.9 (7/8) | 100.0 (12/12) | 70.1 (6/15) | 67.8 (8/15) | 80.0 (12/15) | 73.4 (9/9) | 90.0 (13/15) |

Artifacts:

- [QAT summary](results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/summary.md)
- [QAT CSV](results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/summary.csv)
- [QAT run-level all columns CSV](results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/benchloop-runs-all-columns.csv): 3 rows
- [QAT task-level all columns CSV](results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/benchloop-tasks-all-columns.csv): 267 rows
- [QAT trial-level all columns CSV](results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/benchloop-trials-all-columns.csv): 81 rows
- [QAT column reference](results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/benchloop-all-columns.md)
- [QAT run JSON copies](results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/run-json/)
- [QAT runner](scripts/run_qat_all_suites.sh)

## E2B/E4B QAT Sampler Comparison

Run date: 2026-06-06. `llama.cpp` commit: `308f61c`.

Models: `gemma-4-E2B-it-qat-UD-Q4_K_XL` and `gemma-4-E4B-it-qat-UD-Q4_K_XL`.

Suites: `agent`, `coding`, `dataextract`, `instructfollow`, `reasonmath`, `speed`, and `toolcall`.

Server settings: `-ngl all -c 4096 -np 1 --jinja --reasoning off -n 256`

Includes original baseline: `--temp 1 --top-p 0.95 --top-k 64`.

| Model | Best Sampler | Quality | Overall | Speed | Reliability | Gen tok/s | Runtime |
|---|---|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | `--temp 1 --top-p 0.95 --top-k 64` original | 84.1 | 79.8 | 73.4 | 75.3 | 55.29 | 535.6s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | `--temp 1 --top-p 0.95 --top-k 64` original | 83.3 | 77.5 | 64.4 | 75.3 | 33.75 | 757.3s |

All tested sampler profiles, including original:

| Model | Sampler | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | `--temp 1 --top-p 0.95 --top-k 64` original | 84.1 | 79.8 | 73.4 | 75.3 | 35.0 | 55.29 | 535.6s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | `--temp 0.80 --top-p 0.85 --top-k 40` | 84.1 | 77.3 | 61.1 | 75.3 | 17.8 | 28.13 | 1039.7s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | `--temp 0.85 --top-p 0.90 --top-k 47` | 84.1 | 77.2 | 60.8 | 75.3 | 17.5 | 27.66 | 1053.6s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | `--temp 0.95 --top-p 0.93 --top-k 58` | 84.1 | 77.2 | 60.8 | 75.3 | 17.5 | 27.59 | 1068.8s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | `--temp 0.75 --top-p 0.90 --top-k 40` | 84.1 | 77.2 | 60.7 | 75.3 | 17.5 | 27.57 | 1051.7s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | `--temp 0.80 --top-p 0.90 --top-k 43` | 84.1 | 77.2 | 60.7 | 75.3 | 17.4 | 27.50 | 1055.5s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | `--temp 0.90 --top-p 0.91 --top-k 52` | 84.1 | 77.1 | 59.9 | 75.3 | 16.9 | 26.70 | 1063.1s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | `--temp 1 --top-p 0.95 --top-k 64` original | 83.3 | 77.5 | 64.4 | 75.3 | 21.2 | 33.75 | 757.3s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | `--temp 0.95 --top-p 0.93 --top-k 58` | 83.3 | 75.0 | 51.6 | 75.3 | 10.5 | 16.69 | 1549.1s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | `--temp 0.85 --top-p 0.90 --top-k 47` | 83.3 | 74.9 | 51.4 | 75.3 | 10.3 | 16.46 | 1586.4s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | `--temp 0.90 --top-p 0.91 --top-k 52` | 83.3 | 74.9 | 51.2 | 75.3 | 10.2 | 16.28 | 1572.4s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | `--temp 0.80 --top-p 0.90 --top-k 43` | 83.3 | 74.9 | 51.1 | 75.3 | 10.1 | 16.15 | 1543.7s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | `--temp 0.75 --top-p 0.90 --top-k 40` | 83.3 | 74.8 | 51.0 | 75.3 | 10.1 | 16.13 | 1558.9s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | `--temp 0.80 --top-p 0.85 --top-k 40` | 83.3 | 73.6 | 44.8 | 75.3 | 7.4 | 11.84 | 1792.4s |

Artifacts:

- [Sampler sweep summary](results/benchloop/qat-e2b-e4b-sampler-sweep-all-suites/summary.md)
- [Sampler sweep CSV](results/benchloop/qat-e2b-e4b-sampler-sweep-all-suites/summary.csv)
- [Sampler sweep run-level all columns CSV](results/benchloop/qat-e2b-e4b-sampler-sweep-all-suites/benchloop-runs-all-columns.csv): 14 rows
- [Sampler sweep task-level all columns CSV](results/benchloop/qat-e2b-e4b-sampler-sweep-all-suites/benchloop-tasks-all-columns.csv): 1246 rows, includes `task_output` and metadata
- [Sampler sweep trial-level all columns CSV](results/benchloop/qat-e2b-e4b-sampler-sweep-all-suites/benchloop-trials-all-columns.csv): 378 rows
- [Sampler sweep column reference](results/benchloop/qat-e2b-e4b-sampler-sweep-all-suites/benchloop-all-columns.md)
- [Sampler sweep runner](scripts/run_qat_sampler_sweep.sh)

## All-Category Results

Run date: 2026-06-05. `llama.cpp` commit: `7c158fb`.

Sampler settings: `--temp 1 --top-p 0.95 --top-k 64`

| Model | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-Q5_K_M` | 78.2 | 73.2 | 67.9 | 66.3 | 21.2 | 40.87 | 837.4s |
| `gemma-4-E4B-it-IQ4_XS` | 81.7 | 75.8 | 63.0 | 73.0 | 18.7 | 31.42 | 789.7s |
| `gemma-4-12b-it-Q4_K_M` | 83.5 | 74.4 | 46.5 | 76.4 | 8.0 | 12.54 | 2121.7s |

| Model | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Speed | Tool Call |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-Q5_K_M` | 96.9 (7/8) | 93.8 (11/12) | 60.7 (3/15) | 64.5 (7/15) | 73.3 (11/15) | 67.9 (9/9) | 80.0 (11/15) |
| `gemma-4-E4B-it-IQ4_XS` | 96.9 (7/8) | 100.0 (12/12) | 82.5 (9/15) | 68.9 (8/15) | 73.3 (11/15) | 63.0 (9/9) | 68.3 (9/15) |
| `gemma-4-12b-it-Q4_K_M` | 96.9 (7/8) | 100.0 (12/12) | 82.2 (9/15) | 65.5 (8/15) | 73.3 (11/15) | 46.5 (9/9) | 83.3 (12/15) |

Artifacts:

- [All-category summary](results/benchloop/all-suites-temp1-top_p095-top_k64/summary.md)
- [All-category CSV](results/benchloop/all-suites-temp1-top_p095-top_k64/summary.csv)

## Baseline Speed-Only Results

| Model | Quality | Gen tok/s | Speed score | Prompts | Avg ms | Reliability | Overall | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-Q5_K_M` | 0.0 | 26.06 | 59.7 | 9/9 | 5714 | 100.0 | 36.9 | 191.5s |
| `gemma-4-E4B-it-IQ4_XS` | 0.0 | 19.67 | 54.5 | 9/9 | 7513 | 100.0 | 35.9 | 239.5s |
| `gemma-4-12b-it-Q4_K_M` | 0.0 | 8.14 | 38.7 | 9/9 | 18585 | 100.0 | 32.7 | 601.1s |

Artifacts:

- [Baseline summary](results/benchloop/summary.md)
- [Baseline CSV](results/benchloop/summary.csv)

## Sampler Speed-Only Rerun Results

Sampler settings: `--temp 1 --top-p 0.95 --top-k 64`

| Model | Quality | Gen tok/s | Delta | Speed score | Delta | Avg ms | Delta | Reliability | Overall | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-Q5_K_M` | 0.0 | 26.84 | +0.78 | 60.4 | +0.7 | 5626 | -88 | 100.0 | 37.1 | 189.0s |
| `gemma-4-E4B-it-IQ4_XS` | 0.0 | 19.56 | -0.11 | 54.4 | -0.1 | 7661 | +148 | 100.0 | 35.9 | 243.9s |
| `gemma-4-12b-it-Q4_K_M` | 0.0 | 8.01 | -0.13 | 38.4 | -0.3 | 19009 | +424 | 100.0 | 32.7 | 606.7s |

Artifacts:

- [Sampler summary](results/benchloop/sampler-temp1-top_p095-top_k64/summary.md)
- [Sampler CSV](results/benchloop/sampler-temp1-top_p095-top_k64/summary.csv)

## Full BenchLoop Exports

Flattened exports from the nine local BenchLoop `run.json` files:

- [Run-level all columns CSV](results/benchloop/benchloop-runs-all-columns.csv): 9 rows
- [Task-level all columns CSV](results/benchloop/benchloop-tasks-all-columns.csv): 321 rows
- [Trial-level all columns CSV](results/benchloop/benchloop-trials-all-columns.csv): 243 rows
- [Column reference](results/benchloop/benchloop-all-columns.md)

The task CSV includes model outputs, so quoted cells may contain embedded newlines.

The QAT latest-llama.cpp runs have their own expanded exports:

- [QAT run-level all columns CSV](results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/benchloop-runs-all-columns.csv): 3 rows
- [QAT task-level all columns CSV](results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/benchloop-tasks-all-columns.csv): 267 rows, includes `task_output` and `task_metadata_json`
- [QAT trial-level all columns CSV](results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/benchloop-trials-all-columns.csv): 81 rows
- [QAT column reference](results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/benchloop-all-columns.md)

## Run-Level Columns

- variant
- run_id
- run_json
- version
- timestamp
- model_id
- model_family
- model_parameter_count
- model_quantization
- machine_id
- machine_cpu
- machine_gpu
- machine_gpu_memory_gb
- machine_system_memory_gb
- machine_os
- machine_backend
- machine_is_remote
- machine_remote_host
- machine_endpoint
- machine_hardware_label
- provider
- harness
- harness_version
- total_runtime_sec
- overall_score
- quality_score
- speed_score
- reliability_score
- value_score
- speed_metrics_ttft_ms
- speed_metrics_prompt_eval_tok_per_sec
- speed_metrics_generation_tok_per_sec
- speed_metrics_total_latency_ms
- suite_agent_score
- suite_agent_task_count
- suite_agent_pass_count
- suite_agent_fail_count
- suite_agent_median_latency_ms
- suite_coding_score
- suite_coding_task_count
- suite_coding_pass_count
- suite_coding_fail_count
- suite_coding_median_latency_ms
- suite_dataextract_score
- suite_dataextract_task_count
- suite_dataextract_pass_count
- suite_dataextract_fail_count
- suite_dataextract_median_latency_ms
- suite_instructfollow_score
- suite_instructfollow_task_count
- suite_instructfollow_pass_count
- suite_instructfollow_fail_count
- suite_instructfollow_median_latency_ms
- suite_reasonmath_score
- suite_reasonmath_task_count
- suite_reasonmath_pass_count
- suite_reasonmath_fail_count
- suite_reasonmath_median_latency_ms
- suite_speed_score
- suite_speed_task_count
- suite_speed_pass_count
- suite_speed_fail_count
- suite_speed_median_latency_ms
- suite_toolcall_score
- suite_toolcall_task_count
- suite_toolcall_pass_count
- suite_toolcall_fail_count
- suite_toolcall_median_latency_ms

## Task-Level Columns

- variant
- run_id
- run_json
- model_id
- provider
- harness
- suite_name
- task_id
- task_suite
- task_passed
- task_score
- task_latency_ms
- task_tokens_generated
- task_tokens_prompt
- task_error
- task_output
- task_speed_metrics_ttft_ms
- task_speed_metrics_prompt_eval_tok_per_sec
- task_speed_metrics_generation_tok_per_sec
- task_speed_metrics_total_latency_ms
- task_eval_count
- task_eval_duration
- task_prompt_eval_count
- task_prompt_eval_duration
- task_load_duration
- task_selected_trial
- task_warmup_dropped
- task_selection_method

## Trial-Level Columns

- variant
- run_id
- run_json
- model_id
- provider
- harness
- suite_name
- task_id
- trial_index
- trial_warmup
- trial_passed
- trial_score
- trial_latency_ms
- trial_tokens_generated
- trial_tokens_prompt
- trial_error
- trial_speed_metrics_ttft_ms
- trial_speed_metrics_prompt_eval_tok_per_sec
- trial_speed_metrics_generation_tok_per_sec
- trial_speed_metrics_total_latency_ms
