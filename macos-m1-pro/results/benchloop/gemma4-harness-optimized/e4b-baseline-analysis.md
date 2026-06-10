# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL`
- Overall: 77.53422471910113
- Quality: 83.32000000000001
- Speed: 64.44
- Reliability: 75.28089887640449
- Failures/partials: 36

## Failure Classes

| Class | Count |
| --- | ---: |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `semantic_extraction` | 7 |
| `numeric_string` | 4 |
| `tool_missing` | 3 |
| `semantic_math` | 2 |
| `tool_partial_batch` | 2 |
| `answer_line` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Enable numeric coercion for extraction JSON values.
- Enable tool-call synthesis for obvious tool-use prompts.
- Enable missing batch-call synthesis.
- Enable answer-line canonicalization.
- Enable direct-answer guard to drop unnecessary tool calls.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 
- `toolcall/tc-15` score=50.0: matched 1/2 required tool calls

### `numeric_string`
- `dataextract/de-02` score=62.0: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-05` score=43.0: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-12` score=57.0: battery_life_hours: expected number / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expected number
- `dataextract/de-13` score=59.0: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=86.0: 
- `dataextract/de-06` score=87.0: 
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=90.0: 
- `dataextract/de-10` score=80.0: neighborhood: expected null / visit_duration: mismatch
- `dataextract/de-14` score=88.0: 

### `format_or_instruction`
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50.0: city_constraints

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.05; interest expected 718.96, got 721.05

### `speed_measurement`
- `speed/speed-short-001` score=60.13: 
- `speed/speed-short-002` score=63.46: 
- `speed/speed-short-003` score=61.61: 
- `speed/speed-medium-001` score=65.13: 
- `speed/speed-medium-002` score=64.92: 
- `speed/speed-medium-003` score=65.02: 
- `speed/speed-long-001` score=67.02: 
- `speed/speed-long-002` score=66.21: 

### `tool_missing`
- `toolcall/tc-03` score=25.0: did not match any acceptable tool strategy; answered directly instead of using tools
- `toolcall/tc-05` score=25.0: matched 0/1 required tool calls; answered directly instead of using tools
- `toolcall/tc-07` score=25.0: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0.0: unexpected tool call; missing expected direct answer content
