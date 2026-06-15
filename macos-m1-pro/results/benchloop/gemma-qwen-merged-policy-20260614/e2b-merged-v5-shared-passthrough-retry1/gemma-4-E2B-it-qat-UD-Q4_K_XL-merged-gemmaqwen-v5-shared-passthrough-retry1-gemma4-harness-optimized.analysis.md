# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma-qwen-merged-policy-20260614/e2b-merged-v5-shared-passthrough-retry1/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-merged-gemmaqwen-v5-shared-passthrough-retry1-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-merged-gemmaqwen-v5-shared-passthrough-retry1-gemma4-harness-optimized`
- Overall: 77.18562921348315
- Quality: 80.82
- Speed: 75.19
- Reliability: 70.78651685393258
- Failures/partials: 38

## Failure Classes

| Class | Count |
| --- | ---: |
| `numeric_string` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_extraction` | 4 |
| `semantic_math` | 2 |
| `agent_or_tool_semantic` | 1 |
| `coding_semantic` | 1 |
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

### `coding_semantic`
- `coding/coding-rate-limiter` score=25: Timed out after 10s

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=58: experience_years_min: expected number / location: mismatch / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=43: battery_life_hours: expected number / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_price_paid: expected number /
- `dataextract/de-07` score=67: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / location: mismatch / note: mismatch
- `dataextract/de-09` score=30: attendee_count: expected number / date: mismatch / needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / requester_name: misma
- `dataextract/de-11` score=71: budget_per_person: expected number / num_rooms: expected number
- `dataextract/de-12` score=50: battery_life_hours: expected number / complaint: mismatch / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expecte
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `semantic_extraction`
- `dataextract/de-04` score=0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-06` score=87: 
- `dataextract/de-08` score=90: 
- `dataextract/de-10` score=90: 

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5721.08; interest expected 718.96, got $721.08

### `speed_measurement`
- `speed/speed-short-001` score=70.27: 
- `speed/speed-short-002` score=76.57: 
- `speed/speed-short-003` score=63.92: 
- `speed/speed-medium-001` score=79.07: 
- `speed/speed-medium-002` score=77.43: 
- `speed/speed-medium-003` score=79.1: 
- `speed/speed-long-001` score=77.56: 
- `speed/speed-long-002` score=77.4: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
