# Gemma 4 Harness Failure Analysis

- Source: `/Users/okasi/Developer/local-llm-experiments/macos-m1-pro/results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter179-temp-0p8-top-k-80-instruct/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 60.666666666666664
- Quality: 80
- Speed: 0
- Reliability: 66.66666666666666
- Failures/partials: 5

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_or_instruction` | 5 |

## Recommendations


## Examples

### `format_or_instruction`
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=50: all_caps_rain_bang
