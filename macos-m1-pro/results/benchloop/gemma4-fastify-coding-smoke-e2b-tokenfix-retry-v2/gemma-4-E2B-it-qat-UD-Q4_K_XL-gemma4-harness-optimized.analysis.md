# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-fastify-coding-smoke-e2b-tokenfix-retry-v2/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-gemma4-harness-optimized`
- Overall: 36.772666666666666
- Quality: 47.92
- Speed: 0.0
- Reliability: 41.66666666666667
- Failures/partials: 7

## Failure Classes

| Class | Count |
| --- | ---: |
| `format_cleanup` | 4 |
| `coding_semantic` | 3 |

## Recommendations

- Enable fence/reasoning stripping, Python extraction, and content normalization.

## Examples

### `coding_semantic`
- `coding/coding-csv-parser` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-6rqknxjb/task.py", line 23, in <module>
    assert parse_csv(sample) =
- `coding/coding-flatten-nested` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-s_8gtemg/task.py", line 23, in <module>
    assert flatten([1, [2, [3,
- `coding/coding-parse-log-entries` score=25.0: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-q_yceanz/task.py", line 33, in <module>
    assert len(result) == 3
  

### `format_cleanup`
- `coding/coding-json-validator` score=0.0: SyntaxError: unterminated string literal (detected at line 29) (line 29)
- `coding/coding-retry-decorator` score=0.0: SyntaxError: unterminated string literal (detected at line 1) (line 1)
- `coding/coding-lru-cache` score=0.0: SyntaxError: invalid syntax (line 1)
- `coding/coding-rate-limiter` score=0.0: SyntaxError: unterminated triple-quoted string literal (detected at line 28) (line 27)
