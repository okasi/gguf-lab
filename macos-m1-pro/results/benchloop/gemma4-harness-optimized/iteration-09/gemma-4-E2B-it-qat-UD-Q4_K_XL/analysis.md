# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-09/gemma-4-E2B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-harness-iter09`
- Overall: 70.28831928838952
- Quality: 72.79833333333333
- Speed: 71.19
- Reliability: 64.04494382022472
- Failures/partials: 46

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 12 |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `coding_semantic` | 8 |
| `semantic_math` | 5 |
| `answer_line` | 1 |
| `format_cleanup` | 1 |
| `tool_partial_batch` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable missing batch-call synthesis.
- Enable fence/reasoning stripping, Python extraction, and content normalization.
- Enable answer-line canonicalization.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=50.0: 

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-pnjz0g48/task.py", line 50, in <module>
    assert parse_csv(sample) =
- `coding/coding-fibonacci-memo` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-0gkr01b4/task.py", line 32, in <module>
    assert fib(10) == 55
     
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-xwyf9bt4/task.py", line 31, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-95_acse6/task.py", line 23, in <module>
    @retry(max_attempts=3, del
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-a2an8pwd/task.py", line 17, in <module>
    assert get_nested_value(da
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-8psniszq/task.py", line 26, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-nudub0e1/task.py", line 29, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-hf0piarc/task.py", line 32, in <module>
    assert len(result) == 3
  

### `format_cleanup`
- `coding/coding-async-to-sync-refactor` score=0.0: SyntaxError: invalid syntax (line 1)

### `semantic_extraction`
- `dataextract/de-01` score=90.0: 
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=57.0: meeting_name: mismatch / note: mismatch / room: mismatch
- `dataextract/de-05` score=79.0: extra top-level fields: competitor_2_price / charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=87.0: 
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=50.0: date: mismatch / needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / requester_name: mismatch
- `dataextract/de-10` score=80.0: neighborhood: expected null / visit_duration: expected string

### `format_or_instruction`
- `instructfollow/if-02` score=50.0: word_counts_3_4_3
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-08` score=0.0: missing fill_time
- `reasonmath/rm-12` score=0.0: missing person
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got $5721.02; interest expected 718.96, got $721.02
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=63.82: 
- `speed/speed-short-002` score=70.55: 
- `speed/speed-short-003` score=71.93: 
- `speed/speed-medium-001` score=72.18: 
- `speed/speed-medium-002` score=72.35: 
- `speed/speed-medium-003` score=72.27: 
- `speed/speed-long-001` score=72.49: 
- `speed/speed-long-002` score=72.57:
