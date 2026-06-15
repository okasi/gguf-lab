# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-009-no-code-extraction-e2-gate/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c009-no-code-extract-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c009-no-code-extract-gemma4-harness-optimized`
- Overall: 76.28596254681648
- Quality: 82.41333333333333
- Speed: 66.31
- Reliability: 70.78651685393258
- Failures/partials: 39

## Failure Classes

| Class | Count |
| --- | ---: |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `numeric_string` | 8 |
| `semantic_extraction` | 6 |
| `semantic_math` | 4 |
| `agent_or_tool_semantic` | 1 |
| `coding_semantic` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect declared schemas and only coerce values when the schema permits it.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `coding_semantic`
- `coding/coding-rate-limiter` score=25: Timed out after 10s

### `semantic_extraction`
- `dataextract/de-01` score=90: 
- `dataextract/de-04` score=57: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-06` score=87: 
- `dataextract/de-08` score=90: 
- `dataextract/de-10` score=80: cuisine_type: mismatch / neighborhood: expected null
- `dataextract/de-11` score=86: 

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=36: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / note: mismatch
- `dataextract/de-09` score=80: attendee_count: expected number / date: mismatch
- `dataextract/de-12` score=50: battery_life_hours: expected number / complaint: mismatch / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expecte
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu
- `dataextract/de-14` score=53: battery_life_earbuds_hours: expected number / battery_life_with_case_hours: expected number / case_weight_grams: expected number / array values did not match expected set / earbud_

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=66.7: one_sentence_each
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-06` score=0: switch expected 0.75, got 1/2; stay expected 0.25, got 1/2
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.08; interest expected 718.96, got 721.08

### `speed_measurement`
- `speed/speed-short-001` score=60.19: 
- `speed/speed-short-002` score=65.5: 
- `speed/speed-short-003` score=65.43: 
- `speed/speed-medium-001` score=66.11: 
- `speed/speed-medium-002` score=66.74: 
- `speed/speed-medium-003` score=68.1: 
- `speed/speed-long-001` score=68.69: 
- `speed/speed-long-002` score=68.08: 

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
