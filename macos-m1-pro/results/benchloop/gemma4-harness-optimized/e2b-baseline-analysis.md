# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL`
- Overall: 79.77114138576779
- Quality: 84.12166666666667
- Speed: 73.42
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
| `tool_partial_batch` | 2 |
| `answer_line` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Enable numeric coercion for extraction JSON values.
- Enable missing batch-call synthesis.
- Enable answer-line canonicalization.
- Enable direct-answer guard to drop unnecessary tool calls.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 
- `toolcall/tc-15` score=50.0: matched 1/2 required tool calls

### `numeric_string`
- `dataextract/de-02` score=62.0: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67.0: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=36.0: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-06` score=53.0: blood_pressure_diastolic: expected number / blood_pressure_systolic: expected number / heart_rate: expected number / medication_dose: mismatch / oxygen_saturation: expected number 
- `dataextract/de-07` score=71.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / note: mismatch
- `dataextract/de-09` score=60.0: attendee_count: expected number / date: mismatch / requester_name: mismatch / room: mismatch
- `dataextract/de-12` score=50.0: battery_life_hours: expected number / complaint: mismatch / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expecte
- `dataextract/de-13` score=59.0: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `semantic_extraction`
- `dataextract/de-04` score=86.0: 
- `dataextract/de-08` score=90.0: 
- `dataextract/de-10` score=90.0: 
- `dataextract/de-11` score=86.0: 

### `format_or_instruction`
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50.0: city_constraints

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.09; interest expected 718.96, got 721.09

### `speed_measurement`
- `speed/speed-short-001` score=69.03: 
- `speed/speed-short-002` score=72.88: 
- `speed/speed-short-003` score=75.03: 
- `speed/speed-medium-001` score=73.63: 
- `speed/speed-medium-002` score=74.91: 
- `speed/speed-medium-003` score=73.36: 
- `speed/speed-long-001` score=74.17: 
- `speed/speed-long-002` score=73.94: 

### `tool_unneeded`
- `toolcall/tc-11` score=0.0: unexpected tool call; missing expected direct answer content
