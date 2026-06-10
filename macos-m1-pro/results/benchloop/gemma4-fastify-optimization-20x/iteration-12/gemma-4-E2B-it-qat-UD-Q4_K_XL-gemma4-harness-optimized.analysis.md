# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-20x/iteration-12/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 73.9735936329588
- Quality: 82.37666666666667
- Speed: 52.04
- Reliability: 73.03370786516854
- Failures/partials: 37

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_math` | 6 |
| `agent_or_tool_semantic` | 2 |
| `answer_line` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `agent/agent-05-refuse-unknown-tool` score=75: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=86: 
- `dataextract/de-05` score=79: extra top-level fields: competitor_2_price / charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=80: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=50: date: mismatch / needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / room: mismatch
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86: 

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-08` score=0: missing fill_time
- `reasonmath/rm-09` score=0: expected 35.0, got None
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5721.13; interest expected 718.96, got $721.13
- `reasonmath/rm-14` score=0: missing temp_f; missing time_min
- `reasonmath/rm-15` score=0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=43.96: 
- `speed/speed-short-002` score=49.97: 
- `speed/speed-short-003` score=51.97: 
- `speed/speed-medium-001` score=54.41: 
- `speed/speed-medium-002` score=51.59: 
- `speed/speed-medium-003` score=54.1: 
- `speed/speed-long-001` score=54.11: 
- `speed/speed-long-002` score=54.11:
