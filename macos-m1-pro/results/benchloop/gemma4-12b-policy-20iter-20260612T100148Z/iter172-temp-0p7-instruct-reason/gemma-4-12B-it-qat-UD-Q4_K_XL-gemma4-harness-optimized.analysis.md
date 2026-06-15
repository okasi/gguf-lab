# Gemma 4 Harness Failure Analysis

- Source: `/Users/okasi/Developer/local-llm-experiments/macos-m1-pro/results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter172-temp-0p7-instruct-reason/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 63.77716666666667
- Quality: 81.11
- Speed: 0
- Reliability: 76.66666666666667
- Failures/partials: 7

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_or_instruction` | 4 |
| `semantic_math` | 3 |

## Recommendations


## Examples

### `format_or_instruction`
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=50: all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-06` score=0: switch expected 0.75, got 3/4; stay expected 0.25, got 1/4
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24
