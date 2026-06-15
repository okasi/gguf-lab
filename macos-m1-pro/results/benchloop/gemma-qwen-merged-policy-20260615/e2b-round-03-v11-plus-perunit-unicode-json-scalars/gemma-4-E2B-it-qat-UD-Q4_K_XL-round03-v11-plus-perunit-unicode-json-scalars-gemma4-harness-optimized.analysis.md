# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma-qwen-merged-policy-20260615/e2b-round-03-v11-plus-perunit-unicode-json-scalars/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-round03-v11-plus-perunit-unicode-json-scalars-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-round03-v11-plus-perunit-unicode-json-scalars-gemma4-harness-optimized`
- Overall: 77.16785580524345
- Quality: 86.24333333333334
- Speed: 51.76
- Reliability: 77.52808988764045
- Failures/partials: 34

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `semantic_math` | 2 |
| `agent_or_tool_semantic` | 1 |
| `numeric_string` | 1 |
| `reasonmath_format` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect declared schemas and only coerce values when the schema permits it.
- Inspect reason/math formatting and instruction-following without rewriting expected answers.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `semantic_extraction`
- `dataextract/de-01` score=90: 
- `dataextract/de-02` score=88: 
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=71: room: mismatch / time: expected string
- `dataextract/de-05` score=71: bluetooth_version: expected string / charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=80: medication_dose: expected string / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=70: date: mismatch / requester_name: mismatch / room: mismatch

### `numeric_string`
- `dataextract/de-12` score=71: battery_life_hours: expected number / complaint: mismatch / product_name: mismatch / rating: expected number

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.09; interest expected 718.96, got 721.09

### `speed_measurement`
- `speed/speed-short-001` score=41.91: 
- `speed/speed-short-002` score=58.78: 
- `speed/speed-short-003` score=49.32: 
- `speed/speed-medium-001` score=51.83: 
- `speed/speed-medium-002` score=52.78: 
- `speed/speed-medium-003` score=54.48: 
- `speed/speed-long-001` score=52.96: 
- `speed/speed-long-002` score=52.07: 

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
