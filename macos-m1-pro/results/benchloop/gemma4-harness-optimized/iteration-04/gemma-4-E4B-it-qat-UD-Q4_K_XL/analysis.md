# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-04/gemma-4-E4B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-harness-iter04`
- Overall: 72.93227808988765
- Quality: 77.605
- Speed: 61.36
- Reliability: 71.91011235955057
- Failures/partials: 40

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `coding_semantic` | 6 |
| `semantic_math` | 5 |
| `answer_line` | 1 |
| `format_cleanup` | 1 |
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable missing batch-call synthesis.
- Enable fence/reasoning stripping, Python extraction, and content normalization.
- Enable answer-line canonicalization.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-3qz906t2/task.py", line 47, in <module>
    assert parse_csv(sample) =
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-6r25bufx/task.py", line 31, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-mktz01h_/task.py", line 29, in <module>
    @retry(max_attempts=3, del
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-rs68sk8k/task.py", line 28, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-1_84ghtd/task.py", line 33, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-n_m7jto_/task.py", line 25, in <module>
    result = parse_logs(logs)


### `format_cleanup`
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: invalid syntax (line 1)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=86.0: 
- `dataextract/de-05` score=86.0: 
- `dataextract/de-06` score=87.0: 
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-10` score=80.0: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=86.0: 
- `dataextract/de-13` score=92.0: 

### `format_or_instruction`
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-15` score=50.0: city_constraints

### `semantic_math`
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.08; interest expected 718.96, got 721.08
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=53.3: 
- `speed/speed-short-002` score=61.17: 
- `speed/speed-short-003` score=60.17: 
- `speed/speed-medium-001` score=62.93: 
- `speed/speed-medium-002` score=62.62: 
- `speed/speed-medium-003` score=62.85: 
- `speed/speed-long-001` score=63.08: 
- `speed/speed-long-002` score=63.05: 

### `tool_missing`
- `toolcall/tc-05` score=25.0: matched 0/1 required tool calls; answered directly instead of using tools
