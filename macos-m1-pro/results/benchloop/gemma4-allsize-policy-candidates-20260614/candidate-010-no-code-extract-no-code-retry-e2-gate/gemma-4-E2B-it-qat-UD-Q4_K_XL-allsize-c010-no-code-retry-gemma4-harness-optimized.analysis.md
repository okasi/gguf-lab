# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-010-no-code-extract-no-code-retry-e2-gate/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c010-no-code-retry-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c010-no-code-retry-gemma4-harness-optimized`
- Overall: 76.42158146067416
- Quality: 80.00500000000001
- Speed: 76.42
- Reliability: 68.53932584269663
- Failures/partials: 40

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `numeric_string` | 8 |
| `semantic_extraction` | 5 |
| `semantic_math` | 3 |
| `agent_or_tool_semantic` | 1 |
| `coding_semantic` | 1 |
| `format_cleanup` | 1 |
| `reasonmath_format` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect declared schemas and only coerce values when the schema permits it.
- Enable fence/reasoning stripping and content normalization.
- Inspect reason/math formatting and instruction-following without rewriting expected answers.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `format_cleanup`
- `coding/coding-bug-fix-off-by-one` score=0: SyntaxError: 'return' outside function (line 4)

### `coding_semantic`
- `coding/coding-retry-decorator` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-k_cunq14/task.py", line 21, in wrapper
    return func(*args, **kwargs

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=43: battery_life_hours: expected number / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_price_paid: expected number /
- `dataextract/de-07` score=67: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / location: mismatch / note: mismatch
- `dataextract/de-09` score=30: attendee_count: expected number / date: mismatch / needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / requester_name: misma
- `dataextract/de-12` score=57: battery_life_hours: expected number / complaint: mismatch / price: expected number / ram_gb: expected number / rating: expected number / weight_kg: expected number
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu
- `dataextract/de-14` score=53: battery_life_earbuds_hours: expected number / battery_life_with_case_hours: expected number / case_weight_grams: expected number / array values did not match expected set / earbud_

### `semantic_extraction`
- `dataextract/de-04` score=71: meeting_name: mismatch / room: mismatch
- `dataextract/de-06` score=87: 
- `dataextract/de-08` score=90: 
- `dataextract/de-10` score=80: cuisine_type: mismatch / neighborhood: expected null
- `dataextract/de-11` score=86: 

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
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.01; interest expected 718.96, got 721.01

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=69.13: 
- `speed/speed-short-002` score=74.74: 
- `speed/speed-short-003` score=75.44: 
- `speed/speed-medium-001` score=78.19: 
- `speed/speed-medium-002` score=78.11: 
- `speed/speed-medium-003` score=78.11: 
- `speed/speed-long-001` score=78.34: 
- `speed/speed-long-002` score=78.34: 

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
