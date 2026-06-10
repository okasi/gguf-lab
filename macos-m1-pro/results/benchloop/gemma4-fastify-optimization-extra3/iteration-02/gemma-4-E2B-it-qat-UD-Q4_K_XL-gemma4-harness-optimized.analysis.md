# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-extra3/iteration-02/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 80.06077247191011
- Quality: 85.88499999999999
- Speed: 67.21
- Reliability: 77.52808988764045
- Failures/partials: 34

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `semantic_math` | 3 |
| `answer_line` | 1 |
| `tool_missing` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=57: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-05` score=79: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-08` score=90: 
- `dataextract/de-09` score=80: date: mismatch / room: mismatch
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string

### `format_or_instruction`
- `instructfollow/if-01` score=50: period_and_word_count
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.40; interest expected 718.96, got 721.40

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=58.76: 
- `speed/speed-short-002` score=69.89: 
- `speed/speed-short-003` score=63.4: 
- `speed/speed-medium-001` score=68.31: 
- `speed/speed-medium-002` score=68.39: 
- `speed/speed-medium-003` score=68.62: 
- `speed/speed-long-001` score=68.81: 
- `speed/speed-long-002` score=69.03: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
