# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-26b-a4b-nmax2-20260610T184914Z/run-json/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 82.32948127340825
- Quality: 89.09666666666668
- Speed: 59.89
- Reliability: 85.39325842696628
- Failures/partials: 27

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 4 |
| `semantic_math` | 3 |
| `agent_or_tool_semantic` | 1 |
| `format_cleanup` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Enable fence/reasoning stripping and content normalization.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `format_cleanup`
- `coding/coding-retry-decorator` score=0: SyntaxError: no binding for nonlocal 'calls' found (line 49)

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-05` score=93: 
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-10` score=70: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=93: 
- `dataextract/de-13` score=92: 

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-12` score=0: person expected son, got his son
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24

### `speed_measurement`
- `speed/speed-short-001` score=50.18: 
- `speed/speed-short-002` score=63.95: 
- `speed/speed-short-003` score=65.16: 
- `speed/speed-medium-001` score=65.2: 
- `speed/speed-medium-002` score=58.88: 
- `speed/speed-medium-003` score=59.56: 
- `speed/speed-long-001` score=59.07: 
- `speed/speed-long-002` score=57.87:
