# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-promoted-rerun-v3-codingfix/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 76.54031367041199
- Quality: 80.68833333333333
- Speed: 73.73
- Reliability: 69.66292134831461
- Failures/partials: 37

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_math` | 6 |
| `answer_line` | 2 |
| `invalid_json` | 1 |
| `numeric_string` | 1 |
| `tool_partial_batch` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable missing batch-call synthesis.
- Enable numeric coercion for extraction JSON values.
- Enable JSON extraction/repair and escaped JSON parsing.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=71.0: note: mismatch / room: mismatch
- `dataextract/de-05` score=79.0: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80.0: date: mismatch / requester_name: mismatch
- `dataextract/de-10` score=70.0: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=79.0: complaint: mismatch / product_name: mismatch / rating: mismatch

### `numeric_string`
- `dataextract/de-11` score=71.0: num_rooms: expected number / total_attendees: expected null

### `invalid_json`
- `dataextract/de-13` score=0.0: Invalid JSON: Expecting value: line 1 column 1 (char 0)

### `format_or_instruction`
- `instructfollow/if-02` score=50.0: word_counts_3_4_3
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-07` score=50.0: tagged_translations
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50.0: city_constraints

### `semantic_math`
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-09` score=0.0: expected 35.0, got None
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got $5721.40; interest expected 718.96, got $721.40
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay
- `reasonmath/rm-07` score=0.0: missing ANSWER line; expected 48.0, got 36.0

### `speed_measurement`
- `speed/speed-short-001` score=66.83: 
- `speed/speed-short-002` score=72.95: 
- `speed/speed-short-003` score=73.15: 
- `speed/speed-medium-001` score=74.88: 
- `speed/speed-medium-002` score=74.88: 
- `speed/speed-medium-003` score=75.24: 
- `speed/speed-long-001` score=75.28: 
- `speed/speed-long-002` score=75.19:
