# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-13/gemma-4-E4B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-harness-iter13`
- Overall: 72.72267696629214
- Quality: 76.615
- Speed: 61.63
- Reliability: 73.03370786516854
- Failures/partials: 39

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `coding_semantic` | 6 |
| `format_or_instruction` | 6 |
| `semantic_math` | 5 |
| `format_cleanup` | 2 |
| `answer_line` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable fence/reasoning stripping, Python extraction, and content normalization.
- Enable answer-line canonicalization.

## Examples

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-hkz_ys7j/task.py", line 44, in <module>
    assert parse_csv(sample) =
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-s_7el1dm/task.py", line 32, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-ad9za1wt/task.py", line 22, in <module>
    @retry(max_attempts=3, del
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-9bbxfpng/task.py", line 21, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-z66ox_7e/task.py", line 35, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-dyk8v46q/task.py", line 31, in <module>
    assert len(result) == 3
  

### `format_cleanup`
- `coding/coding-flatten-nested` score=0.0: SyntaxError: unterminated string literal (detected at line 7) (line 7)
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: unterminated string literal (detected at line 8) (line 8)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=86.0: 
- `dataextract/de-05` score=93.0: 
- `dataextract/de-06` score=87.0: 
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=90.0: 
- `dataextract/de-10` score=70.0: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=93.0: 

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
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.06; interest expected 718.96, got 721.06
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=54.47: 
- `speed/speed-short-002` score=61.3: 
- `speed/speed-short-003` score=60.49: 
- `speed/speed-medium-001` score=62.91: 
- `speed/speed-medium-002` score=63.05: 
- `speed/speed-medium-003` score=62.96: 
- `speed/speed-long-001` score=63.25: 
- `speed/speed-long-002` score=63.06:
