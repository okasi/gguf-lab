# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-20x/iteration-05/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 73.40487359550562
- Quality: 83.425
- Speed: 42.1
- Reliability: 76.40449438202246
- Failures/partials: 33

## Failure Classes

| Class | Count |
| --- | ---: |
| `speed_measurement` | 9 |
| `semantic_extraction` | 8 |
| `format_or_instruction` | 7 |
| `semantic_math` | 5 |
| `agent_or_tool_semantic` | 2 |
| `answer_line` | 1 |
| `tool_missing` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `toolcall/tc-11` score=50: missing expected direct answer content

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=86: 
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=79: complaint: mismatch / product_name: mismatch / rating: mismatch
- `dataextract/de-13` score=0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-14` score=59: anc_type: mismatch / array values did not match expected set / driver_size: mismatch / array values did not match expected set / product_name: mismatch / product_type: mismatch / w

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5719.14; interest expected 718.96, got 719.14
- `reasonmath/rm-15` score=0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=34.72: 
- `speed/speed-short-002` score=41.76: 
- `speed/speed-short-003` score=41.17: 
- `speed/speed-medium-001` score=43.36: 
- `speed/speed-medium-002` score=43.5: 
- `speed/speed-medium-003` score=43.54: 
- `speed/speed-long-001` score=44.2: 
- `speed/speed-long-002` score=43.84: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
