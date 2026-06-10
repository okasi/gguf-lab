# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-16/gemma-4-E2B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-harness-iter16`
- Overall: 68.00789044943821
- Quality: 70.775
- Speed: 70.97
- Reliability: 59.55056179775281
- Failures/partials: 47

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `coding_semantic` | 9 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 8 |
| `semantic_math` | 6 |
| `tool_partial_batch` | 2 |
| `answer_line` | 1 |
| `format_cleanup` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable missing batch-call synthesis.
- Enable fence/reasoning stripping, Python extraction, and content normalization.
- Enable answer-line canonicalization.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 
- `toolcall/tc-15` score=50.0: matched 1/2 required tool calls

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-7nmvbrl7/task.py", line 36, in <module>
    assert parse_csv(sample) =
- `coding/coding-fibonacci-memo` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-95188eos/task.py", line 38, in <module>
    assert fib(0) == 0
       
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-gzlp4nya/task.py", line 31, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-aqur1ev5/task.py", line 37, in <module>
    @retry(max_attempts=3, del
- `coding/coding-deduplicate-preserve-order` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-r9owp0ij/task.py", line 21, in <module>
    assert dedupe([1, 2, 3, 2,
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-ndfqwwq5/task.py", line 16, in <module>
    assert get_nested_value(da
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-c6q23a1u/task.py", line 3, in <module>
    cache = LRUCache(2)
       
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-hz9urrup/task.py", line 32, in <module>
    assert rl.allow() == True


### `format_cleanup`
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: expected an indented block after function definition on line 1 (line 1)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=57.0: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-05` score=79.0: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-08` score=90.0: 
- `dataextract/de-09` score=80.0: date: mismatch / room: mismatch
- `dataextract/de-10` score=70.0: cuisine_type: mismatch / neighborhood: expected null / visit_duration: expected string

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
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-11` score=0.0: missing day
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.49; interest expected 718.96, got 721.49
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=64.45: 
- `speed/speed-short-002` score=69.93: 
- `speed/speed-short-003` score=69.47: 
- `speed/speed-medium-001` score=72.11: 
- `speed/speed-medium-002` score=72.42: 
- `speed/speed-medium-003` score=72.51: 
- `speed/speed-long-001` score=72.6: 
- `speed/speed-long-002` score=72.63:
