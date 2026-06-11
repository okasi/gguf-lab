# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-nmax2-matrix-no-cap-20260610T164606Z/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 81.56105243445694
- Quality: 86.67333333333333
- Speed: 68.33
- Reliability: 80.89887640449437
- Failures/partials: 32

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_math` | 3 |
| `agent_or_tool_semantic` | 1 |
| `coding_semantic` | 1 |
| `tool_missing` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `coding_semantic`
- `coding/coding-rate-limiter` score=25: Timed out after 10s

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=86: 
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-10` score=70: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=93: 
- `dataextract/de-13` score=92: 

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-07` score=50: tagged_translations
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=33.3: exactly_50_words_humanity_to_stars; max_word_length_10
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-03` score=55: new_original_price expected 100.0, got 75
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.23; interest expected 718.96, got 721.23

### `speed_measurement`
- `speed/speed-short-001` score=60.67: 
- `speed/speed-short-002` score=67.31: 
- `speed/speed-short-003` score=67.01: 
- `speed/speed-medium-001` score=69.89: 
- `speed/speed-medium-002` score=69.87: 
- `speed/speed-medium-003` score=69.84: 
- `speed/speed-long-001` score=70.19: 
- `speed/speed-long-002` score=70.17: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
