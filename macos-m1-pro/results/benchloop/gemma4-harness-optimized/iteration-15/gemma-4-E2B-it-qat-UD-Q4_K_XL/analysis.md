# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-15/gemma-4-E2B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-harness-iter15`
- Overall: 69.94556928838952
- Quality: 72.35333333333334
- Speed: 70.7
- Reliability: 64.04494382022472
- Failures/partials: 43

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `coding_semantic` | 8 |
| `format_or_instruction` | 7 |
| `semantic_math` | 6 |
| `answer_line` | 2 |
| `format_cleanup` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable fence/reasoning stripping, Python extraction, and content normalization.

## Examples

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-x1o5ld6n/task.py", line 29, in <module>
    assert parse_csv(sample) =
- `coding/coding-fibonacci-memo` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-zq32x8xg/task.py", line 36, in <module>
    assert fib(0) == 0
       
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-wvbnjfyd/task.py", line 28, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-9x4ubrkg/task.py", line 37, in <module>
    @retry(max_attempts=3, del
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-zwmuo5c6/task.py", line 18, in <module>
    assert get_nested_value(da
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-rflfqppo/task.py", line 16, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-2qzgtjtq/task.py", line 30, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-6h07fkz9/task.py", line 39, in <module>
    assert len(result) == 3
  

### `format_cleanup`
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: closing parenthesis ')' does not match opening parenthesis '[' (line 3)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=71.0: note: mismatch / room: mismatch
- `dataextract/de-05` score=86.0: 
- `dataextract/de-06` score=73.0: medication_dose: mismatch / medication_duration: expected string / medication_name: mismatch / referral: expected null
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=50.0: date: mismatch / needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / requester_name: mismatch
- `dataextract/de-10` score=80.0: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=79.0: complaint: mismatch / product_name: mismatch / rating: mismatch

### `format_or_instruction`
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
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.45; interest expected 718.96, got 721.45
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay
- `reasonmath/rm-07` score=0.0: missing ANSWER line; expected 48.0, got 360.0

### `speed_measurement`
- `speed/speed-short-001` score=62.53: 
- `speed/speed-short-002` score=70.06: 
- `speed/speed-short-003` score=69.28: 
- `speed/speed-medium-001` score=72.0: 
- `speed/speed-medium-002` score=71.9: 
- `speed/speed-medium-003` score=72.15: 
- `speed/speed-long-001` score=72.58: 
- `speed/speed-long-002` score=73.23:
