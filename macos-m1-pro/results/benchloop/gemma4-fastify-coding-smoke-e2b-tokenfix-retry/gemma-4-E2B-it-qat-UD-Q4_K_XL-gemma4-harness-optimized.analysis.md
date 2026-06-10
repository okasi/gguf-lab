# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-coding-smoke-e2b-tokenfix-retry/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 0.0
- Quality: 0.0
- Speed: 0.0
- Reliability: 0.0
- Failures/partials: 12

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_cleanup` | 12 |

## Recommendations

- Enable fence/reasoning stripping, Python extraction, and content normalization.

## Examples

### `format_cleanup`
- `coding/coding-csv-parser` score=0.0: No code found in model response
- `coding/coding-fibonacci-memo` score=0.0: No code found in model response
- `coding/coding-flatten-nested` score=0.0: No code found in model response
- `coding/coding-bug-fix-off-by-one` score=0.0: No code found in model response
- `coding/coding-json-validator` score=0.0: No code found in model response
- `coding/coding-retry-decorator` score=0.0: No code found in model response
- `coding/coding-deduplicate-preserve-order` score=0.0: No code found in model response
- `coding/coding-add-error-handling` score=0.0: No code found in model response
