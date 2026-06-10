# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-07/gemma-4-E2B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-harness-iter07`
- Overall: 68.95285486891386
- Quality: 71.35166666666667
- Speed: 71.3
- Reliability: 61.79775280898876
- Failures/partials: 48

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `coding_semantic` | 7 |
| `semantic_math` | 6 |
| `tool_partial_batch` | 3 |
| `format_cleanup` | 2 |
| `answer_line` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable missing batch-call synthesis.
- Enable fence/reasoning stripping, Python extraction, and content normalization.
- Enable answer-line canonicalization.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 
- `agent/agent-05-refuse-unknown-tool` score=75.0: 
- `agent/agent-07-stocks-compare` score=75.0: 

### `coding_semantic`
- `coding/coding-fibonacci-memo` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-cpse0pxu/task.py", line 39, in <module>
    assert fib(0) == 0
       
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-lrtxfey0/task.py", line 28, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-pqtjf23a/task.py", line 31, in <module>
    @retry(max_attempts=3, del
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-g_ijmg0w/task.py", line 15, in <module>
    assert get_nested_value(da
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-h0vm1_9i/task.py", line 24, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-5bljmcc7/task.py", line 32, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-m62v3t66/task.py", line 29, in <module>
    assert len(result) == 3
  

### `format_cleanup`
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: unterminated string literal (detected at line 1) (line 1)
- `coding/coding-async-to-sync-refactor` score=0.0: SyntaxError: unterminated triple-quoted string literal (detected at line 8) (line 2)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=57.0: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-05` score=86.0: 
- `dataextract/de-06` score=87.0: 
- `dataextract/de-07` score=71.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / location: mismatch / note: mismatch
- `dataextract/de-09` score=70.0: date: mismatch / requester_name: mismatch / room: mismatch
- `dataextract/de-10` score=80.0: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86.0: 

### `format_or_instruction`
- `instructfollow/if-02` score=50.0: word_counts_3_4_3
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-03` score=55.0: saved_money expected yes, got no
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: missing fill_time
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got $5721.03; interest expected 718.96, got $721.03
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=64.6: 
- `speed/speed-short-002` score=70.04: 
- `speed/speed-short-003` score=71.63: 
- `speed/speed-medium-001` score=72.47: 
- `speed/speed-medium-002` score=72.39: 
- `speed/speed-medium-003` score=72.26: 
- `speed/speed-long-001` score=73.19: 
- `speed/speed-long-002` score=72.53:
