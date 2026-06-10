# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-extra5/iteration-05/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 79.47963576779026
- Quality: 86.76166666666666
- Speed: 57.68
- Reliability: 80.89887640449437
- Failures/partials: 32

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `semantic_math` | 2 |
| `tool_missing` | 2 |
| `agent_or_tool_semantic` | 1 |
| `answer_line` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable tool-call synthesis for obvious tool-use prompts.
- Enable answer-line canonicalization.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=86: 
- `dataextract/de-05` score=93: 
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=60: needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / requester_name: mismatch
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=86: 

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
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.08; interest expected 718.96, got 721.08

### `speed_measurement`
- `speed/speed-short-001` score=52.88: 
- `speed/speed-short-002` score=55.11: 
- `speed/speed-short-003` score=53.18: 
- `speed/speed-medium-001` score=58.93: 
- `speed/speed-medium-002` score=59.23: 
- `speed/speed-medium-003` score=60.1: 
- `speed/speed-long-001` score=59.56: 
- `speed/speed-long-002` score=60.34: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools
