# Gemma 4 Fastify Forensic 3 Optimization

Best shared iteration: 3 (forensic-tool-reason)

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
