# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-nmax2-matrix-no-cap-20260610T164606Z/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 81.32114138576779
- Quality: 85.32166666666667
- Speed: 77.87
- Reliability: 75.28089887640449
- Failures/partials: 36

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 12 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_math` | 3 |
| `agent_or_tool_semantic` | 2 |
| `coding_semantic` | 1 |
| `tool_missing` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `agent/agent-05-refuse-unknown-tool` score=75: 

### `coding_semantic`
- `coding/coding-lru-cache` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-zmdk0yva/task.py", line 89, in <module>
    cache.put("1", 10)  # Cach

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=71: meeting_name: mismatch / room: mismatch
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=80: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-08` score=90: 
- `dataextract/de-09` score=80: date: mismatch / room: mismatch
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-05` score=66.7: at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.45; interest expected 718.96, got 721.45
- `reasonmath/rm-15` score=0: count expected 126, got 56

### `speed_measurement`
- `speed/speed-short-001` score=70.48: 
- `speed/speed-short-002` score=76.19: 
- `speed/speed-short-003` score=76.29: 
- `speed/speed-medium-001` score=79.32: 
- `speed/speed-medium-002` score=79.42: 
- `speed/speed-medium-003` score=79.43: 
- `speed/speed-long-001` score=79.78: 
- `speed/speed-long-002` score=79.86: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
