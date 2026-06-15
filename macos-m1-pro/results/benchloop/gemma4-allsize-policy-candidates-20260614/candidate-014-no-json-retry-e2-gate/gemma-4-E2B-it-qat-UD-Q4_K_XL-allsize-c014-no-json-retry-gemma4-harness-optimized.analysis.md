# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-014-no-json-retry-e2-gate/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c014-no-json-retry-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c014-no-json-retry-gemma4-harness-optimized`
- Overall: 73.00805149812734
- Quality: 77.38166666666667
- Speed: 70.78
- Reliability: 65.1685393258427
- Failures/partials: 43

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `numeric_string` | 8 |
| `semantic_extraction` | 4 |
| `semantic_math` | 3 |
| `tool_missing` | 3 |
| `agent_or_tool_semantic` | 2 |
| `coding_semantic` | 1 |
| `invalid_json` | 1 |
| `reasonmath_format` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect declared schemas and only coerce values when the schema permits it.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Enable JSON extraction/repair and escaped JSON parsing.
- Inspect reason/math formatting and instruction-following without rewriting expected answers.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `agent/agent-05-refuse-unknown-tool` score=75: 

### `coding_semantic`
- `coding/coding-rate-limiter` score=25: Timed out after 10s

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=36: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-06` score=67: blood_pressure_diastolic: expected number / blood_pressure_systolic: expected number / medication_dose: mismatch / oxygen_saturation: expected number / referral: expected null
- `dataextract/de-07` score=67: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / location: mismatch / note: mismatch
- `dataextract/de-09` score=40: attendee_count: expected number / date: mismatch / needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / requester_name: misma
- `dataextract/de-12` score=57: battery_life_hours: expected number / complaint: mismatch / price: expected number / ram_gb: expected number / rating: expected number / weight_kg: expected number
- `dataextract/de-14` score=47: anc_type: mismatch / battery_life_earbuds_hours: expected number / battery_life_with_case_hours: expected number / case_weight_grams: expected number / array values did not match e

### `semantic_extraction`
- `dataextract/de-04` score=71: meeting_name: mismatch / room: mismatch
- `dataextract/de-08` score=90: 
- `dataextract/de-10` score=90: 
- `dataextract/de-11` score=86: 

### `invalid_json`
- `dataextract/de-13` score=0: Invalid JSON: Expecting value: line 1 column 1 (char 0)

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-09` score=66.7: line_shape_forbidden_words_under_60_words
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.08; interest expected 718.96, got 721.08

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=55.88: 
- `speed/speed-short-002` score=59.26: 
- `speed/speed-short-003` score=65.72: 
- `speed/speed-medium-001` score=68.45: 
- `speed/speed-medium-002` score=78.21: 
- `speed/speed-medium-003` score=78.21: 
- `speed/speed-long-001` score=78.2: 
- `speed/speed-long-002` score=79.76: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools
- `toolcall/tc-07` score=25: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
