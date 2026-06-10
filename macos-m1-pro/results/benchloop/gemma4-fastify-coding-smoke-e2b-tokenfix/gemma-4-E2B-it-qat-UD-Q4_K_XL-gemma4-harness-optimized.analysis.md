# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-coding-smoke-e2b-tokenfix/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 17.916666666666668
- Quality: 25.0
- Speed: 0.0
- Reliability: 16.666666666666664
- Failures/partials: 10

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_cleanup` | 6 |
| `coding_semantic` | 4 |

## Recommendations

- Enable fence/reasoning stripping, Python extraction, and content normalization.

## Examples

### `format_cleanup`
- `coding/coding-csv-parser` score=0.0: SyntaxError: unterminated string literal (detected at line 3) (line 3)
- `coding/coding-flatten-nested` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-bug-fix-off-by-one` score=0.0: SyntaxError: unterminated string literal (detected at line 1) (line 1)
- `coding/coding-json-validator` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-retry-decorator` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-rate-limiter` score=0.0: SyntaxError: unterminated triple-quoted string literal (detected at line 31) (line 28)

### `coding_semantic`
- `coding/coding-deduplicate-preserve-order` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-rohmi_5l/task.py", line 28, in <module>
    deduped_list2
NameError: n
- `coding/coding-add-error-handling` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-o30_qou8/task.py", line 17, in <module>
    assert get_nested_value(da
- `coding/coding-lru-cache` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-9p4ws0of/task.py", line 24, in <module>
    cache.put("a", 1)
    ^^^^
- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-xltc228a/task.py", line 38, in <module>
    result = parse_logs(logs)
