# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-forensic3/iteration-03/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 81.34668913857678
- Quality: 85.38666666666666
- Speed: 75.01
- Reliability: 77.52808988764045
- Failures/partials: 34

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `semantic_math` | 6 |
| `agent_or_tool_semantic` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=71: note: mismatch / room: mismatch
- `dataextract/de-05` score=79: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / location: mismatch / note: mismatch / location: mismatch / note: mismatch
- `dataextract/de-09` score=70: date: mismatch / requester_name: mismatch / room: mismatch
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86: 

### `format_or_instruction`
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-07` score=50: tagged_translations
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `semantic_math`
- `reasonmath/rm-02` score=0: expected 0.3125, got 0.25
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-12` score=0: person expected son, got father
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.06; interest expected 718.96, got 721.06
- `reasonmath/rm-15` score=0: count expected 126, got 210

### `speed_measurement`
- `speed/speed-short-001` score=69.04: 
- `speed/speed-short-002` score=74.54: 
- `speed/speed-short-003` score=75.2: 
- `speed/speed-medium-001` score=76.42: 
- `speed/speed-medium-002` score=73.82: 
- `speed/speed-medium-003` score=76.97: 
- `speed/speed-long-001` score=74.56: 
- `speed/speed-long-002` score=77.23:
