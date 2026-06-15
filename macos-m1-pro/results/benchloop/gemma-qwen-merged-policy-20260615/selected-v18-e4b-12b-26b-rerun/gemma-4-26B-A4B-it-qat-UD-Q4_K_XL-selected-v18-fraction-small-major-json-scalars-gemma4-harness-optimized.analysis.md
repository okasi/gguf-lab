# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma-qwen-merged-policy-20260615/selected-v18-e4b-12b-26b-rerun/run-json/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-selected-v18-fraction-small-major-json-scalars-gemma4-harness-optimized.run.json`
- Model: `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-selected-v18-fraction-small-major-json-scalars-gemma4-harness-optimized`
- Overall: 73.08875468164796
- Quality: 83.72333333333334
- Speed: 36.89
- Reliability: 78.65168539325843
- Failures/partials: 33

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 6 |
| `semantic_math` | 3 |
| `agent_or_tool_semantic` | 1 |
| `coding_semantic` | 1 |
| `format_cleanup` | 1 |
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Enable fence/reasoning stripping and content normalization.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `format_cleanup`
- `coding/coding-flatten-nested` score=0: SyntaxError: closing parenthesis ')' does not match opening parenthesis '[' (line 18)

### `coding_semantic`
- `coding/coding-parse-log-entries` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-do2u1901/task.py", line 3, in <module>
    assert callable(parse_logs)

### `semantic_extraction`
- `dataextract/de-02` score=94: 
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-05` score=86: 
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-10` score=70: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-13` score=92: 

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=66.7: at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-06` score=0: switch expected 0.75, got 3/4; stay expected 0.25, got 1/4
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24

### `speed_measurement`
- `speed/speed-short-001` score=21.55: 
- `speed/speed-short-002` score=36.59: 
- `speed/speed-short-003` score=38.34: 
- `speed/speed-medium-001` score=37.88: 
- `speed/speed-medium-002` score=38.25: 
- `speed/speed-medium-003` score=39.8: 
- `speed/speed-long-001` score=40.2: 
- `speed/speed-long-002` score=39.65: 

### `tool_missing`
- `toolcall/tc-05` score=0: matched 0/1 required tool calls

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
