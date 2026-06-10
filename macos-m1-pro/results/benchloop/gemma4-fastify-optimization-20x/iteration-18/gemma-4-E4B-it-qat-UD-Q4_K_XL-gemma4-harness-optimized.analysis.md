# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-20x/iteration-18/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 74.89473689138578
- Quality: 85.60166666666667
- Speed: 39.35
- Reliability: 79.7752808988764
- Failures/partials: 31

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `semantic_math` | 3 |
| `agent_or_tool_semantic` | 2 |
| `answer_line` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `toolcall/tc-03` score=0: did not match any acceptable tool strategy

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=86: 
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=80: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=86: 
- `dataextract/de-13` score=0: top-level shape mismatch: expected object, received array / expected object

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.35; interest expected 718.96, got 721.35
- `reasonmath/rm-15` score=0: missing count

### `speed_measurement`
- `speed/speed-short-001` score=30.21: 
- `speed/speed-short-002` score=42.51: 
- `speed/speed-short-003` score=37.48: 
- `speed/speed-medium-001` score=40.89: 
- `speed/speed-medium-002` score=42.23: 
- `speed/speed-medium-003` score=41.28: 
- `speed/speed-long-001` score=40.64: 
- `speed/speed-long-002` score=39.8:
