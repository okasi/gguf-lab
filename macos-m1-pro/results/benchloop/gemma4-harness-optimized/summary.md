# Gemma 4 Harness Optimization Runs

- BenchLoop: `0.2.3`
- Backend: `llama.cpp` through the optimized OpenAI-compatible proxy
- Suites: `agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall`
- Sampler: `temp=1.00, top_p=0.95, top_k=64`
- Prompt/tool policy: BenchLoop messages and tool schemas are passed through unchanged.

## Best Quality

| Model | Iteration | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 6 | 75.97 | 72.56 | 71.01 | 66.29 | 24.51 | 48.66 | 378.65s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 4 | 77.61 | 72.93 | 61.36 | 71.91 | 15.98 | 28.63 | 585.62s |

## All Iterations

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

## Expanded Exports

- [Summary CSV](summary.csv)
- [Run-level all columns CSV](benchloop-runs-all-columns.csv)
- [Suite-level all columns CSV](benchloop-suites-all-columns.csv)
- [Task-level all columns CSV](benchloop-tasks-all-columns.csv)
- [Trial-level all columns CSV](benchloop-trials-all-columns.csv)
- [Column reference](benchloop-all-columns.md)
