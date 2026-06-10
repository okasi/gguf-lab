# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-extra3/iteration-03/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 78.55414138576779
- Quality: 84.10166666666666
- Speed: 67.39
- Reliability: 75.28089887640449
- Failures/partials: 36

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_math` | 4 |
| `agent_or_tool_semantic` | 3 |
| `tool_missing` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=50: 
- `agent/agent-03-string-roundtrip` score=75: 
- `agent/agent-05-refuse-unknown-tool` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=83: location: mismatch / work_model: mismatch
- `dataextract/de-04` score=86: 
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=80: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / location: mismatch / note: mismatch / location: mismatch / note: mismatch
- `dataextract/de-09` score=70: date: mismatch / requester_name: mismatch / room: mismatch
- `dataextract/de-10` score=70: cuisine_type: mismatch / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86: 

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
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-12` score=0: person expected son, got me
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.23; interest expected 718.96, got 721.23

### `speed_measurement`
- `speed/speed-short-001` score=61.55: 
- `speed/speed-short-002` score=64.64: 
- `speed/speed-short-003` score=68.55: 
- `speed/speed-medium-001` score=68.32: 
- `speed/speed-medium-002` score=68.11: 
- `speed/speed-medium-003` score=69.84: 
- `speed/speed-long-001` score=68.51: 
- `speed/speed-long-002` score=68.5: 

### `tool_missing`
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools
