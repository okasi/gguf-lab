# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-forensic3/iteration-02/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 81.37275468164795
- Quality: 87.64333333333333
- Speed: 67.53
- Reliability: 78.65168539325843
- Failures/partials: 31

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `semantic_math` | 4 |
| `agent_or_tool_semantic` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=71: meeting_name: mismatch / room: mismatch
- `dataextract/de-05` score=79: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=70: date: mismatch / requester_name: mismatch / room: mismatch
- `dataextract/de-10` score=70: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
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
- `reasonmath/rm-06` score=55: switch expected 0.75, got 2
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.09; interest expected 718.96, got 721.09

### `speed_measurement`
- `speed/speed-short-001` score=60.6: 
- `speed/speed-short-002` score=67.69: 
- `speed/speed-short-003` score=68.21: 
- `speed/speed-medium-001` score=67.5: 
- `speed/speed-medium-002` score=68.11: 
- `speed/speed-medium-003` score=68.34: 
- `speed/speed-long-001` score=68.37: 
- `speed/speed-long-002` score=68.57:
