# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-forensic3/iteration-01/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 76.25396254681648
- Quality: 82.73333333333333
- Speed: 65.27
- Reliability: 70.78651685393258
- Failures/partials: 38

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `semantic_math` | 6 |
| `agent_or_tool_semantic` | 2 |
| `tool_missing` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `agent/agent-05-refuse-unknown-tool` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=57: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-05` score=79: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=80: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / role: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80: date: mismatch / requester_name: mismatch
- `dataextract/de-10` score=70: cuisine_type: mismatch / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86: 

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-05` score=66.7: at_least_one_under_1kg
- `instructfollow/if-07` score=50: tagged_translations
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0: missing fit; missing max_meetings
- `reasonmath/rm-06` score=55: switch expected 0.75, got 2
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.08; interest expected 718.96, got 721.08
- `reasonmath/rm-15` score=0: count expected 126, got 10

### `speed_measurement`
- `speed/speed-short-001` score=55.58: 
- `speed/speed-short-002` score=64.27: 
- `speed/speed-short-003` score=63.47: 
- `speed/speed-medium-001` score=67.43: 
- `speed/speed-medium-002` score=67.19: 
- `speed/speed-medium-003` score=67.43: 
- `speed/speed-long-001` score=67.39: 
- `speed/speed-long-002` score=67.06: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
