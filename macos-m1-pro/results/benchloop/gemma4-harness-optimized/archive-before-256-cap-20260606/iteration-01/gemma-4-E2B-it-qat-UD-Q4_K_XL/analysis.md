# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-01/gemma-4-E2B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-harness-iter01`
- Overall: 73.40283146067415
- Quality: 81.56
- Speed: 57.05
- Reliability: 68.53932584269663
- Failures/partials: 40

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_or_instruction` | 10 |
| `numeric_string` | 9 |
| `speed_measurement` | 9 |
| `semantic_extraction` | 4 |
| `tool_partial_batch` | 3 |
| `semantic_math` | 2 |
| `answer_line` | 1 |
| `tool_missing` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Enable numeric coercion for extraction JSON values.
- Enable missing batch-call synthesis.
- Enable answer-line canonicalization.
- Enable tool-call synthesis for obvious tool-use prompts.
- Enable direct-answer guard to drop unnecessary tool calls.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 
- `agent/agent-05-refuse-unknown-tool` score=75.0: 
- `toolcall/tc-15` score=50.0: matched 1/2 required tool calls

### `numeric_string`
- `dataextract/de-02` score=62.0: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67.0: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=36.0: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-06` score=80.0: medication_dose: mismatch / oxygen_saturation: expected number / referral: expected null
- `dataextract/de-07` score=71.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / note: mismatch
- `dataextract/de-09` score=80.0: attendee_count: expected number / date: mismatch
- `dataextract/de-12` score=50.0: battery_life_hours: expected number / complaint: mismatch / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expecte
- `dataextract/de-13` score=59.0: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `semantic_extraction`
- `dataextract/de-04` score=71.0: note: mismatch / room: mismatch
- `dataextract/de-08` score=90.0: 
- `dataextract/de-10` score=90.0: 
- `dataextract/de-11` score=86.0: 

### `format_or_instruction`
- `instructfollow/if-02` score=50.0: word_counts_3_4_3
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-12` score=0.0: exact_impossible_line

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.01; interest expected 718.96, got 721.01

### `speed_measurement`
- `speed/speed-short-001` score=52.9: 
- `speed/speed-short-002` score=57.74: 
- `speed/speed-short-003` score=57.86: 
- `speed/speed-medium-001` score=52.42: 
- `speed/speed-medium-002` score=52.33: 
- `speed/speed-medium-003` score=60.39: 
- `speed/speed-long-001` score=59.44: 
- `speed/speed-long-002` score=60.29: 

### `tool_missing`
- `toolcall/tc-05` score=25.0: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0.0: unexpected tool call; missing expected direct answer content
