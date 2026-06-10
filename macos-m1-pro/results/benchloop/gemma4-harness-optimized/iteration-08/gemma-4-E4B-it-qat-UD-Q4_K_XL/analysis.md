# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-08/gemma-4-E4B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-harness-iter08`
- Overall: 71.37173033707866
- Quality: 75.72
- Speed: 61.55
- Reliability: 69.66292134831461
- Failures/partials: 43

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `coding_semantic` | 7 |
| `format_or_instruction` | 6 |
| `semantic_math` | 5 |
| `tool_partial_batch` | 4 |
| `answer_line` | 1 |
| `tool_missing` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable missing batch-call synthesis.
- Enable answer-line canonicalization.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `tool_partial_batch`
- `agent/agent-01-weather-math` score=75.0: 
- `agent/agent-02-stock-portfolio` score=75.0: 
- `agent/agent-03-string-roundtrip` score=75.0: 
- `agent/agent-08-chained-tools` score=75.0: 

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-pg76m1my/task.py", line 46, in <module>
    assert parse_csv(sample) =
- `coding/coding-bug-fix-off-by-one` score=25.0: Timed out after 10s
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-wrbf5gri/task.py", line 31, in <module>
    assert validate_user({"nam
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-tviyvsoo/task.py", line 12, in <module>
    assert get_nested_value(da
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-2z8vwncs/task.py", line 20, in <module>
    cache = LRUCache(2)
      
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-phs6fn5v/task.py", line 38, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-fc8m67fh/task.py", line 29, in <module>
    assert len(result) == 3
  

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=71.0: meeting_name: mismatch / room: mismatch
- `dataextract/de-05` score=86.0: 
- `dataextract/de-06` score=87.0: 
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80.0: requester_name: mismatch / room: mismatch
- `dataextract/de-10` score=70.0: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=86.0: 

### `format_or_instruction`
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50.0: city_constraints

### `semantic_math`
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5716.26; interest expected 718.96, got 716.26
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=54.72: 
- `speed/speed-short-002` score=60.66: 
- `speed/speed-short-003` score=60.09: 
- `speed/speed-medium-001` score=63.07: 
- `speed/speed-medium-002` score=63.0: 
- `speed/speed-medium-003` score=63.28: 
- `speed/speed-long-001` score=63.08: 
- `speed/speed-long-002` score=63.09: 

### `tool_missing`
- `toolcall/tc-05` score=25.0: matched 0/1 required tool calls; answered directly instead of using tools
