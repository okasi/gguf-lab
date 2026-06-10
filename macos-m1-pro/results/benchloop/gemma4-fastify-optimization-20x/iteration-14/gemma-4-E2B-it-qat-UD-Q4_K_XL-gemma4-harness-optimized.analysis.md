# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-20x/iteration-14/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 71.45098033707866
- Quality: 79.27499999999999
- Speed: 52.17
- Reliability: 69.66292134831461
- Failures/partials: 40

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 12 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
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
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=80: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=67: location: mismatch / note: mismatch / role: mismatch / location: mismatch / note: mismatch / location: mismatch / note: mismatch
- `dataextract/de-08` score=90: 
- `dataextract/de-09` score=80: date: mismatch / room: mismatch
- `dataextract/de-10` score=70: cuisine_type: mismatch / neighborhood: expected null / visit_duration: expected string

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
- `reasonmath/rm-03` score=0: missing new_original_price; missing saved_money
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0: missing fill_time
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.01; interest expected 718.96, got 721.01
- `reasonmath/rm-15` score=0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay
- `reasonmath/rm-07` score=0: missing ANSWER line; expected 48.0, got 24.0

### `speed_measurement`
- `speed/speed-short-001` score=43.35: 
- `speed/speed-short-002` score=51.26: 
- `speed/speed-short-003` score=53.61: 
- `speed/speed-medium-001` score=52.51: 
- `speed/speed-medium-002` score=53.48: 
- `speed/speed-medium-003` score=53.87: 
- `speed/speed-long-001` score=54.34: 
- `speed/speed-long-002` score=52.94: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
