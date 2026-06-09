# Combined Qwopus/Huihui Summary

Runtime for the latest coding benchmark: llama.cpp b9222 Vulkan, 262144 context, Q4_0/Q4_0 KV, flash attention, `temperature=0.65`, `top_p=0.95`, `top_k=20`, `presence_penalty=0.0`, `repeat_penalty=1.0`, `enable_thinking=true`, `draft-mtp n_min=1 n_max=2`.

Coding prompt: write a complete Python 3 solution for counting how many closed intervals contain each query point, with `N,Q <= 200000`, negative coordinates, duplicate points/intervals, and required `O((N+Q) log N)`.

| Model | Article TPS | Coding TPS | Swedish Article Score | Coding Score | Comment |
|---|---:|---:|---:|---:|---|
| Qwopus 35B APEX I-Balanced | 53.45 | 58.38 | 7.0 | 1.0 | Best Swedish article prose, but failed the coding task under `enable_thinking=true`: no visible code after 5200 tokens. |
| Huihui 35B A3B MTP Q5_K | 54.25 | 55.72 | 6.5 | 3.0 | Good speed and decent Swedish article. Coding answer compiled but used a flawed sweep-line/query mapping and passed only 1/4 tests. |
| Qwopus 35B MXFP4_MOE | 42.49 | 51.09 | 5.5 | 3.0 | Coherent but less factually reliable article. Coding answer had the same sorted-query-order bug and passed only 1/4 tests. |
| Qwopus 27B preview IQ4_XS | 16.58 | 19.68 | 5.0 | 9.5 | Much slower, weaker Swedish article, but clearly best on this coding test: produced the correct bisect solution and passed 4/4 tests. |

## TypeScript 8-Test Pass

TypeScript prompt used the same interval/query problem and asked for a complete Node.js TypeScript program. Outputs were transpiled with TypeScript 6.0.3 and executed with Node.js against 8 deterministic edge-case tests.

| Model | TypeScript TPS | Tests Passed | TypeScript Score | Comment |
|---|---:|---:|---:|---|
| Qwopus 35B APEX I-Balanced | 65.49 | 0/8 | 0.5 | No visible TypeScript code after 6500 tokens; all output budget went to reasoning. |
| Huihui 35B A3B MTP Q5_K | 57.16 | 0/8 | 2.0 | Produced TypeScript, but read `input.txt` instead of stdin and also used a sweep-line answer order bug. |
| Qwopus 35B MXFP4_MOE | 52.22 | 0/8 | 0.5 | No visible TypeScript code after 6500 tokens; all output budget went to reasoning. |
| Qwopus 27B preview IQ4_XS | 20.72 | 8/8 | 10.0 | Correct stdin-based TypeScript solution using sorted starts/ends and binary search. |

Artifacts:
- Coding timings: `logs/coding-test-results.csv`
- Coding harness results: `logs/coding-test-judgement.csv`
- TypeScript timings: `logs/typescript-test-results.csv`
- TypeScript harness results: `logs/typescript-test-judgement.csv`
- Swedish article judgement: `logs/bolan-article-judgement.md`
