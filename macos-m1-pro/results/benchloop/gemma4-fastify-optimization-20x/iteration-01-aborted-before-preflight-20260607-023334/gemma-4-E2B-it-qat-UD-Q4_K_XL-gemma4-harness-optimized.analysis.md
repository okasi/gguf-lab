# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-20x/iteration-01/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 72.0051647940075
- Quality: 80.23333333333333
- Speed: 53.71
- Reliability: 68.53932584269663
- Failures/partials: 39

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_math` | 7 |
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
- `agent/agent-07-stocks-compare` score=75: 

### `semantic_extraction`
- `dataextract/de-02` score=94: 
- `dataextract/de-03` score=83: location: mismatch / work_model: mismatch
- `dataextract/de-04` score=57: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-05` score=79: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=80: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / role: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80: date: mismatch / room: mismatch
- `dataextract/de-10` score=70: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `semantic_math`
- `reasonmath/rm-03` score=55: new_original_price expected 100.0, got 75
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0: missing fit; missing max_meetings
- `reasonmath/rm-07` score=0: expected 48.0, got None
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.31; interest expected 718.96, got 721.31
- `reasonmath/rm-15` score=0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=46.23: 
- `speed/speed-short-002` score=53.76: 
- `speed/speed-short-003` score=55.49: 
- `speed/speed-medium-001` score=53.81: 
- `speed/speed-medium-002` score=55.48: 
- `speed/speed-medium-003` score=52.76: 
- `speed/speed-long-001` score=56.22: 
- `speed/speed-long-002` score=54.17: 

### `tool_missing`
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools
