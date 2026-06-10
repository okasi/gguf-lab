# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-20x/iteration-07/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 71.972063670412
- Quality: 80.03333333333335
- Speed: 52.69
- Reliability: 69.66292134831461
- Failures/partials: 40

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `semantic_math` | 6 |
| `agent_or_tool_semantic` | 2 |
| `answer_line` | 2 |
| `tool_missing` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `agent/agent-05-refuse-unknown-tool` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=57: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-05` score=79: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=70: date: mismatch / requester_name: mismatch / room: mismatch
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86: 

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=66.7: one_sentence_each
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-07` score=50: tagged_translations
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-11` score=0: missing day
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.15; interest expected 718.96, got 721.15
- `reasonmath/rm-15` score=0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay
- `reasonmath/rm-07` score=0: missing ANSWER line; expected 48.0, got 15.0

### `speed_measurement`
- `speed/speed-short-001` score=46.87: 
- `speed/speed-short-002` score=52.92: 
- `speed/speed-short-003` score=52.42: 
- `speed/speed-medium-001` score=55.21: 
- `speed/speed-medium-002` score=53.92: 
- `speed/speed-medium-003` score=54.99: 
- `speed/speed-long-001` score=52.08: 
- `speed/speed-long-002` score=51.78: 

### `tool_missing`
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools
