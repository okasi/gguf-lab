# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-promoted-rerun-v2/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 69.46264044943821
- Quality: 72.98
- Speed: 72.18
- Reliability: 59.55056179775281
- Failures/partials: 47

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_or_instruction` | 11 |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `coding_semantic` | 8 |
| `semantic_math` | 6 |
| `tool_partial_batch` | 2 |
| `answer_line` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable missing batch-call synthesis.
- Enable answer-line canonicalization.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 
- `agent/agent-05-refuse-unknown-tool` score=75.0: 

### `coding_semantic`
- `coding/coding-fibonacci-memo` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-m24dlfbd/task.py", line 36, in <module>
    assert fib(10) == 55
     
- `coding/coding-bug-fix-off-by-one` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-_64ocf4i/task.py", line 6, in <module>
    assert binary_search(arr, 1
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-qdkkblqe/task.py", line 30, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-eae45csb/task.py", line 36, in <module>
    @retry(max_attempts=3, del
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-ohjin89e/task.py", line 20, in <module>
    assert get_nested_value(da
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-yuxyq2d1/task.py", line 27, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-vvvl98i0/task.py", line 31, in <module>
    rl = RateLimiter(3, 10.0)

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-aked822f/task.py", line 31, in <module>
    assert len(result) == 3
  

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=71.0: note: mismatch / room: mismatch
- `dataextract/de-05` score=86.0: 
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80.0: date: mismatch / room: mismatch
- `dataextract/de-10` score=80.0: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=79.0: complaint: mismatch / product_name: mismatch / rating: mismatch

### `format_or_instruction`
- `instructfollow/if-01` score=50.0: period_and_word_count
- `instructfollow/if-02` score=50.0: word_counts_3_4_3
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-05` score=66.7: at_least_one_under_1kg
- `instructfollow/if-07` score=50.0: tagged_translations
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars

### `semantic_math`
- `reasonmath/rm-03` score=55.0: missing saved_money
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: missing fill_time
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got $5721.09; interest expected 718.96, got $721.09
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=66.81: 
- `speed/speed-short-002` score=72.79: 
- `speed/speed-short-003` score=66.35: 
- `speed/speed-medium-001` score=75.32: 
- `speed/speed-medium-002` score=73.09: 
- `speed/speed-medium-003` score=76.15: 
- `speed/speed-long-001` score=73.38: 
- `speed/speed-long-002` score=73.23:
