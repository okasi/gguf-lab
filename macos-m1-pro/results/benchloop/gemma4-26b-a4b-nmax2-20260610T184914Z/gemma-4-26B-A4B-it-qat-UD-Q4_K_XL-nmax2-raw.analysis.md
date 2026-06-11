# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-26b-a4b-nmax2-20260610T184914Z/run-json/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-nmax2-raw.run.json`
- Model: `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-nmax2-raw`
- Overall: 76.74262359550562
- Quality: 84.09
- Speed: 56.96
- Reliability: 76.40449438202246
- Failures/partials: 33

## Failure Classes

| Class | Count |
| --- | ---: |
| `speed_measurement` | 9 |
| `semantic_extraction` | 7 |
| `format_or_instruction` | 6 |
| `numeric_string` | 3 |
| `semantic_math` | 3 |
| `agent_or_tool_semantic` | 1 |
| `format_cleanup` | 1 |
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Enable numeric coercion for extraction JSON values.
- Enable fence/reasoning stripping and content normalization.
- Enable tool-call synthesis for obvious tool-use prompts.
- Enable missing batch-call synthesis.
- Enable direct-answer guard to drop unnecessary tool calls.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `format_cleanup`
- `coding/coding-flatten-nested` score=0: SyntaxError: closing parenthesis ')' does not match opening parenthesis '[' (line 18)

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-05` score=79: product_name: mismatch / rating_stars: expected number / recommendation: mismatch
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-10` score=70: cuisine_type: expected string / neighborhood: expected null / visit_duration: mismatch
- `dataextract/de-12` score=93: 
- `dataextract/de-14` score=76: anc_type: mismatch / array values did not match expected set / array values did not match expected set / product_type: mismatch

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=66.7: at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-06` score=0: switch expected 0.75, got 3/4; stay expected 0.25, got 1/4
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24

### `speed_measurement`
- `speed/speed-short-001` score=41.47: 
- `speed/speed-short-002` score=56.32: 
- `speed/speed-short-003` score=53.41: 
- `speed/speed-medium-001` score=56.66: 
- `speed/speed-medium-002` score=59.36: 
- `speed/speed-medium-003` score=58.67: 
- `speed/speed-long-001` score=58.69: 
- `speed/speed-long-002` score=64.09: 

### `tool_missing`
- `toolcall/tc-05` score=0: matched 0/1 required tool calls

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
