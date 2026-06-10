# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-20x/iteration-16/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 71.82949812734083
- Quality: 80.50666666666667
- Speed: 52.08
- Reliability: 68.53932584269663
- Failures/partials: 41

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `semantic_math` | 6 |
| `agent_or_tool_semantic` | 4 |
| `answer_line` | 1 |
| `tool_missing` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `agent/agent-03-string-roundtrip` score=75: 
- `agent/agent-05-refuse-unknown-tool` score=75: 
- `agent/agent-07-stocks-compare` score=50: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=71: note: mismatch / room: mismatch
- `dataextract/de-05` score=79: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80: date: mismatch / room: mismatch
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86: 

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-07` score=50: tagged_translations
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-03` score=55: new_original_price expected 100.0, got 75
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0: missing fill_time
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.09; interest expected 718.96, got 721.09
- `reasonmath/rm-15` score=0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=46.37: 
- `speed/speed-short-002` score=49.87: 
- `speed/speed-short-003` score=51.47: 
- `speed/speed-medium-001` score=52.82: 
- `speed/speed-medium-002` score=53.66: 
- `speed/speed-medium-003` score=52.65: 
- `speed/speed-long-001` score=54.44: 
- `speed/speed-long-002` score=54: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
