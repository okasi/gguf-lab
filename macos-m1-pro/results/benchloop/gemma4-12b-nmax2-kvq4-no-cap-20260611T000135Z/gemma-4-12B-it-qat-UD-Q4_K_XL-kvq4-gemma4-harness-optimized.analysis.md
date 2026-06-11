# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-12b-nmax2-kvq4-no-cap-20260611T000135Z/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL-kvq4-gemma4-harness-optimized.run.json`
- Model: `gemma-4-12B-it-qat-UD-Q4_K_XL-kvq4-gemma4-harness-optimized`
- Overall: 79.35206460674156
- Quality: 89.34499999999998
- Speed: 44.32
- Reliability: 85.39325842696628
- Failures/partials: 28

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 5 |
| `semantic_math` | 3 |
| `agent_or_tool_semantic` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.

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
- `dataextract/de-10` score=60: cuisine_type: expected string / neighborhood: expected null / street_address: expected null / visit_duration: expected string
- `dataextract/de-12` score=86: 

### `format_or_instruction`
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24

### `speed_measurement`
- `speed/speed-short-001` score=36.61: 
- `speed/speed-short-002` score=41.83: 
- `speed/speed-short-003` score=47.21: 
- `speed/speed-medium-001` score=45.73: 
- `speed/speed-medium-002` score=46.2: 
- `speed/speed-medium-003` score=46.4: 
- `speed/speed-long-001` score=45.37: 
- `speed/speed-long-002` score=44.54:
