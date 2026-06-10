# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-harness-optimized/iteration-07/gemma-4-E4B-it-qat-UD-Q4_K_XL/run.json`
- Model: `gemma-4-E4B-it-qat-UD-Q4_K_XL-harness-iter07`
- Overall: 70.35368258426966
- Quality: 74.90499999999999
- Speed: 61.51
- Reliability: 67.41573033707866
- Failures/partials: 40

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 9 |
| `speed_measurement` | 9 |
| `coding_semantic` | 6 |
| `format_or_instruction` | 6 |
| `semantic_math` | 5 |
| `format_cleanup` | 2 |
| `answer_line` | 1 |
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |

## Recommendations

- Enable conservative max-token caps by task type to reduce temp=1 rambling.
- Enable fence/reasoning stripping, Python extraction, and content normalization.
- Enable missing batch-call synthesis.
- Enable answer-line canonicalization.
- Enable tool-call synthesis for obvious tool-use prompts.

## Examples

### `tool_partial_batch`
- `agent/agent-02-stock-portfolio` score=75.0: 

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-601tph0u/task.py", line 19, in <module>
    assert callable(parse_csv)
- `coding/coding-json-validator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-wmkatsnv/task.py", line 31, in <module>
    assert validate_user({"nam
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-bxynf5t0/task.py", line 19, in <module>
    @retry(max_attempts=3, del
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-c4_pqq23/task.py", line 21, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-hy26t2i3/task.py", line 32, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-7_goak07/task.py", line 30, in <module>
    assert len(result) == 3
  

### `format_cleanup`
- `coding/coding-flatten-nested` score=0.0: SyntaxError: unterminated triple-quoted string literal (detected at line 4) (line 3)
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: closing parenthesis ']' does not match opening parenthesis '(' (line 9)

### `semantic_extraction`
- `dataextract/de-03` score=92.0: 
- `dataextract/de-04` score=71.0: meeting_name: mismatch / room: mismatch
- `dataextract/de-06` score=80.0: medication_dose: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76.0: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-09` score=80.0: requester_name: mismatch / room: mismatch
- `dataextract/de-10` score=70.0: cuisine_type: expected string / neighborhood: expected null / visit_duration: expected string
- `dataextract/de-12` score=93.0: 
- `dataextract/de-13` score=0.0: top-level shape mismatch: expected object, received array / expected object

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
- `reasonmath/rm-13` score=0.0: amount expected 5718.96, got 5721.03; interest expected 718.96, got 721.03
- `reasonmath/rm-15` score=0.0: missing count

### `answer_line`
- `reasonmath/rm-06` score=0.0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=55.25: 
- `speed/speed-short-002` score=60.97: 
- `speed/speed-short-003` score=60.1: 
- `speed/speed-medium-001` score=62.73: 
- `speed/speed-medium-002` score=62.82: 
- `speed/speed-medium-003` score=62.89: 
- `speed/speed-long-001` score=62.97: 
- `speed/speed-long-002` score=63.01: 

### `tool_missing`
- `toolcall/tc-05` score=25.0: matched 0/1 required tool calls; answered directly instead of using tools
