# Gemma 4 Harness Failure Analysis

- Source: `/Users/okasi/Developer/local-llm-experiments/macos-m1-pro/results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter183-no-missing-tool-retry-toolcall/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 65.8315
- Quality: 83.33
- Speed: 0
- Reliability: 80
- Failures/partials: 3

## Failure Classes

| Class | Count |
| --- | ---: |
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Enable tool-call synthesis for obvious tool-use prompts.
- Enable missing batch-call synthesis.
- Enable direct-answer guard to drop unnecessary tool calls.

## Examples

### `tool_missing`
- `toolcall/tc-05` score=0: matched 0/1 required tool calls

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
