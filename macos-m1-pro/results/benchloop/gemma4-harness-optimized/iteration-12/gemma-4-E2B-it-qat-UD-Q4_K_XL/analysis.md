# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-12/gemma-4-E2B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-harness-iter12`
- Overall: 67.85705711610487
- Quality: 70.47166666666666
- Speed: 71.05
- Reliability: 59.55056179775281
- Failures/partials: 47

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_math` | 8 |
| `coding_semantic` | 7 |
| `answer_line` | 2 |
| `tool_partial_batch` | 2 |
| `format_cleanup` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable missing batch-call synthesis.
- Enable answer-line canonicalization.
- Enable fence/reasoning stripping, Python extraction, and content normalization.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 
- `agent/agent-05-refuse-unknown-tool` score=75.0: 

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-jgx0_ma5/task.py", line 34, in <module>
    assert parse_csv(sample) =
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-2m_5o00b/task.py", line 29, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-vnvhutms/task.py", line 31, in <module>
    @retry(max_attempts=3, del
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-gqa125s9/task.py", line 19, in <module>
    assert get_nested_value(da
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-6zuf0hh_/task.py", line 21, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-qk_d913c/task.py", line 28, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-cjyn_udm/task.py", line 33, in <module>
    assert len(result) == 3
  

### `format_cleanup`
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: unterminated string literal (detected at line 8) (line 8)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=71.0: note: mismatch / room: mismatch
- `dataextract/de-05` score=71.0: bluetooth_version: mismatch / charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=71.0: location: mismatch / note: mismatch / role: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=70.0: date: mismatch / requester_name: mismatch / room: mismatch
- `dataextract/de-10` score=70.0: cuisine_type: mismatch / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=79.0: complaint: mismatch / product_name: mismatch / rating: mismatch

### `format_or_instruction`
- `instructfollow/if-02` score=50.0: word_counts_3_4_3
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50.0: city_constraints

### `semantic_math`
- `reasonmath/rm-03` score=0.0: missing new_original_price; missing saved_money
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-11` score=0.0: missing day
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.08; interest expected 718.96, got 721.08
- `reasonmath/rm-14` score=0.0: missing temp_f; missing time_min
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay
- `reasonmath/rm-07` score=0.0: missing ANSWER line; expected 48.0, got None

### `speed_measurement`
- `speed/speed-short-001` score=63.77: 
- `speed/speed-short-002` score=70.18: 
- `speed/speed-short-003` score=70.05: 
- `speed/speed-medium-001` score=72.53: 
- `speed/speed-medium-002` score=72.5: 
- `speed/speed-medium-003` score=72.46: 
- `speed/speed-long-001` score=72.58: 
- `speed/speed-long-002` score=72.39:
