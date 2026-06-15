# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma-qwen-merged-policy-20260614/e2b-merged-v2-gemma-conservative/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-merged-gemmaqwen-v2-gemma-conservative-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-merged-gemmaqwen-v2-gemma-conservative-gemma4-harness-optimized`
- Overall: 74.10578370786517
- Quality: 79.44500000000001
- Speed: 69.19
- Reliability: 66.29213483146067
- Failures/partials: 42

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_or_instruction` | 9 |
| `numeric_string` | 9 |
| `speed_measurement` | 9 |
| `semantic_extraction` | 5 |
| `semantic_math` | 5 |
| `tool_missing` | 2 |
| `agent_or_tool_semantic` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Inspect declared schemas and only coerce values when the schema permits it.
- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-01` score=90: 
- `dataextract/de-04` score=57: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-09` score=70: date: mismatch / requester_name: mismatch / room: mismatch
- `dataextract/de-10` score=90: 
- `dataextract/de-11` score=86: 

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=43: battery_life_hours: expected number / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_price_paid: expected number /
- `dataextract/de-06` score=53: blood_pressure_diastolic: expected number / blood_pressure_systolic: expected number / heart_rate: expected number / medication_dose: mismatch / oxygen_saturation: expected number 
- `dataextract/de-07` score=67: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / location: mismatch / note: mismatch
- `dataextract/de-08` score=80: catering_company: expected string / catering_price_per_person: expected number
- `dataextract/de-12` score=57: battery_life_hours: expected number / complaint: mismatch / price: expected number / ram_gb: expected number / rating: expected number / weight_kg: expected number
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-07` score=50: tagged_translations
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-03` score=55: saved_money expected yes, got no
- `reasonmath/rm-06` score=0: switch expected 0.75, got 3/4; stay expected 0.25, got 1/4
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-12` score=0: person expected son, got the speaker
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.00; interest expected 718.96, got 721.00

### `speed_measurement`
- `speed/speed-short-001` score=63.72: 
- `speed/speed-short-002` score=70.39: 
- `speed/speed-short-003` score=69.43: 
- `speed/speed-medium-001` score=69.77: 
- `speed/speed-medium-002` score=68.65: 
- `speed/speed-medium-003` score=69.5: 
- `speed/speed-long-001` score=70.79: 
- `speed/speed-long-002` score=69.4: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
- `toolcall/tc-07` score=25: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
