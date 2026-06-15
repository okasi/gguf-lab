# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-e2b-e4b-current-policy-rerun-20260614/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-nmax2-current-policy-clean-raw.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-nmax2-current-policy-clean-raw`
- Overall: 77.69222471910113
- Quality: 83.32000000000001
- Speed: 65.23
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
| `agent_or_tool_semantic` | 1 |
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

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-05` score=43: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-12` score=57: battery_life_hours: expected number / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expected number
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=86: 
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=90: 
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: mismatch
- `dataextract/de-14` score=88: 

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.05; interest expected 718.96, got 721.05

### `speed_measurement`
- `speed/speed-short-001` score=57.9: 
- `speed/speed-short-002` score=64.69: 
- `speed/speed-short-003` score=63.73: 
- `speed/speed-medium-001` score=66.72: 
- `speed/speed-medium-002` score=66.64: 
- `speed/speed-medium-003` score=66.53: 
- `speed/speed-long-001` score=66.97: 
- `speed/speed-long-002` score=67.07: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools
- `toolcall/tc-07` score=25: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
