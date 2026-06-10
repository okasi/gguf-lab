# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-optimization-extra5/iteration-04/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 77.67200468164795
- Quality: 84.15833333333333
- Speed: 58.61
- Reliability: 78.65168539325843
- Failures/partials: 34

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 6 |
| `semantic_math` | 4 |
| `agent_or_tool_semantic` | 2 |
| `tool_missing` | 2 |
| `answer_line` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable tool-call synthesis for obvious tool-use prompts.
- Enable answer-line canonicalization.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `agent/agent-03-string-roundtrip` score=50: 

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=86: 
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=90: 
- `dataextract/de-10` score=80: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=79: complaint: mismatch / product_name: mismatch / rating: mismatch

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.20; interest expected 718.96, got 721.20

### `answer_line`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=53.96: 
- `speed/speed-short-002` score=60: 
- `speed/speed-short-003` score=57.1: 
- `speed/speed-medium-001` score=59.33: 
- `speed/speed-medium-002` score=59.49: 
- `speed/speed-medium-003` score=59.27: 
- `speed/speed-long-001` score=60.34: 
- `speed/speed-long-002` score=59.01: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools
