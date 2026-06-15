# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-12b-quality-goal-20260613/loop-03-temp090/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-quality-loop03-temp090.run.json`
- Model: `gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-quality-loop03-temp090`
- Overall: 78.97595131086142
- Quality: 87.15333333333332
- Speed: 52.68
- Reliability: 82.02247191011236
- Failures/partials: 30

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 3 |
| `semantic_math` | 3 |
| `numeric_string` | 2 |
| `agent_or_tool_semantic` | 1 |
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
- `dataextract/de-05` score=93: 
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / location: mismatch / note: mismatch / location: mismatch / note: mismatch
- `dataextract/de-08` score=90: 
- `dataextract/de-09` score=90: 
- `dataextract/de-10` score=60: cuisine_type: expected string / neighborhood: expected null / street_address: expected null / visit_duration: mismatch

### `numeric_string`
- `dataextract/de-12` score=79: display_type: mismatch / product_name: mismatch / rating: expected number
- `dataextract/de-13` score=57: discounts.amount: expected number / discounts.amount: expected number / invoice_number: mismatch / line_items.amount: expected number / line_items.unit_price: expected number / lin

### `format_or_instruction`
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-06` score=0: switch expected 0.75, got 3/4; stay expected 0.25, got 1/4
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24

### `speed_measurement`
- `speed/speed-short-001` score=39.39: 
- `speed/speed-short-002` score=48.44: 
- `speed/speed-short-003` score=56.11: 
- `speed/speed-medium-001` score=55.53: 
- `speed/speed-medium-002` score=54.9: 
- `speed/speed-medium-003` score=56.76: 
- `speed/speed-long-001` score=54.93: 
- `speed/speed-long-002` score=53.87: 

### `tool_missing`
- `toolcall/tc-05` score=0: matched 0/1 required tool calls

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
