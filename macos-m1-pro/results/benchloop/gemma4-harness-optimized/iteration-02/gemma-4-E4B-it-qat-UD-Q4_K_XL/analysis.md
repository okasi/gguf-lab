# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-02/gemma-4-E4B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-harness-iter02`
- Overall: 60.27157490636705
- Quality: 60.623333333333335
- Speed: 61.61
- Reliability: 58.42696629213483
- Failures/partials: 50

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_cleanup` | 11 |
| `semantic_extraction` | 9 |
| `semantic_math` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `answer_line` | 3 |
| `numeric_string` | 1 |
| `tool_partial_batch` | 1 |

## Recommendations

- Enable fence/reasoning stripping and content normalization.
- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable missing batch-call synthesis.
- Enable numeric coercion for extraction JSON values.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 

### `format_cleanup`
- `coding/coding-csv-parser` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-fibonacci-memo` score=0.0: SyntaxError: unterminated string literal (detected at line 34) (line 34)
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-json-validator` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-retry-decorator` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-deduplicate-preserve-order` score=0.0: SyntaxError: unterminated string literal (detected at line 29) (line 29)
- `coding/coding-add-error-handling` score=0.0: SyntaxError: unterminated string literal (detected at line 1) (line 1)
- `coding/coding-lru-cache` score=0.0: SyntaxError: invalid syntax (line 1)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=86.0: 
- `dataextract/de-05` score=79.0: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=87.0: 
- `dataextract/de-07` score=0.0: top-level shape mismatch: expected array, received object / expected array
- `dataextract/de-09` score=90.0: 
- `dataextract/de-10` score=70.0: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=79.0: display_type: mismatch / product_name: mismatch / rating: mismatch

### `numeric_string`
- `dataextract/de-13` score=0.0: extra top-level fields: amount, description, qty, unit_price / missing top-level fields: billing_contact_email, client_name, client_po, discounts, due_date, invoice_date, invoice_n

### `format_or_instruction`
- `instructfollow/if-02` score=50.0: word_counts_3_4_3
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50.0: city_constraints

### `semantic_math`
- `reasonmath/rm-03` score=0.0: missing new_original_price; missing saved_money
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: missing fill_time
- `reasonmath/rm-11` score=0.0: missing day
- `reasonmath/rm-12` score=0.0: person expected son, got son or daughter
- `reasonmath/rm-13` score=0.0: missing amount; missing interest
- `reasonmath/rm-14` score=0.0: missing temp_f; missing time_min

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay
- `reasonmath/rm-07` score=0.0: missing ANSWER line; expected 48.0, got None
- `reasonmath/rm-09` score=0.0: missing ANSWER line; expected 35.0, got 15.0

### `speed_measurement`
- `speed/speed-short-001` score=55.29: 
- `speed/speed-short-002` score=61.2: 
- `speed/speed-short-003` score=60.85: 
- `speed/speed-medium-001` score=62.57: 
- `speed/speed-medium-002` score=62.97: 
- `speed/speed-medium-003` score=62.68: 
- `speed/speed-long-001` score=62.94: 
- `speed/speed-long-002` score=63.09:
