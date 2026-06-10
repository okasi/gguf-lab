# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-14/gemma-4-E4B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-harness-iter14`
- Overall: 70.987015917603
- Quality: 76.07833333333333
- Speed: 61.45
- Reliability: 67.41573033707866
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
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable missing batch-call synthesis.
- Enable answer-line canonicalization.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-lp2g3okb/task.py", line 37, in <module>
    assert parse_csv(sample) =
- `coding/coding-bug-fix-off-by-one` score=25.0: Timed out after 10s
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-u4hgm5se/task.py", line 29, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-akl6g8n8/task.py", line 16, in <module>
    @retry(max_attempts=3, del
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-b2z3dc17/task.py", line 27, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-wssjkadz/task.py", line 34, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-rutpipvy/task.py", line 27, in <module>
    assert len(result) == 3
  

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=86.0: 
- `dataextract/de-05` score=93.0: 
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=70.0: needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean
- `dataextract/de-10` score=70.0: cuisine_type: mismatch / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=79.0: complaint: mismatch / product_name: mismatch / rating: mismatch

### `format_or_instruction`
- `instructfollow/if-03` score=0.0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50.0: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0.0: exact_impossible_line
- `instructfollow/if-14` score=0.0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50.0: city_constraints

### `semantic_math`
- `reasonmath/rm-04` score=0.0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-08` score=0.0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-12` score=0.0: person expected son, got son or daughter
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5718.38; interest expected 718.96, got 718.38
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=54.66: 
- `speed/speed-short-002` score=60.75: 
- `speed/speed-short-003` score=59.69: 
- `speed/speed-medium-001` score=62.79: 
- `speed/speed-medium-002` score=62.91: 
- `speed/speed-medium-003` score=63.08: 
- `speed/speed-long-001` score=63.16: 
- `speed/speed-long-002` score=62.97: 

### `tool_missing`
- `toolcall/tc-05` score=25.0: matched 0/1 required tool calls; answered directly instead of using tools
