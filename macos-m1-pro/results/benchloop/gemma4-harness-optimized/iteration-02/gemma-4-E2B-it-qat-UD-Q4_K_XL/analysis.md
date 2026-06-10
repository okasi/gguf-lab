# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-02/gemma-4-E2B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-harness-iter02`
- Overall: 57.73128277153559
- Quality: 56.30333333333334
- Speed: 70.62
- Reliability: 50.56179775280899
- Failures/partials: 55

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_cleanup` | 12 |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_math` | 8 |
| `answer_line` | 5 |
| `tool_partial_batch` | 2 |
| `numeric_string` | 1 |

## Recommendations

- Enable fence/reasoning stripping and content normalization.
- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable missing batch-call synthesis.
- Enable numeric coercion for extraction JSON values.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 
- `agent/agent-03-string-roundtrip` score=50.0: 

### `format_cleanup`
- `coding/coding-csv-parser` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-fibonacci-memo` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-flatten-nested` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-json-validator` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-retry-decorator` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-deduplicate-preserve-order` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-add-error-handling` score=0.0: SyntaxError: unterminated string literal (detected at line 24) (line 24)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=57.0: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-05` score=79.0: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=0.0: top-level shape mismatch: expected array, received object / expected array
- `dataextract/de-09` score=80.0: date: mismatch / room: mismatch
- `dataextract/de-10` score=80.0: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86.0: 

### `numeric_string`
- `dataextract/de-13` score=0.0: extra top-level fields: amount, description, qty, unit_price / missing top-level fields: billing_contact_email, client_name, client_po, discounts, due_date, invoice_date, invoice_n

### `format_or_instruction`
- `instructfollow/if-02` score=50.0: word_counts_3_4_3
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50.0: city_constraints

### `answer_line`
- `reasonmath/rm-01` score=0.0: missing ANSWER line; expected 35.98, got 3.0
- `reasonmath/rm-06` score=0.0: missing switch; missing stay
- `reasonmath/rm-07` score=0.0: missing ANSWER line; expected 48.0, got 40.0
- `reasonmath/rm-09` score=0.0: missing ANSWER line; expected 35.0, got 15.0
- `reasonmath/rm-10` score=0.0: missing ANSWER line; expected 2.1, got 1.0

### `semantic_math`
- `reasonmath/rm-03` score=0.0: missing new_original_price; missing saved_money
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: missing fill_time
- `reasonmath/rm-11` score=0.0: missing day
- `reasonmath/rm-13` score=0.0: missing amount; missing interest
- `reasonmath/rm-14` score=0.0: missing temp_f; missing time_min
- `reasonmath/rm-15` score=0.0: missing count

### `speed_measurement`
- `speed/speed-short-001` score=64.15: 
- `speed/speed-short-002` score=69.51: 
- `speed/speed-short-003` score=69.08: 
- `speed/speed-medium-001` score=72.14: 
- `speed/speed-medium-002` score=72.1: 
- `speed/speed-medium-003` score=71.65: 
- `speed/speed-long-001` score=72.32: 
- `speed/speed-long-002` score=72.18:
