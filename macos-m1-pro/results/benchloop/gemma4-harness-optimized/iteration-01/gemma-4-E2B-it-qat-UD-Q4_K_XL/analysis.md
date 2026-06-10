# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-01/gemma-4-E2B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-harness-iter01`
- Overall: 50.45542509363296
- Quality: 48.916666666666664
- Speed: 65.79
- Reliability: 41.57303370786517
- Failures/partials: 64

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_cleanup` | 12 |
| `semantic_math` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `answer_line` | 5 |
| `numeric_string` | 5 |
| `semantic_extraction` | 5 |
| `tool_partial_batch` | 4 |
| `invalid_json` | 3 |
| `tool_missing` | 2 |
| `tool_unneeded` | 2 |

## Recommendations

- Enable fence/reasoning stripping and content normalization.
- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable numeric coercion for extraction JSON values.
- Enable answer-line canonicalization.
- Enable missing batch-call synthesis.
- Enable JSON extraction/repair and escaped JSON parsing.
- Enable tool-call synthesis for obvious tool-use prompts.
- Enable direct-answer guard to drop unnecessary tool calls.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 
- `agent/agent-04-multi-step-calc` score=50.0: 
- `agent/agent-05-refuse-unknown-tool` score=75.0: 
- `toolcall/tc-15` score=50.0: matched 1/2 required tool calls

### `format_cleanup`
- `coding/coding-csv-parser` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-fibonacci-memo` score=0.0: SyntaxError: unterminated string literal (detected at line 35) (line 35)
- `coding/coding-flatten-nested` score=0.0: SyntaxError: unterminated string literal (detected at line 28) (line 28)
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-json-validator` score=0.0: SyntaxError: unterminated string literal (detected at line 31) (line 31)
- `coding/coding-retry-decorator` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-deduplicate-preserve-order` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-add-error-handling` score=0.0: SyntaxError: invalid syntax (line 1)

### `numeric_string`
- `dataextract/de-02` score=62.0: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67.0: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=36.0: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-08` score=80.0: catering_company: expected string / catering_price_per_person: expected number
- `dataextract/de-12` score=50.0: battery_life_hours: expected number / complaint: mismatch / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expecte

### `semantic_extraction`
- `dataextract/de-04` score=71.0: meeting_name: mismatch / room: mismatch
- `dataextract/de-06` score=87.0: 
- `dataextract/de-09` score=80.0: date: mismatch / requester_name: mismatch
- `dataextract/de-10` score=90.0: 
- `dataextract/de-11` score=86.0: 

### `invalid_json`
- `dataextract/de-07` score=0.0: Invalid JSON: Unterminated string starting at: line 24 column 14 (char 742)
- `dataextract/de-13` score=0.0: Invalid JSON: Expecting ',' delimiter: line 22 column 20 (char 540)
- `dataextract/de-14` score=0.0: Invalid JSON: Unterminated string starting at: line 26 column 1 (char 612)

### `format_or_instruction`
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-07` score=50.0: tagged_translations
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-09` score=66.7: line_shape_forbidden_words_under_60_words
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50.0: city_constraints

### `answer_line`
- `reasonmath/rm-01` score=0.0: missing ANSWER line; expected 35.98, got 16.8
- `reasonmath/rm-06` score=0.0: missing switch; missing stay
- `reasonmath/rm-07` score=0.0: missing ANSWER line; expected 48.0, got 18.0
- `reasonmath/rm-09` score=0.0: missing ANSWER line; expected 35.0, got 2.0
- `reasonmath/rm-10` score=0.0: missing ANSWER line; expected 2.1, got 2.0

### `semantic_math`
- `reasonmath/rm-03` score=0.0: missing new_original_price; missing saved_money
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: missing fill_time
- `reasonmath/rm-11` score=0.0: missing day
- `reasonmath/rm-12` score=0.0: missing person
- `reasonmath/rm-13` score=0.0: missing amount; missing interest
- `reasonmath/rm-14` score=0.0: missing temp_f; missing time_min

### `speed_measurement`
- `speed/speed-short-001` score=53.84: 
- `speed/speed-short-002` score=59.38: 
- `speed/speed-short-003` score=56.98: 
- `speed/speed-medium-001` score=59.48: 
- `speed/speed-medium-002` score=72.32: 
- `speed/speed-medium-003` score=72.46: 
- `speed/speed-long-001` score=72.8: 
- `speed/speed-long-002` score=72.41: 

### `tool_missing`
- `toolcall/tc-05` score=25.0: matched 0/1 required tool calls; answered directly instead of using tools
- `toolcall/tc-07` score=25.0: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-10` score=0.0: unexpected tool call; missing expected direct answer content
- `toolcall/tc-11` score=0.0: unexpected tool call; missing expected direct answer content
