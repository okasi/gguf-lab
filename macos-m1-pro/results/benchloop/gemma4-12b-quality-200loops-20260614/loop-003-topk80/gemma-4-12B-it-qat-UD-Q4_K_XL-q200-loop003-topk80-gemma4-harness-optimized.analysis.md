# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-12b-quality-200loops-20260614/loop-003-topk80/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL-q200-loop003-topk80-gemma4-harness-optimized.run.json`
- Model: `gemma-4-12B-it-qat-UD-Q4_K_XL-q200-loop003-topk80-gemma4-harness-optimized`
- Overall: 77.34921910112361
- Quality: 86.99000000000001
- Speed: 46.4
- Reliability: 80.89887640449437
- Failures/partials: 31

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 9 |
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
- Inspect declared schemas and only coerce values when the schema permits it.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=93: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=90: 
- `dataextract/de-10` score=60: cuisine_type: expected string / neighborhood: expected null / street_address: expected null / visit_duration: mismatch
- `dataextract/de-12` score=93: 

### `numeric_string`
- `dataextract/de-13` score=57: discounts.amount: expected number / discounts.amount: expected number / invoice_number: mismatch / line_items.amount: expected number / line_items.unit_price: expected number / lin

### `format_or_instruction`
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-14` score=50: all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-06` score=0: switch expected 0.75, got 3/4; stay expected 0.25, got 1/4
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24

### `speed_measurement`
- `speed/speed-short-001` score=34.71: 
- `speed/speed-short-002` score=44.39: 
- `speed/speed-short-003` score=49.4: 
- `speed/speed-medium-001` score=49.61: 
- `speed/speed-medium-002` score=50.58: 
- `speed/speed-medium-003` score=49.34: 
- `speed/speed-long-001` score=52.59: 
- `speed/speed-long-002` score=41.63: 

### `tool_missing`
- `toolcall/tc-05` score=0: matched 0/1 required tool calls

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
