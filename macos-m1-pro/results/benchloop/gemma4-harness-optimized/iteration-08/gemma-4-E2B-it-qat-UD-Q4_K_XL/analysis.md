# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-08/gemma-4-E2B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-harness-iter08`
- Overall: 67.76664044943821
- Quality: 70.34
- Speed: 70.96
- Reliability: 59.55056179775281
- Failures/partials: 48

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `format_or_instruction` | 9 |
| `speed_measurement` | 9 |
| `coding_semantic` | 8 |
| `semantic_math` | 6 |
| `tool_partial_batch` | 2 |
| `answer_line` | 1 |
| `format_cleanup` | 1 |
| `numeric_string` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable missing batch-call synthesis.
- Enable fence/reasoning stripping, Python extraction, and content normalization.
- Enable numeric coercion for extraction JSON values.
- Enable answer-line canonicalization.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 
- `agent/agent-05-refuse-unknown-tool` score=75.0: 

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-ytfxi0dg/task.py", line 41, in <module>
    assert parse_csv(sample) =
- `coding/coding-fibonacci-memo` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-485vnez0/task.py", line 39, in <module>
    assert fib(0) == 0
       
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-w217m_m1/task.py", line 27, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-ui6j5ghf/task.py", line 38, in <module>
    @retry(max_attempts=3, del
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-h4_z4du5/task.py", line 6, in <module>
    assert get_nested_value(dat
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-jybalpwf/task.py", line 25, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-8w4m1ic8/task.py", line 30, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-anezqjnm/task.py", line 29, in <module>
    assert len(result) == 3
  

### `format_cleanup`
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: unterminated string literal (detected at line 3) (line 3)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=0.0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-05` score=86.0: 
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-08` score=90.0: 
- `dataextract/de-09` score=50.0: date: mismatch / needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / room: mismatch
- `dataextract/de-10` score=70.0: cuisine_type: mismatch / neighborhood: expected null / visit_duration: expected string

### `numeric_string`
- `dataextract/de-11` score=71.0: num_rooms: expected number / total_attendees: expected null

### `format_or_instruction`
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-05` score=66.7: at_least_one_under_1kg
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-11` score=0.0: missing day
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.03; interest expected 718.96, got 721.03
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=64.26: 
- `speed/speed-short-002` score=69.64: 
- `speed/speed-short-003` score=70.08: 
- `speed/speed-medium-001` score=72.16: 
- `speed/speed-medium-002` score=72.09: 
- `speed/speed-medium-003` score=72.73: 
- `speed/speed-long-001` score=72.56: 
- `speed/speed-long-002` score=72.35:
