# Gemma 4 Harness Failure Analysis

- Source: `/Users/okasi/Developer/local-llm-experiments/macos-m1-pro/results/benchloop/gemma4-12b-fastify-harness-nmax2/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-12B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 69.87062921348316
- Quality: 75.64
- Speed: 52.86
- Reliability: 70.78651685393258
- Failures/partials: 39

## Failure Classes

| Class | Count |
| --- | ---: |
| `semantic_extraction` | 9 |
| `speed_measurement` | 9 |
| `coding_semantic` | 8 |
| `format_or_instruction` | 6 |
| `format_cleanup` | 4 |
| `semantic_math` | 2 |
| `agent_or_tool_semantic` | 1 |

## Recommendations

- Use conservative max-token caps by task type to reduce temp=1 rambling.
- Enable fence/reasoning stripping and content normalization.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `coding_semantic`
- `coding/coding-csv-parser` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-opdmdgcl/task.py", line 18, in <module>
    assert parse_csv(sample) =
- `coding/coding-fibonacci-memo` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-1k9jc7tb/task.py", line 9, in <module>
    assert fib(0) == 0
        
- `coding/coding-bug-fix-off-by-one` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-p54roly5/task.py", line 6, in <module>
    assert binary_search(arr, 1
- `coding/coding-json-validator` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-l3o3trd3/task.py", line 16, in <module>
    assert validate_user({"nam
- `coding/coding-deduplicate-preserve-order` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-8drkrztw/task.py", line 14, in <module>
    assert dedupe([1, 2, 3, 2,
- `coding/coding-lru-cache` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-5ufd6iwg/task.py", line 22, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-rate-limiter` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-ruf0qqtd/task.py", line 31, in <module>
    assert rl.allow() == True

- `coding/coding-parse-log-entries` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-rcvguix_/task.py", line 16, in <module>
    assert len(result) == 3
  

### `format_cleanup`
- `coding/coding-flatten-nested` score=0: SyntaxError: invalid syntax (line 1)
- `coding/coding-retry-decorator` score=0: SyntaxError: invalid syntax (line 1)
- `coding/coding-add-error-handling` score=0: SyntaxError: unterminated string literal (detected at line 4) (line 4)
- `coding/coding-async-to-sync-refactor` score=0: SyntaxError: invalid syntax (line 1)

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-05` score=93: 
- `dataextract/de-06` score=80: chief_complaint: mismatch / medication_duration: expected string / referral: expected null
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-10` score=60: cuisine_type: expected string / neighborhood: expected null / street_address: expected null / visit_duration: expected string
- `dataextract/de-12` score=93: 
- `dataextract/de-13` score=92: 

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=33.3: format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24

### `speed_measurement`
- `speed/speed-short-001` score=39.84: 
- `speed/speed-short-002` score=50.55: 
- `speed/speed-short-003` score=54.88: 
- `speed/speed-medium-001` score=53.5: 
- `speed/speed-medium-002` score=55.66: 
- `speed/speed-medium-003` score=55.86: 
- `speed/speed-long-001` score=54.88: 
- `speed/speed-long-002` score=55.59:
