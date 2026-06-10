# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-extra5/iteration-01/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 79.47470131086143
- Quality: 86.23833333333334
- Speed: 57.69
- Reliability: 82.02247191011236
- Failures/partials: 32

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `semantic_math` | 3 |
| `agent_or_tool_semantic` | 1 |
| `answer_line` | 1 |
| `invalid_json` | 1 |
| `tool_missing` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable JSON extraction/repair and escaped JSON parsing.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=86: 
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=90: 
- `dataextract/de-10` score=70: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=93: 

### `invalid_json`
- `dataextract/de-14` score=0: Invalid JSON: Invalid \uXXXX escape: line 1 column 524 (char 523)

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-12` score=0: person expected son, got son or daughter
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.35; interest expected 718.96, got 721.35

### `speed_measurement`
- `speed/speed-short-001` score=53.65: 
- `speed/speed-short-002` score=54.83: 
- `speed/speed-short-003` score=55.66: 
- `speed/speed-medium-001` score=58.43: 
- `speed/speed-medium-002` score=58.97: 
- `speed/speed-medium-003` score=60.59: 
- `speed/speed-long-001` score=59.42: 
- `speed/speed-long-002` score=58.45: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
