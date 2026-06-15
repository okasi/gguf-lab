# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-002-temp095-topp090-e4-gate/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-allsize-c002-temp095-topp090-e4check-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-allsize-c002-temp095-topp090-e4check-gemma4-harness-optimized`
- Overall: 73.29714700374532
- Quality: 79.67166666666667
- Speed: 60.31
- Reliability: 69.66292134831461
- Failures/partials: 39

## Failure Classes

| Class | Count |
| --- | ---: |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `numeric_string` | 6 |
| `semantic_extraction` | 5 |
| `semantic_math` | 3 |
| `tool_missing` | 2 |
| `agent_or_tool_semantic` | 1 |
| `coding_semantic` | 1 |
| `format_cleanup` | 1 |
| `reasonmath_format` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect declared schemas and only coerce values when the schema permits it.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Enable fence/reasoning stripping and content normalization.
- Inspect reason/math formatting and instruction-following without rewriting expected answers.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `format_cleanup`
- `coding/coding-csv-parser` score=0: SyntaxError: unterminated string literal (detected at line 78) (line 78)

### `coding_semantic`
- `coding/coding-rate-limiter` score=25: Timed out after 10s

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-05` score=50: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-06` score=60: blood_pressure_diastolic: expected number / blood_pressure_systolic: expected number / heart_rate: expected number / oxygen_saturation: expected number / referral: expected null / 
- `dataextract/de-12` score=57: battery_life_hours: expected number / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expected number
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu
- `dataextract/de-14` score=53: battery_life_earbuds_hours: expected number / battery_life_with_case_hours: expected number / case_weight_grams: expected number / array values did not match expected set / earbud_

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=86: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: mismatch
- `dataextract/de-11` score=86: 

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
- `reasonmath/rm-12` score=0: person expected son, got son or daughter
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.18; interest expected 718.96, got 721.18

### `speed_measurement`
- `speed/speed-short-001` score=53.62: 
- `speed/speed-short-002` score=59.26: 
- `speed/speed-short-003` score=62.16: 
- `speed/speed-medium-001` score=64.14: 
- `speed/speed-medium-002` score=63.51: 
- `speed/speed-medium-003` score=60.23: 
- `speed/speed-long-001` score=59.84: 
- `speed/speed-long-002` score=60.02: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
