# Gemma 4 Harness Failure Analysis

- Source: `macos-m1-pro/results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-015-toolnorm-dedupe-e4-gate/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-allsize-c015-toolnorm-dedupe-e4check-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-allsize-c015-toolnorm-dedupe-e4check-gemma4-harness-optimized`
- Overall: 19.459084269662924
- Quality: 28.23
- Speed: 0
- Reliability: 15.730337078651685
- Failures/partials: 75

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_or_instruction` | 15 |
| `invalid_json` | 15 |
| `semantic_math` | 15 |
| `tool_missing` | 11 |
| `speed_measurement` | 9 |
| `agent_or_tool_semantic` | 5 |
| `format_cleanup` | 3 |
| `coding_semantic` | 2 |

## Recommendations

- Enable JSON extraction/repair and escaped JSON parsing.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Enable fence/reasoning stripping and content normalization.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `toolcall/tc-03` score=0: did not match any acceptable tool strategy
- `toolcall/tc-10` score=50: missing expected direct answer content
- `toolcall/tc-11` score=50: missing expected direct answer content
- `toolcall/tc-12` score=50: missing refusal/explanation language

### `coding_semantic`
- `coding/coding-json-validator` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-wif8gcfq/task.py", line 90, in <module>
    assert any("email" in erro
- `coding/coding-retry-decorator` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-3939wvde/task.py", line 22, in <module>
    @retry(max_attempts=3, del

### `format_cleanup`
- `coding/coding-rate-limiter` score=0: No code found in model response
- `coding/coding-async-to-sync-refactor` score=0: No code found in model response
- `coding/coding-parse-log-entries` score=0: No code found in model response

### `invalid_json`
- `dataextract/de-01` score=0: Invalid JSON: Expecting value: line 1 column 1 (char 0)
- `dataextract/de-02` score=0: Invalid JSON: Expecting value: line 1 column 1 (char 0)
- `dataextract/de-03` score=0: Invalid JSON: Expecting value: line 1 column 1 (char 0)
- `dataextract/de-04` score=0: Invalid JSON: Expecting value: line 1 column 1 (char 0)
- `dataextract/de-05` score=0: Invalid JSON: Expecting value: line 1 column 1 (char 0)
- `dataextract/de-06` score=0: Invalid JSON: Expecting value: line 1 column 1 (char 0)
- `dataextract/de-07` score=0: Invalid JSON: Expecting value: line 1 column 1 (char 0)
- `dataextract/de-08` score=0: Invalid JSON: Expecting value: line 1 column 1 (char 0)

### `format_or_instruction`
- `instructfollow/if-01` score=0: Empty response
- `instructfollow/if-02` score=0: Empty response
- `instructfollow/if-03` score=0: Empty response
- `instructfollow/if-04` score=0: Empty response
- `instructfollow/if-05` score=0: Empty response
- `instructfollow/if-06` score=0: Empty response
- `instructfollow/if-07` score=0: Empty response
- `instructfollow/if-08` score=0: Empty response

### `semantic_math`
- `reasonmath/rm-01` score=0: Empty response
- `reasonmath/rm-02` score=0: Empty response
- `reasonmath/rm-03` score=0: Empty response
- `reasonmath/rm-04` score=0: Empty response
- `reasonmath/rm-05` score=0: Empty response
- `reasonmath/rm-06` score=0: Empty response
- `reasonmath/rm-07` score=0: Empty response
- `reasonmath/rm-08` score=0: Empty response

### `speed_measurement`
- `speed/speed-short-001` score=0: 
- `speed/speed-short-002` score=0: 
- `speed/speed-short-003` score=0: 
- `speed/speed-medium-001` score=0: 
- `speed/speed-medium-002` score=0: 
- `speed/speed-medium-003` score=0: 
- `speed/speed-long-001` score=0: 
- `speed/speed-long-002` score=0: 

### `tool_missing`
- `toolcall/tc-01` score=0: matched 0/1 required tool calls
- `toolcall/tc-02` score=0: matched 0/1 required tool calls
- `toolcall/tc-04` score=0: matched 0/1 required tool calls
- `toolcall/tc-05` score=0: matched 0/1 required tool calls
- `toolcall/tc-06` score=0: matched 0/1 required tool calls
- `toolcall/tc-07` score=0: matched 0/1 required tool calls
- `toolcall/tc-08` score=0: matched 0/1 required tool calls
- `toolcall/tc-09` score=0: matched 0/2 required tool calls
