# Gemma 4 12B QAT — Unsloth MTP n-max=2, KV Q8 (Metal)

**Config:** recommended production flags + `--cache-type-k q8_0 --cache-type-v q8_0` (target + draft).

| flag | value |
|---|---|
| target | `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` |
| draft | `MTP/gemma-4-12B-it-Q8_0-MTP.gguf` |
| `-c` | 0 → **262144** |
| MTP | `draft-mtp`, n-max=**2** |
| reasoning | off |
| `-ngl` / `-ngld` | 999 / 999 |
| `-fa` | on |
| KV cache | **q8_0** / **q8_0** (target + draft) |
| llama.cpp | `76da245` |

## BenchLoop results

| metric | KV Q8 (this run) | KV f16 (`nmax2-reasoning-off`) | Δ |
|---|---:|---:|---:|
| quality | 85.1 | 86.2 | −1.1 |
| overall | **76.9** | **78.9** | −2.0 |
| speed | 50.5 | 56.1 | −5.6 |
| gen tok/s | **15.83** | **21.65** | **−27%** |
| runtime | 1723s | 957s | +80% |
| draft accept % | ~84% | ~84% | ~0 |

## Memory

| metric | KV Q8 | KV f16 |
|---|---:|---:|
| load RSS (idle) | **~9560 MiB** | ~11574 MiB |
| peak prompt cache | **~5940 MiB** | ~8189 MiB |
| peak prompt state | **~189 MiB** | ~349 MiB |

KV Q8 saves **~2.0 GB** at load and keeps prompt cache **~2.2 GB** lower during BenchLoop on this M1 Pro.

## Suite scores

| Suite | Score | Pass |
|---|---:|---|
| agent | 96.9 | 7/8 |
| coding | 100.0 | 12/12 |
| dataextract | 81.7 | 10/15 |
| instructfollow | 75.5 | 10/15 |
| reasonmath | 73.3 | 11/15 |
| speed | 50.5 | 9/9 |
| toolcall | 83.3 | 12/15 |

## Takeaway

KV Q8 cuts memory meaningfully but **hurts speed a lot** on Metal for this Gemma4 MTP setup (~27% lower gen tok/s, ~2× runtime). Draft acceptance is unchanged; the regression is mostly throughput. For best speed/quality, keep default **f16 KV**; use **q8_0 KV** when you need the ~2 GB headroom.
