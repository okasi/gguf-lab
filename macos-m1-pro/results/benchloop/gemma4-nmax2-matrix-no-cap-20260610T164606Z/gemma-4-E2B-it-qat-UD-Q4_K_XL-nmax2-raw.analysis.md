# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-nmax2-matrix-no-cap-20260610T164606Z/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-nmax2-raw.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-nmax2-raw`
- Overall: 79.9031413857678
- Quality: 84.12166666666667
- Speed: 74.08
- Reliability: 75.28089887640449
- Failures/partials: 35

## Failure Classes

| Class | Count |
| --- | ---: |
| `numeric_string` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `semantic_extraction` | 4 |
| `semantic_math` | 2 |
| `agent_or_tool_semantic` | 1 |
| `answer_line` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Enable numeric coercion for extraction JSON values.
- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Enable answer-line canonicalization.
- Enable missing batch-call synthesis.
- Enable direct-answer guard to drop unnecessary tool calls.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=36: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-06` score=53: blood_pressure_diastolic: expected number / blood_pressure_systolic: expected number / heart_rate: expected number / medication_dose: mismatch / oxygen_saturation: expected number 
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / note: mismatch
- `dataextract/de-09` score=60: attendee_count: expected number / date: mismatch / requester_name: mismatch / room: mismatch
- `dataextract/de-12` score=50: battery_life_hours: expected number / complaint: mismatch / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expecte
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `semantic_extraction`
- `dataextract/de-04` score=86: 
- `dataextract/de-08` score=90: 
- `dataextract/de-10` score=90: 
- `dataextract/de-11` score=86: 

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.09; interest expected 718.96, got 721.09

### `speed_measurement`
- `speed/speed-short-001` score=67.07: 
- `speed/speed-short-002` score=73: 
- `speed/speed-short-003` score=72.83: 
- `speed/speed-medium-001` score=75.41: 
- `speed/speed-medium-002` score=75.38: 
- `speed/speed-medium-003` score=75.33: 
- `speed/speed-long-001` score=77.48: 
- `speed/speed-long-002` score=77.43: 

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
