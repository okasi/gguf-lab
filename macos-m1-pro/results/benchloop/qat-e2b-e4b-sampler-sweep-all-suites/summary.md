# QAT E2B/E4B Sampler Comparison

- BenchLoop: `0.2.3`
- llama.cpp: `308f61c`
- Suites: `agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall`
- Server: `-ngl all -c 4096 -np 1 --jinja --reasoning off -n 256`
- Includes original baseline: `--temp 1 --top-p 0.95 --top-k 64`

## Best Overall

| Model | Best Sampler | Quality | Overall | Speed | Reliability | Gen tok/s | Runtime |
|---|---|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=1.00, top_p=0.95, top_k=64 (original) | 84.1 | 79.8 | 73.4 | 75.3 | 55.29 | 535.6s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=1.00, top_p=0.95, top_k=64 (original) | 83.3 | 77.5 | 64.4 | 75.3 | 33.75 | 757.3s |

## All Profiles

| Model | Sampler | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=1.00, top_p=0.95, top_k=64 (original) | 84.1 | 79.8 | 73.4 | 75.3 | 35.0 | 55.29 | 535.6s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.80, top_p=0.85, top_k=40 | 84.1 | 77.3 | 61.1 | 75.3 | 17.8 | 28.13 | 1039.7s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.85, top_p=0.90, top_k=47 | 84.1 | 77.2 | 60.8 | 75.3 | 17.5 | 27.66 | 1053.6s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.95, top_p=0.93, top_k=58 | 84.1 | 77.2 | 60.8 | 75.3 | 17.5 | 27.59 | 1068.8s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.75, top_p=0.90, top_k=40 | 84.1 | 77.2 | 60.7 | 75.3 | 17.5 | 27.57 | 1051.7s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.80, top_p=0.90, top_k=43 | 84.1 | 77.2 | 60.7 | 75.3 | 17.4 | 27.50 | 1055.5s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.90, top_p=0.91, top_k=52 | 84.1 | 77.1 | 59.9 | 75.3 | 16.9 | 26.70 | 1063.1s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=1.00, top_p=0.95, top_k=64 (original) | 83.3 | 77.5 | 64.4 | 75.3 | 21.2 | 33.75 | 757.3s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.95, top_p=0.93, top_k=58 | 83.3 | 75.0 | 51.6 | 75.3 | 10.5 | 16.69 | 1549.1s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.85, top_p=0.90, top_k=47 | 83.3 | 74.9 | 51.4 | 75.3 | 10.3 | 16.46 | 1586.4s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.90, top_p=0.91, top_k=52 | 83.3 | 74.9 | 51.2 | 75.3 | 10.2 | 16.28 | 1572.4s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.80, top_p=0.90, top_k=43 | 83.3 | 74.9 | 51.1 | 75.3 | 10.1 | 16.15 | 1543.7s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.75, top_p=0.90, top_k=40 | 83.3 | 74.8 | 51.0 | 75.3 | 10.1 | 16.13 | 1558.9s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.80, top_p=0.85, top_k=40 | 83.3 | 73.6 | 44.8 | 75.3 | 7.4 | 11.84 | 1792.4s |

## Suite Scores

| Model | Sampler | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Speed | Tool Call |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=1.00, top_p=0.95, top_k=64 (original) | 96.9 (7/8) | 100.0 (12/12) | 70.1 (6/15) | 67.8 (8/15) | 80.0 (12/15) | 73.4 (9/9) | 90.0 (13/15) |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.80, top_p=0.85, top_k=40 | 96.9 (7/8) | 100.0 (12/12) | 70.1 (6/15) | 67.8 (8/15) | 80.0 (12/15) | 61.1 (9/9) | 90.0 (13/15) |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.85, top_p=0.90, top_k=47 | 96.9 (7/8) | 100.0 (12/12) | 70.1 (6/15) | 67.8 (8/15) | 80.0 (12/15) | 60.8 (9/9) | 90.0 (13/15) |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.95, top_p=0.93, top_k=58 | 96.9 (7/8) | 100.0 (12/12) | 70.1 (6/15) | 67.8 (8/15) | 80.0 (12/15) | 60.8 (9/9) | 90.0 (13/15) |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.75, top_p=0.90, top_k=40 | 96.9 (7/8) | 100.0 (12/12) | 70.1 (6/15) | 67.8 (8/15) | 80.0 (12/15) | 60.7 (9/9) | 90.0 (13/15) |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.80, top_p=0.90, top_k=43 | 96.9 (7/8) | 100.0 (12/12) | 70.1 (6/15) | 67.8 (8/15) | 80.0 (12/15) | 60.7 (9/9) | 90.0 (13/15) |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | temp=0.90, top_p=0.91, top_k=52 | 96.9 (7/8) | 100.0 (12/12) | 70.1 (6/15) | 67.8 (8/15) | 80.0 (12/15) | 59.9 (9/9) | 90.0 (13/15) |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=1.00, top_p=0.95, top_k=64 (original) | 96.9 (7/8) | 100.0 (12/12) | 81.4 (9/15) | 66.7 (8/15) | 80.0 (12/15) | 64.4 (9/9) | 75.0 (10/15) |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.95, top_p=0.93, top_k=58 | 96.9 (7/8) | 100.0 (12/12) | 81.4 (9/15) | 66.7 (8/15) | 80.0 (12/15) | 51.6 (9/9) | 75.0 (10/15) |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.85, top_p=0.90, top_k=47 | 96.9 (7/8) | 100.0 (12/12) | 81.4 (9/15) | 66.7 (8/15) | 80.0 (12/15) | 51.4 (9/9) | 75.0 (10/15) |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.90, top_p=0.91, top_k=52 | 96.9 (7/8) | 100.0 (12/12) | 81.4 (9/15) | 66.7 (8/15) | 80.0 (12/15) | 51.2 (9/9) | 75.0 (10/15) |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.80, top_p=0.90, top_k=43 | 96.9 (7/8) | 100.0 (12/12) | 81.4 (9/15) | 66.7 (8/15) | 80.0 (12/15) | 51.1 (9/9) | 75.0 (10/15) |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.75, top_p=0.90, top_k=40 | 96.9 (7/8) | 100.0 (12/12) | 81.4 (9/15) | 66.7 (8/15) | 80.0 (12/15) | 51.0 (9/9) | 75.0 (10/15) |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | temp=0.80, top_p=0.85, top_k=40 | 96.9 (7/8) | 100.0 (12/12) | 81.4 (9/15) | 66.7 (8/15) | 80.0 (12/15) | 44.8 (9/9) | 75.0 (10/15) |

## Expanded Exports

- [Summary CSV](summary.csv)
- [Run-level all columns CSV](benchloop-runs-all-columns.csv)
- [Task-level all columns CSV](benchloop-tasks-all-columns.csv)
- [Trial-level all columns CSV](benchloop-trials-all-columns.csv)
- [Column reference](benchloop-all-columns.md)
