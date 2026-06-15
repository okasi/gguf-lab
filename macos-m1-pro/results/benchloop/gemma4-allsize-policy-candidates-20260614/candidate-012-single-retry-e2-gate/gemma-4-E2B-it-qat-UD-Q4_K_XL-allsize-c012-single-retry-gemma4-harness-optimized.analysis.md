# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-012-single-retry-e2-gate/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c012-single-retry-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c012-single-retry-gemma4-harness-optimized`
- Overall: 77.72664700374533
- Quality: 81.56166666666667
- Speed: 77.26
- Reliability: 69.66292134831461
- Failures/partials: 39

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_or_instruction` | 10 |
| `speed_measurement` | 9 |
| `numeric_string` | 8 |
| `semantic_extraction` | 5 |
| `semantic_math` | 2 |
| `agent_or_tool_semantic` | 1 |
| `reasonmath_format` | 1 |
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect declared schemas and only coerce values when the schema permits it.
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
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / note: mismatch
- `dataextract/de-09` score=30: attendee_count: expected number / date: mismatch / needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / requester_name: misma
- `dataextract/de-12` score=50: battery_life_hours: expected number / complaint: mismatch / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expecte
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu
- `dataextract/de-14` score=47: battery_life_earbuds_hours: expected number / battery_life_with_case_hours: expected number / case_weight_grams: expected number / array values did not match expected set / earbud_

### `semantic_extraction`
- `dataextract/de-04` score=71: note: mismatch / room: mismatch
- `dataextract/de-06` score=87: 
- `dataextract/de-08` score=90: 
- `dataextract/de-10` score=80: cuisine_type: expected string / neighborhood: expected null
- `dataextract/de-11` score=86: 

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-07` score=50: tagged_translations
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-09` score=66.7: line_shape_forbidden_words_under_60_words
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.10; interest expected 718.96, got 721.10

### `speed_measurement`
- `speed/speed-short-001` score=69.5: 
- `speed/speed-short-002` score=76.49: 
- `speed/speed-short-003` score=77.64: 
- `speed/speed-medium-001` score=78.42: 
- `speed/speed-medium-002` score=78.52: 
- `speed/speed-medium-003` score=78.29: 
- `speed/speed-long-001` score=78.86: 
- `speed/speed-long-002` score=78.87: 

### `tool_missing`
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
