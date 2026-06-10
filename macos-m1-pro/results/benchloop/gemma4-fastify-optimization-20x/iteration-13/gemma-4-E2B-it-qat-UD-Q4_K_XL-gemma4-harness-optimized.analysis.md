# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-20x/iteration-13/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 74.55364138576779
- Quality: 82.55166666666666
- Speed: 51.65
- Reliability: 75.28089887640449
- Failures/partials: 37

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_math` | 6 |
| `agent_or_tool_semantic` | 1 |
| `answer_line` | 1 |
| `tool_missing` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=86: 
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / location: mismatch / note: mismatch / location: mismatch / note: mismatch
- `dataextract/de-09` score=90: 
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86: 

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `semantic_math`
- `reasonmath/rm-03` score=55: saved_money expected yes, got no
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0: missing fill_time
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5721.16; interest expected 718.96, got $721.16
- `reasonmath/rm-15` score=0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=41.78: 
- `speed/speed-short-002` score=47.15: 
- `speed/speed-short-003` score=51.37: 
- `speed/speed-medium-001` score=54.11: 
- `speed/speed-medium-002` score=54.21: 
- `speed/speed-medium-003` score=53.75: 
- `speed/speed-long-001` score=54.03: 
- `speed/speed-long-002` score=54.16: 

### `tool_missing`
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools
