# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-011-code-extract-no-code-retry-e2-gate/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c011-code-extract-no-code-retry-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c011-code-extract-no-code-retry-gemma4-harness-optimized`
- Overall: 75.66718258426967
- Quality: 79.435
- Speed: 75.62
- Reliability: 67.41573033707866
- Failures/partials: 41

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `numeric_string` | 8 |
| `semantic_extraction` | 5 |
| `semantic_math` | 3 |
| `agent_or_tool_semantic` | 2 |
| `tool_missing` | 2 |
| `reasonmath_format` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect declared schemas and only coerce values when the schema permits it.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Inspect reason/math formatting and instruction-following without rewriting expected answers.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `agent/agent-05-refuse-unknown-tool` score=75: 

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=36: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / note: mismatch
- `dataextract/de-09` score=40: attendee_count: expected number / date: mismatch / needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / requester_name: misma
- `dataextract/de-11` score=71: budget_per_person: expected number / total_attendees: expected null
- `dataextract/de-12` score=50: battery_life_hours: expected number / complaint: mismatch / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expecte
- `dataextract/de-13` score=46: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.qty: expected number / line_items.unit_price: expected numbe

### `semantic_extraction`
- `dataextract/de-04` score=71: note: mismatch / room: mismatch
- `dataextract/de-06` score=87: 
- `dataextract/de-08` score=90: 
- `dataextract/de-10` score=90: 
- `dataextract/de-14` score=59: anc_type: mismatch / array values did not match expected set / driver_size: mismatch / array values did not match expected set / product_name: mismatch / product_type: mismatch / s

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-05` score=66.7: format_and_sorted_heaviest_to_lightest
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-12` score=0: person expected son, got man
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.10; interest expected 718.96, got 721.10

### `speed_measurement`
- `speed/speed-short-001` score=69.46: 
- `speed/speed-short-002` score=75.44: 
- `speed/speed-short-003` score=65.08: 
- `speed/speed-medium-001` score=77.62: 
- `speed/speed-medium-002` score=78.34: 
- `speed/speed-medium-003` score=78.49: 
- `speed/speed-long-001` score=78.52: 
- `speed/speed-long-002` score=78.76: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
- `toolcall/tc-05` score=0: matched 0/1 required tool calls

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
