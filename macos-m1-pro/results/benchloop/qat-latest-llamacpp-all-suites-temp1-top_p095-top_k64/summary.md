# QAT Gemma 4 BenchLoop Results

- BenchLoop: `0.2.3`
- llama.cpp: `308f61c`
- Suites: `agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall`
- Sampler: `--temp 1 --top-p 0.95 --top-k 64`
- Server: `-c 4096 -np 1 --jinja --reasoning off -n 256`
- Note: UD-Q4 models used Metal with `-ngl all`.

## Summary

| Model | Backend | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-12B-it-qat-UD-Q4_K_XL` | Metal | 86.2 | 77.8 | 50.6 | 80.9 | 11.0 | 15.70 | 1477.4s |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | Metal | 83.3 | 77.5 | 64.4 | 75.3 | 21.2 | 33.75 | 757.3s |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | Metal | 84.1 | 79.8 | 73.4 | 75.3 | 35.0 | 55.29 | 535.6s |

## Suite Scores

| Model | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Speed | Tool Call |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gemma-4-12B-it-qat-UD-Q4_K_XL` | 96.9 (7/8) | 100.0 (12/12) | 81.7 (10/15) | 75.5 (10/15) | 80.0 (12/15) | 50.6 (9/9) | 83.3 (12/15) |
| `gemma-4-E4B-it-qat-UD-Q4_K_XL` | 96.9 (7/8) | 100.0 (12/12) | 81.4 (9/15) | 66.7 (8/15) | 80.0 (12/15) | 64.4 (9/9) | 75.0 (10/15) |
| `gemma-4-E2B-it-qat-UD-Q4_K_XL` | 96.9 (7/8) | 100.0 (12/12) | 70.1 (6/15) | 67.8 (8/15) | 80.0 (12/15) | 73.4 (9/9) | 90.0 (13/15) |

## Run JSON

- [gemma-4-12B-it-qat-UD-Q4_K_XL](run-json/gemma-4-12B-it-qat-UD-Q4_K_XL.run.json)
- [gemma-4-E4B-it-qat-UD-Q4_K_XL](run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL.run.json)
- [gemma-4-E2B-it-qat-UD-Q4_K_XL](run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL.run.json)

## Expanded Exports

- [Run-level all columns CSV](benchloop-runs-all-columns.csv)
- [Task-level all columns CSV](benchloop-tasks-all-columns.csv)
- [Trial-level all columns CSV](benchloop-trials-all-columns.csv)
- [Column reference](benchloop-all-columns.md)
