# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-20x/iteration-03/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 71.85923033707866
- Quality: 80.05
- Speed: 52.08
- Reliability: 69.66292134831461
- Failures/partials: 38

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
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
- `agent/agent-03-string-roundtrip` score=50: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=71: note: mismatch / room: mismatch
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=80: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80: date: mismatch / requester_name: mismatch
- `dataextract/de-10` score=60: chef_name: expected null / cuisine_type: mismatch / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=79: complaint: mismatch / product_name: mismatch / rating: mismatch

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
- `reasonmath/rm-03` score=55: saved_money expected yes, got no
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.00; interest expected 718.96, got 721.00
- `reasonmath/rm-15` score=0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay
- `reasonmath/rm-07` score=0: missing ANSWER line; expected 48.0, got 7.0

### `speed_measurement`
- `speed/speed-short-001` score=47.95: 
- `speed/speed-short-002` score=48.38: 
- `speed/speed-short-003` score=47.33: 
- `speed/speed-medium-001` score=55.59: 
- `speed/speed-medium-002` score=52.34: 
- `speed/speed-medium-003` score=55.35: 
- `speed/speed-long-001` score=54.85: 
- `speed/speed-long-002` score=53.42: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
