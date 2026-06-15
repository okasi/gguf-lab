# Gemma 4 Harness Failure Analysis

- Source: `/Users/okasi/Developer/local-llm-experiments/macos-m1-pro/results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter186-restore-safe-baseline-full/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 76.71880243445693
- Quality: 86.49833333333333
- Speed: 44.6
- Reliability: 80.89887640449437
- Failures/partials: 32

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 4 |
| `semantic_math` | 4 |
| `agent_or_tool_semantic` | 1 |
| `numeric_string` | 1 |
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Enable numeric coercion for extraction JSON values.
- Enable tool-call synthesis for obvious tool-use prompts.
- Enable missing batch-call synthesis.
- Enable direct-answer guard to drop unnecessary tool calls.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=93: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-08` score=90: 
- `dataextract/de-09` score=90: 
- `dataextract/de-10` score=60: cuisine_type: expected string / neighborhood: expected null / street_address: expected null / visit_duration: mismatch

### `numeric_string`
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `format_or_instruction`
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=50: all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0: Empty response
- `reasonmath/rm-06` score=0: switch expected 0.75, got 3/4; stay expected 0.25, got 1/4
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24

### `speed_measurement`
- `speed/speed-short-001` score=30.1: 
- `speed/speed-short-002` score=41.24: 
- `speed/speed-short-003` score=46.5: 
- `speed/speed-medium-001` score=45.78: 
- `speed/speed-medium-002` score=46.46: 
- `speed/speed-medium-003` score=46.44: 
- `speed/speed-long-001` score=45.17: 
- `speed/speed-long-002` score=45.1: 

### `tool_missing`
- `toolcall/tc-05` score=0: matched 0/1 required tool calls

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
