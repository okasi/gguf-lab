# Gemma 4 Fastify Extra 3 Optimization

Best shared iteration: 1 (promoted-extra5-control)

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
