# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-coding-smoke-e2b/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 16.772666666666666
- Quality: 22.92
- Speed: 0.0
- Reliability: 16.666666666666664
- Failures/partials: 10

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_cleanup` | 7 |
| `coding_semantic` | 3 |

## Recommendations

- Enable fence/reasoning stripping, Python extraction, and content normalization.

## Examples

### `format_cleanup`
- `coding/coding-csv-parser` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-json-validator` score=0.0: SyntaxError: unterminated string literal (detected at line 29) (line 29)
- `coding/coding-deduplicate-preserve-order` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-add-error-handling` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-rate-limiter` score=0.0: SyntaxError: unterminated triple-quoted string literal (detected at line 31) (line 27)
- `coding/coding-async-to-sync-refactor` score=0.0: SyntaxError: invalid syntax (line 1)

### `coding_semantic`
- `coding/coding-retry-decorator` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-etywnsf0/task.py", line 33, in <module>
    @retry(max_attempts=3, del
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-jzjj63ly/task.py", line 18, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-7cso1gam/task.py", line 39, in <module>
    result = parse_logs(logs)
