# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-17/gemma-4-E2B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-harness-iter17`
- Overall: 68.5452893258427
- Quality: 71.325
- Speed: 70.74
- Reliability: 60.67415730337079
- Failures/partials: 47

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 11 |
| `speed_measurement` | 9 |
| `coding_semantic` | 8 |
| `format_or_instruction` | 8 |
| `semantic_math` | 6 |
| `answer_line` | 2 |
| `format_cleanup` | 1 |
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable answer-line canonicalization.
- Enable missing batch-call synthesis.
- Enable fence/reasoning stripping, Python extraction, and content normalization.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-wp58xdyl/task.py", line 36, in <module>
    assert parse_csv(sample) =
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-vlhuf93p/task.py", line 26, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-0atsrna7/task.py", line 35, in <module>
    @retry(max_attempts=3, del
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-5kzacdt6/task.py", line 17, in <module>
    assert get_nested_value(da
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-pijztkhc/task.py", line 34, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-dd3c9l0q/task.py", line 30, in <module>
    rl = RateLimiter(3, 10.0)

- `coding/coding-async-to-sync-refactor` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-19f40j8g/task.py", line 27, in <module>
    assert process_pipeline_sy
- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-zprkydu6/task.py", line 30, in <module>
    assert len(result) == 3
  

### `format_cleanup`
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: unterminated string literal (detected at line 7) (line 7)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=71.0: note: mismatch / room: mismatch
- `dataextract/de-05` score=71.0: bluetooth_version: mismatch / charging_type: mismatch / product_name: mismatch / recommendation: mismatch
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=71.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / location: mismatch / note: mismatch
- `dataextract/de-09` score=80.0: date: mismatch / requester_name: mismatch
- `dataextract/de-10` score=80.0: neighborhood: expected null / visit_duration: expected string
- `dataextract/de-11` score=86.0: 

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
- `reasonmath/rm-12` score=0.0: person expected son, got speaker's son
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.45; interest expected 718.96, got 721.45
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay
- `reasonmath/rm-07` score=0.0: missing ANSWER line; expected 48.0, got 7.0

### `speed_measurement`
- `speed/speed-short-001` score=64.58: 
- `speed/speed-short-002` score=67.95: 
- `speed/speed-short-003` score=69.56: 
- `speed/speed-medium-001` score=72.19: 
- `speed/speed-medium-002` score=72.4: 
- `speed/speed-medium-003` score=72.21: 
- `speed/speed-long-001` score=72.72: 
- `speed/speed-long-002` score=72.64: 

### `tool_missing`
- `toolcall/tc-05` score=25.0: matched 0/1 required tool calls; answered directly instead of using tools
