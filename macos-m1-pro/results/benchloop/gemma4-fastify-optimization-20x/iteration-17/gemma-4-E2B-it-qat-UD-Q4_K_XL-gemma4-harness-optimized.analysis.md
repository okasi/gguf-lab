# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-20x/iteration-17/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 73.63942696629213
- Quality: 82.05999999999999
- Speed: 51.24
- Reliability: 73.03370786516854
- Failures/partials: 35

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `semantic_math` | 6 |
| `answer_line` | 2 |
| `agent_or_tool_semantic` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=71: note: mismatch / room: mismatch
- `dataextract/de-05` score=71: bluetooth_version: mismatch / charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80: date: mismatch / room: mismatch
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=79: complaint: mismatch / product_name: mismatch / rating: mismatch

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0: missing fill_time
- `reasonmath/rm-12` score=0: missing person
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.03; interest expected 718.96, got 721.03
- `reasonmath/rm-15` score=0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay
- `reasonmath/rm-07` score=0: missing ANSWER line; expected 48.0, got 15.0

### `speed_measurement`
- `speed/speed-short-001` score=46.9: 
- `speed/speed-short-002` score=44.75: 
- `speed/speed-short-003` score=52.04: 
- `speed/speed-medium-001` score=53.7: 
- `speed/speed-medium-002` score=52.07: 
- `speed/speed-medium-003` score=53.39: 
- `speed/speed-long-001` score=52.52: 
- `speed/speed-long-002` score=52.64:
