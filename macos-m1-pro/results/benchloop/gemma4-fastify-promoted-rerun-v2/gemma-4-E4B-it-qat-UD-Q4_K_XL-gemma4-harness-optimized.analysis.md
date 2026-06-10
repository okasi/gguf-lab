# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-promoted-rerun-v2/run-json/gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 70.29799812734083
- Quality: 75.85666666666667
- Speed: 57.21
- Reliability: 68.53932584269663
- Failures/partials: 41

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 10 |
| `speed_measurement` | 9 |
| `coding_semantic` | 7 |
| `format_or_instruction` | 7 |
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
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-4sj6l2og/task.py", line 34, in <module>
    assert parse_csv(sample) =
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-i30yqh03/task.py", line 30, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-_m_hl3y4/task.py", line 31, in <module>
    @retry(max_attempts=3, del
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-njflrkxr/task.py", line 11, in <module>
    assert get_nested_value(da
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-9dwxxukl/task.py", line 19, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-4fxc4h_2/task.py", line 26, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-ikmuutw9/task.py", line 31, in <module>
    assert len(result) == 3
  

### `format_cleanup`
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: closing parenthesis ']' does not match opening parenthesis '(' (line 6)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=71.0: meeting_name: mismatch / room: mismatch
- `dataextract/de-05` score=86.0: 
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80.0: requester_name: mismatch / room: mismatch
- `dataextract/de-10` score=70.0: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=93.0: 

### `format_or_instruction`
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-07` score=50.0: tagged_translations
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.50; interest expected 718.96, got 721.50
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=52.97: 
- `speed/speed-short-002` score=58.78: 
- `speed/speed-short-003` score=58.71: 
- `speed/speed-medium-001` score=58.42: 
- `speed/speed-medium-002` score=57.49: 
- `speed/speed-medium-003` score=54.51: 
- `speed/speed-long-001` score=56.12: 
- `speed/speed-long-002` score=57.05:
