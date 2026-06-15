# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-002-temp095-topp090-e2-gate/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c002-temp095-topp090-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c002-temp095-topp090-gemma4-harness-optimized`
- Overall: 78.43877808988765
- Quality: 82.635
- Speed: 75.06
- Reliability: 71.91011235955057
- Failures/partials: 37

## Failure Classes

| Class | Count |
| --- | ---: |
| `numeric_string` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_extraction` | 4 |
| `semantic_math` | 2 |
| `agent_or_tool_semantic` | 1 |
| `reasonmath_format` | 1 |
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Inspect declared schemas and only coerce values when the schema permits it.
- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect reason/math formatting and instruction-following without rewriting expected answers.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=36: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-06` score=60: blood_pressure_diastolic: expected number / blood_pressure_systolic: expected number / heart_rate: expected number / oxygen_saturation: expected number / referral: expected null / 
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / note: mismatch
- `dataextract/de-09` score=60: attendee_count: expected number / date: mismatch / requester_name: mismatch / room: mismatch
- `dataextract/de-12` score=57: battery_life_hours: expected number / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expected number
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `semantic_extraction`
- `dataextract/de-04` score=57: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-08` score=90: 
- `dataextract/de-10` score=90: 
- `dataextract/de-11` score=86: 

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5721.01; interest expected 718.96, got $721.01

### `speed_measurement`
- `speed/speed-short-001` score=67.45: 
- `speed/speed-short-002` score=74.08: 
- `speed/speed-short-003` score=73.57: 
- `speed/speed-medium-001` score=76.44: 
- `speed/speed-medium-002` score=76.65: 
- `speed/speed-medium-003` score=76.52: 
- `speed/speed-long-001` score=76.97: 
- `speed/speed-long-002` score=76.85: 

### `tool_missing`
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
