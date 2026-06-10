# Gemma 4 12B QAT — Full BenchLoop Summary (Metal, M1 Pro 32GB)

**Model:** `unsloth/gemma-4-12b-it-qat-GGUF` · `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf`
**BenchLoop:** v0.2.3 · suites: agent, coding, dataextract, instructfollow, reasonmath, speed, toolcall
**Sampler:** `--temp 1 --top-p 0.95 --top-k 64 -n 256`
**llama.cpp:** `76da245` (Gemma4 MTP support)

---

## Master comparison

| config | MTP | n-max | reasoning | KV | n_ctx | load RSS | peak cache | peak prompt | draft % | quality | overall | speed | reliability | gen tok/s | runtime |
|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| No MTP (f16 KV) | none | — | off | f16/f16 | 4096 | 7014 | 8187 | 349 | — | 86.2 | 77.8 | 50.6 | 80.9 | 15.70 | 1477s |
| No MTP (KV Q8) | none | — | off | q8_0/q8_0 | 262144 | 9010 | 5889 | 182 | — | 85.9 | 76.9 | 48.7 | 79.8 | 14.12 | 1735s |
| Janvitos MTP | Janvitos | 4 | off | f16/f16 | 4096 | 7651 | 8172 | 349 | 74.6 | 86.2 | 78.2 | 52.6 | 80.9 | 17.79 | 1074s |
| Unsloth MTP nmax1-reasoning-off | Unsloth | 1 | off | f16/f16 | 262144 | 11574 | 8160 | 349 | 89.2 | 86.2 | 78.1 | 52.4 | 80.9 | 17.36 | 1275s |
| Unsloth MTP nmax1-reasoning-on | Unsloth | 1 | on | f16/f16 | 262144 | 11693 | 8176 | 365 | 89.4 | 66.7 | 63.8 | 54.1 | 65.2 | 18.96 | 5035s |
| Unsloth MTP nmax2-reasoning-off | Unsloth | 2 | off | f16/f16 | 262144 | 11574 | 8189 | 349 | 84.0 | 86.2 | 78.9 | 56.1 | 80.9 | 21.65 | 957s |
| Unsloth MTP nmax2-reasoning-on | Unsloth | 2 | on | f16/f16 | 262144 | 11693 | 8176 | 365 | 85.4 | 66.7 | 64.7 | 58.9 | 65.2 | 24.71 | 3455s |
| Unsloth MTP nmax3-reasoning-off | Unsloth | 3 | off | f16/f16 | 262144 | 11574 | 8168 | 349 | 79.7 | 86.2 | 78.5 | 54.3 | 80.9 | 19.50 | 1009s |
| Unsloth MTP nmax3-reasoning-on | Unsloth | 3 | on | f16/f16 | 262144 | 11693 | 8178 | 365 | 80.6 | 66.7 | 64.5 | 57.5 | 65.2 | 22.88 | 3575s |
| Unsloth MTP nmax4-reasoning-off | Unsloth | 4 | off | f16/f16 | 262144 | 11574 | 8172 | 349 | 74.6 | 86.2 | 78.3 | 53.1 | 80.9 | 18.25 | 1042s |
| Unsloth MTP nmax4-reasoning-on | Unsloth | 4 | on | f16/f16 | 262144 | 11693 | 8180 | 365 | 75.5 | 66.7 | 64.3 | 56.6 | 65.2 | 21.80 | 3613s |
| Unsloth MTP nmax2 (KV Q8) | Unsloth | 2 | off | q8_0/q8_0 | 262144 | 9560 | 5940 | 189 | 84.1 | 85.1 | 76.9 | 50.5 | 79.8 | 15.83 | 1723s |

## 2×2 — KV cache × MTP (reasoning off)

| | **no MTP** | **MTP n-max=2** |
|---|---|---|
| **KV f16** | overall **77.8**, 15.70 tok/s, 1477s, Q 86.2¹ | overall **78.9**, 21.65 tok/s, 957s, Q 86.2 |
| **KV q8_0** | overall **76.9**, 14.12 tok/s, 1735s, Q 85.9 | overall **76.9**, 15.83 tok/s, 1723s, Q 85.1 |

¹ no-MTP f16 run used `-c 4096` (not 262144).

## Suite scores

| config | agent | coding | data | instruct | math | speed | tool |
|---|---:|---:|---:|---:|---:|---:|---:|
| No MTP (f16 KV) | 96.9 (7/8) | 100.0 (12/12) | 81.7 (10/15) | 75.5 (10/15) | 80.0 (12/15) | 50.6 (9/9) | 83.3 (12/15) |
| No MTP (KV Q8) | 96.9 (7/8) | 100.0 (12/12) | 81.7 (10/15) | 73.3 (9/15) | 80.0 (12/15) | 48.7 (9/9) | 83.3 (12/15) |
| Janvitos MTP | 96.9 (7/8) | 100.0 (12/12) | 81.7 (10/15) | 75.5 (10/15) | 80.0 (12/15) | 52.6 (9/9) | 83.3 (12/15) |
| Unsloth MTP nmax1-reasoning-off | 96.9 (7/8) | 100.0 (12/12) | 81.7 (10/15) | 75.5 (10/15) | 80.0 (12/15) | 52.4 (9/9) | 83.3 (12/15) |
| Unsloth MTP nmax1-reasoning-on | 96.9 (7/8) | 100.0 (12/12) | 22.1 (4/15) | 37.8 (5/15) | 60.0 (9/15) | 54.1 (9/9) | 83.3 (12/15) |
| Unsloth MTP nmax2-reasoning-off | 96.9 (7/8) | 100.0 (12/12) | 81.7 (10/15) | 75.5 (10/15) | 80.0 (12/15) | 56.1 (9/9) | 83.3 (12/15) |
| Unsloth MTP nmax2-reasoning-on | 96.9 (7/8) | 100.0 (12/12) | 22.1 (4/15) | 37.8 (5/15) | 60.0 (9/15) | 58.9 (9/9) | 83.3 (12/15) |
| Unsloth MTP nmax3-reasoning-off | 96.9 (7/8) | 100.0 (12/12) | 81.7 (10/15) | 75.5 (10/15) | 80.0 (12/15) | 54.3 (9/9) | 83.3 (12/15) |
| Unsloth MTP nmax3-reasoning-on | 96.9 (7/8) | 100.0 (12/12) | 22.1 (4/15) | 37.8 (5/15) | 60.0 (9/15) | 57.5 (9/9) | 83.3 (12/15) |
| Unsloth MTP nmax4-reasoning-off | 96.9 (7/8) | 100.0 (12/12) | 81.7 (10/15) | 75.5 (10/15) | 80.0 (12/15) | 53.1 (9/9) | 83.3 (12/15) |
| Unsloth MTP nmax4-reasoning-on | 96.9 (7/8) | 100.0 (12/12) | 22.1 (4/15) | 37.8 (5/15) | 60.0 (9/15) | 56.6 (9/9) | 83.3 (12/15) |
| Unsloth MTP nmax2 (KV Q8) | 96.9 (7/8) | 100.0 (12/12) | 81.7 (10/15) | 75.5 (10/15) | 73.3 (11/15) | 50.5 (9/9) | 83.3 (12/15) |

## Server config reference

| config | `-c` | fit | `-ngl` | `-fa` | draft model |
|---|---:|---|---|---|---|
| No MTP (f16 KV) | 4096 | off | all | auto | — |
| No MTP (KV Q8) | 0 | 16384 | 999 | on | — |
| Janvitos MTP | 4096 | off | all | auto | Janvitos Q8 MTP |
| Unsloth MTP nmax1-reasoning-off | 0 | 16384 | 999 | on | MTP/gemma-4-12B-it-Q8_0-MTP.gguf |
| Unsloth MTP nmax1-reasoning-on | 0 | 16384 | 999 | on | MTP/gemma-4-12B-it-Q8_0-MTP.gguf |
| Unsloth MTP nmax2-reasoning-off | 0 | 16384 | 999 | on | MTP/gemma-4-12B-it-Q8_0-MTP.gguf |
| Unsloth MTP nmax2-reasoning-on | 0 | 16384 | 999 | on | MTP/gemma-4-12B-it-Q8_0-MTP.gguf |
| Unsloth MTP nmax3-reasoning-off | 0 | 16384 | 999 | on | MTP/gemma-4-12B-it-Q8_0-MTP.gguf |
| Unsloth MTP nmax3-reasoning-on | 0 | 16384 | 999 | on | MTP/gemma-4-12B-it-Q8_0-MTP.gguf |
| Unsloth MTP nmax4-reasoning-off | 0 | 16384 | 999 | on | MTP/gemma-4-12B-it-Q8_0-MTP.gguf |
| Unsloth MTP nmax4-reasoning-on | 0 | 16384 | 999 | on | MTP/gemma-4-12B-it-Q8_0-MTP.gguf |
| Unsloth MTP nmax2 (KV Q8) | 0 | 16384 | 999 | on | MTP/gemma-4-12B-it-Q8_0-MTP.gguf |

## Memory notes

- **load RSS** — process memory after model load (idle). Apple unified memory; best BRAM proxy.
- **peak cache** — max prompt-cache usage during BenchLoop (8192 MiB limit).
- **peak prompt** — largest single saved prompt KV state.
- `--fit-target 16384` did not reduce context when `-ngl 999` was preset; Unsloth runs loaded n_ctx=262144.

## Recommendations

| goal | config |
|---|---|
| **Best overall + speed** | Unsloth MTP, n-max=2, reasoning off, f16 KV (`nmax2-reasoning-off`) |
| **Lowest memory at max ctx** | No MTP or MTP + KV q8_0 (~9.0–9.6 GB load RSS vs ~11.6 GB MTP+f16) |
| **Avoid** | `--reasoning on` for benchmarks (quality −20 pts, 3–5× runtime) |
| **KV Q8 tradeoff** | −10% tok/s (no MTP) to −27% (MTP) vs f16; saves ~2 GB RAM |

