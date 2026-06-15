# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma-qwen-merged-policy-20260614/e2b-merged-v1/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-merged-gemmaqwen-v1-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-merged-gemmaqwen-v1-gemma4-harness-optimized`
- Overall: 74.60013483146068
- Quality: 79
- Speed: 74.29
- Reliability: 65.1685393258427
- Failures/partials: 42

## Failure Classes

| Class | Count |
| --- | ---: |
| `numeric_string` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `semantic_math` | 6 |
| `semantic_extraction` | 4 |
| `agent_or_tool_semantic` | 2 |
| `tool_partial_batch` | 2 |
| `coding_semantic` | 1 |
| `tool_missing` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Inspect declared schemas and only coerce values when the schema permits it.
- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `agent/agent-05-refuse-unknown-tool` score=75: 

### `coding_semantic`
- `coding/coding-retry-decorator` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-3jhbbwa8/task.py", line 20, in wrapper
    return func(*args, **kwargs

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=83: experience_years_min: expected number / work_model: mismatch
- `dataextract/de-05` score=36: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / note: mismatch
- `dataextract/de-08` score=80: catering_price_per_person: expected number / rsvp_deadline: expected string
- `dataextract/de-09` score=80: attendee_count: expected number / date: mismatch
- `dataextract/de-12` score=57: battery_life_hours: expected number / complaint: mismatch / price: expected number / ram_gb: expected number / rating: expected number / weight_kg: expected number
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `semantic_extraction`
- `dataextract/de-04` score=57: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-06` score=93: 
- `dataextract/de-10` score=80: cuisine_type: mismatch / neighborhood: expected null
- `dataextract/de-11` score=86: 

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `semantic_math`
- `reasonmath/rm-03` score=55: saved_money expected yes, got no
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-06` score=0: switch expected 0.75, got 1/2; stay expected 0.25, got 1/2
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-12` score=0: person expected son, got the speaker
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.02; interest expected 718.96, got 721.02

### `speed_measurement`
- `speed/speed-short-001` score=68.92: 
- `speed/speed-short-002` score=74.09: 
- `speed/speed-short-003` score=73.75: 
- `speed/speed-medium-001` score=77.67: 
- `speed/speed-medium-002` score=77.46: 
- `speed/speed-medium-003` score=73.01: 
- `speed/speed-long-001` score=73.3: 
- `speed/speed-long-002` score=75.58: 

### `tool_missing`
- `toolcall/tc-07` score=25: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_partial_batch`
- `toolcall/tc-09` score=50: matched 1/2 required tool calls
- `toolcall/tc-15` score=50: matched 1/2 required tool calls

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content
