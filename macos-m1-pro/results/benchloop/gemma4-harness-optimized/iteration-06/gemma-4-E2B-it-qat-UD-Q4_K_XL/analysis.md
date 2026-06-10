# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-06/gemma-4-E2B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-harness-iter06`
- Overall: 72.56128370786517
- Quality: 75.975
- Speed: 71.01
- Reliability: 66.29213483146067
- Failures/partials: 42

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `coding_semantic` | 6 |
| `semantic_math` | 6 |
| `answer_line` | 2 |
| `tool_partial_batch` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable missing batch-call synthesis.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 

### `coding_semantic`
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-yntvjwdq/task.py", line 27, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-0991fimx/task.py", line 33, in <module>
    @retry(max_attempts=3, del
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-0ozq6uf4/task.py", line 11, in <module>
    assert get_nested_value(da
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-eq6opn5k/task.py", line 16, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-nzmnj8zj/task.py", line 31, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-6s66tymq/task.py", line 34, in <module>
    result = parse_logs(logs)


### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=57.0: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-05` score=86.0: 
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80.0: date: mismatch / room: mismatch
- `dataextract/de-10` score=80.0: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86.0: 

### `format_or_instruction`
- `instructfollow/if-02` score=50.0: word_counts_3_4_3
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50.0: city_constraints

### `semantic_math`
- `reasonmath/rm-03` score=55.0: saved_money expected yes, got no
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got $5721.45; interest expected 718.96, got $721.45
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay
- `reasonmath/rm-07` score=0.0: missing ANSWER line; expected 48.0, got None

### `speed_measurement`
- `speed/speed-short-001` score=64.03: 
- `speed/speed-short-002` score=70.78: 
- `speed/speed-short-003` score=69.72: 
- `speed/speed-medium-001` score=71.71: 
- `speed/speed-medium-002` score=72.65: 
- `speed/speed-medium-003` score=72.06: 
- `speed/speed-long-001` score=72.44: 
- `speed/speed-long-002` score=72.78:
