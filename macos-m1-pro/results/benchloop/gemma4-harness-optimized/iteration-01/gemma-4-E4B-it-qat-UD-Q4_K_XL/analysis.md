# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-01/gemma-4-E4B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-harness-iter01`
- Overall: 58.184961610486894
- Quality: 58.52166666666667
- Speed: 61.17
- Reliability: 55.0561797752809
- Failures/partials: 52

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_cleanup` | 12 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 6 |
| `semantic_math` | 6 |
| `semantic_extraction` | 5 |
| `answer_line` | 4 |
| `numeric_string` | 3 |
| `invalid_json` | 2 |
| `tool_missing` | 2 |
| `tool_partial_batch` | 2 |
| `tool_unneeded` | 1 |

## Recommendations

- Enable fence/reasoning stripping and content normalization.
- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable numeric coercion for extraction JSON values.
- Enable missing batch-call synthesis.
- Enable JSON extraction/repair and escaped JSON parsing.
- Enable tool-call synthesis for obvious tool-use prompts.
- Enable direct-answer guard to drop unnecessary tool calls.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=50.0: 
- `toolcall/tc-15` score=50.0: matched 1/2 required tool calls

### `format_cleanup`
- `coding/coding-csv-parser` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-fibonacci-memo` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-flatten-nested` score=0.0: SyntaxError: unterminated string literal (detected at line 31) (line 31)
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-json-validator` score=0.0: SyntaxError: unterminated string literal (detected at line 29) (line 29)
- `coding/coding-retry-decorator` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-deduplicate-preserve-order` score=0.0: SyntaxError: unterminated string literal (detected at line 30) (line 30)
- `coding/coding-add-error-handling` score=0.0: SyntaxError: invalid syntax (line 1)

### `numeric_string`
- `dataextract/de-02` score=62.0: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-05` score=64.0: charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_price_paid: expected number
- `dataextract/de-12` score=64.0: battery_life_hours: expected number / price: expected number / ram_gb: expected number / rating: expected number / weight_kg: expected number

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=86.0: 
- `dataextract/de-06` score=87.0: 
- `dataextract/de-10` score=80.0: neighborhood: expected null / visit_duration: mismatch
- `dataextract/de-14` score=71.0: array values did not match expected set / driver_size: mismatch / array values did not match expected set / product_name: mismatch / product_type: mismatch

### `invalid_json`
- `dataextract/de-07` score=0.0: Invalid JSON: Expecting property name enclosed in double quotes: line 26 column 23 (char 725)
- `dataextract/de-13` score=0.0: Invalid JSON: Expecting ',' delimiter: line 22 column 20 (char 540)

### `format_or_instruction`
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: missing fill_time
- `reasonmath/rm-11` score=0.0: missing day
- `reasonmath/rm-13` score=0.0: missing amount; missing interest
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay
- `reasonmath/rm-07` score=0.0: missing ANSWER line; expected 48.0, got None
- `reasonmath/rm-09` score=0.0: missing ANSWER line; expected 35.0, got None
- `reasonmath/rm-10` score=0.0: missing ANSWER line; expected 2.1, got 1.1

### `speed_measurement`
- `speed/speed-short-001` score=54.35: 
- `speed/speed-short-002` score=59.91: 
- `speed/speed-short-003` score=59.95: 
- `speed/speed-medium-001` score=62.54: 
- `speed/speed-medium-002` score=62.61: 
- `speed/speed-medium-003` score=62.55: 
- `speed/speed-long-001` score=62.9: 
- `speed/speed-long-002` score=62.88: 

### `tool_missing`
- `toolcall/tc-03` score=25.0: did not match any acceptable tool strategy; answered directly instead of using tools
- `toolcall/tc-07` score=25.0: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0.0: unexpected tool call; missing expected direct answer content
