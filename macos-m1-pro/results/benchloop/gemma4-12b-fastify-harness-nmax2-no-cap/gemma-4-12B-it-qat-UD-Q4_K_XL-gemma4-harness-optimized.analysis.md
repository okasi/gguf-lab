# Gemma 4 Harness Failure Analysis

- Source: `/Users/okasi/Developer/local-llm-experiments/macos-m1-pro/results/benchloop/gemma4-12b-fastify-harness-nmax2-no-cap/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 81.0239157303371
- Quality: 89.79
- Speed: 52.86
- Reliability: 84.26966292134831
- Failures/partials: 29

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 6 |
| `semantic_math` | 3 |
| `agent_or_tool_semantic` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-05` score=93: 
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=90: 
- `dataextract/de-10` score=70: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=93: 

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-14` score=50: all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24

### `speed_measurement`
- `speed/speed-short-001` score=42.34: 
- `speed/speed-short-002` score=51.94: 
- `speed/speed-short-003` score=54.2: 
- `speed/speed-medium-001` score=53.66: 
- `speed/speed-medium-002` score=53.41: 
- `speed/speed-medium-003` score=55.5: 
- `speed/speed-long-001` score=55.51: 
- `speed/speed-long-002` score=54.67:
