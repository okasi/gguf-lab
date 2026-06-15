# Gemma 4 Harness Failure Analysis

- Source: `/Users/okasi/Developer/local-llm-experiments/macos-m1-pro/results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter166-schema-tool-arg-normalization/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 68.20721739130435
- Quality: 88.44
- Speed: 0
- Reliability: 78.26086956521739
- Failures/partials: 5

## Failure Classes

| Class | Count |
| --- | ---: |
| `tool_partial_batch` | 2 |
| `agent_or_tool_semantic` | 1 |
| `tool_missing` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Enable missing batch-call synthesis.
- Enable tool-call synthesis for obvious tool-use prompts.
- Enable direct-answer guard to drop unnecessary tool calls.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `tool_missing`
- `toolcall/tc-05` score=0: matched 0/1 required tool calls

### `tool_partial_batch`
- `toolcall/tc-09` score=50: matched 1/2 required tool calls
- `toolcall/tc-15` score=50: matched 1/2 required tool calls

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content
