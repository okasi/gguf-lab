# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma-qwen-merged-policy-20260615/q4-smoke-e2b/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-nmax2-q4-smoke-raw.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-nmax2-q4-smoke-raw`
- Overall: 37.768
- Quality: 0
- Speed: 63.84
- Reliability: 100
- Failures/partials: 9

## Failure Classes

| Class | Count |
| --- | ---: |
| `speed_measurement` | 9 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.

## Examples

### `speed_measurement`
- `speed/speed-short-001` score=56.44: 
- `speed/speed-short-002` score=63.69: 
- `speed/speed-short-003` score=64.53: 
- `speed/speed-medium-001` score=65.78: 
- `speed/speed-medium-002` score=64.72: 
- `speed/speed-medium-003` score=65.73: 
- `speed/speed-long-001` score=65.64: 
- `speed/speed-long-002` score=64.12:
