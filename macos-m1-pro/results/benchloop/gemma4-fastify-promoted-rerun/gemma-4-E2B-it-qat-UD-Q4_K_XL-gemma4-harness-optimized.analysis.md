# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-promoted-rerun/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 67.12132490636704
- Quality: 67.24833333333333
- Speed: 77.64
- Reliability: 58.42696629213483
- Failures/partials: 48

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `speed_measurement` | 9 |
| `format_cleanup` | 8 |
| `format_or_instruction` | 8 |
| `semantic_math` | 6 |
| `coding_semantic` | 3 |
| `tool_partial_batch` | 2 |
| `answer_line` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable fence/reasoning stripping, Python extraction, and content normalization.
- Enable missing batch-call synthesis.
- Enable answer-line canonicalization.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 
- `agent/agent-07-stocks-compare` score=50.0: 

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-65q3_j1o/task.py", line 31, in <module>
    assert parse_csv(sample) =
- `coding/coding-fibonacci-memo` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-3ghbk4bz/task.py", line 41, in <module>
    assert fib(0) == 0
       
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-rdgup8hp/task.py", line 23, in <module>
    cache.put("a", 1)
    ^^^^

### `format_cleanup`
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: expected an indented block after 'elif' statement on line 7 (line 7)
- `coding/coding-json-validator` score=0.0: SyntaxError: unterminated string literal (detected at line 22) (line 22)
- `coding/coding-retry-decorator` score=0.0: SyntaxError: expected an indented block after 'if' statement on line 25 (line 25)
- `coding/coding-deduplicate-preserve-order` score=0.0: SyntaxError: unterminated string literal (detected at line 31) (line 31)
- `coding/coding-add-error-handling` score=0.0: SyntaxError: expected an indented block after 'except' statement on line 19 (line 20)
- `coding/coding-rate-limiter` score=0.0: SyntaxError: unterminated triple-quoted string literal (detected at line 26) (line 23)
- `coding/coding-async-to-sync-refactor` score=0.0: SyntaxError: invalid syntax (line 21)
- `coding/coding-parse-log-entries` score=0.0: SyntaxError: unterminated string literal (detected at line 22) (line 22)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=71.0: meeting_name: mismatch / room: mismatch
- `dataextract/de-05` score=79.0: charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80.0: date: mismatch / room: mismatch
- `dataextract/de-10` score=70.0: cuisine_type: mismatch / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86.0: 

### `format_or_instruction`
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-04` score=50.0: reverse_alpha_order
- `instructfollow/if-05` score=66.7: at_least_one_under_1kg
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50.0: city_constraints

### `semantic_math`
- `reasonmath/rm-01` score=0.0: expected 35.98, got 33.6
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-05` score=0.0: missing fit; missing max_meetings
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got $5721.42; interest expected 718.96, got $721.42
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=70.18: 
- `speed/speed-short-002` score=76.84: 
- `speed/speed-short-003` score=76.22: 
- `speed/speed-medium-001` score=79.24: 
- `speed/speed-medium-002` score=79.23: 
- `speed/speed-medium-003` score=79.27: 
- `speed/speed-long-001` score=79.43: 
- `speed/speed-long-002` score=79.28:
