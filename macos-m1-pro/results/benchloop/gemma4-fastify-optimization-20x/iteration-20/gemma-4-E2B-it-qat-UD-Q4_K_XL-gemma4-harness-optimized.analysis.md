# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-20x/iteration-20/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 73.29221254681649
- Quality: 82.02833333333332
- Speed: 52.4
- Reliability: 70.78651685393258
- Failures/partials: 37

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `semantic_math` | 6 |
| `agent_or_tool_semantic` | 1 |
| `answer_line` | 1 |
| `invalid_json` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable JSON extraction/repair and escaped JSON parsing.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=71: meeting_name: mismatch / room: mismatch
- `dataextract/de-05` score=79: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=80: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80: date: mismatch / room: mismatch
- `dataextract/de-10` score=70: cuisine_type: mismatch / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86: 

### `invalid_json`
- `dataextract/de-13` score=0: Invalid JSON: Expecting value: line 1 column 1 (char 0)

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-07` score=50: tagged_translations
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=33.3: exactly_50_words_humanity_to_stars; max_word_length_10
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-01` score=0: expected 35.98, got 30.38
- `reasonmath/rm-03` score=55: saved_money expected yes, got no
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.05; interest expected 718.96, got $721.05

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=47.11: 
- `speed/speed-short-002` score=53.49: 
- `speed/speed-short-003` score=49.56: 
- `speed/speed-medium-001` score=52.6: 
- `speed/speed-medium-002` score=54.44: 
- `speed/speed-medium-003` score=53.87: 
- `speed/speed-long-001` score=53.5: 
- `speed/speed-long-002` score=53.44:
