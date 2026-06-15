# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-e2b-e4b-current-policy-rerun-20260614/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-current-policy-clean-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-current-policy-clean-gemma4-harness-optimized`
- Overall: 75.39811142322098
- Quality: 81.16833333333334
- Speed: 63.89
- Reliability: 71.91011235955057
- Failures/partials: 39

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `semantic_extraction` | 6 |
| `numeric_string` | 5 |
| `tool_missing` | 3 |
| `semantic_math` | 2 |
| `agent_or_tool_semantic` | 1 |
| `coding_semantic` | 1 |
| `reasonmath_format` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect declared schemas and only coerce values when the schema permits it.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Inspect reason/math formatting and instruction-following without rewriting expected answers.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `coding_semantic`
- `coding/coding-json-validator` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-btc4t2f9/task.py", line 78, in <module>
    assert any("email" in erro

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-06` score=53: blood_pressure_diastolic: expected number / blood_pressure_systolic: expected number / heart_rate: expected number / medication_duration: mismatch / oxygen_saturation: expected num
- `dataextract/de-12` score=57: battery_life_hours: expected number / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expected number
- `dataextract/de-13` score=46: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.qty: expected number / line_items.unit_price: expected numbe
- `dataextract/de-14` score=41: anc_type: mismatch / battery_life_earbuds_hours: expected number / battery_life_with_case_hours: expected number / case_weight_grams: expected number / array values did not match e

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=86: 
- `dataextract/de-05` score=93: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=90: 
- `dataextract/de-10` score=90: 

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.09; interest expected 718.96, got 721.09

### `speed_measurement`
- `speed/speed-short-001` score=57.04: 
- `speed/speed-short-002` score=63.83: 
- `speed/speed-short-003` score=62.23: 
- `speed/speed-medium-001` score=64.24: 
- `speed/speed-medium-002` score=65.7: 
- `speed/speed-medium-003` score=62.47: 
- `speed/speed-long-001` score=66.48: 
- `speed/speed-long-002` score=66.46: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools
- `toolcall/tc-07` score=25: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
