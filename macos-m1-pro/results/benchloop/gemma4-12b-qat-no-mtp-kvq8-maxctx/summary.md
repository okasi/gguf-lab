# Gemma 4 12B QAT — no MTP, KV Q8, max ctx (Metal)

| flag | value |
|---|---|
| target | `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` |
| MTP | **none** |
| `-c` | 0 → **262144** |
| reasoning | off |
| `-ngl` | 999 |
| `-fa` | on |
| KV cache | **q8_0** / **q8_0** |
| llama.cpp | `76da245` |

## BenchLoop

| metric | value |
|---|---:|
| quality | 85.9 |
| overall | **76.9** |
| gen tok/s | **14.12** |
| runtime | 1735s |

## Memory

| metric | no-MTP KV Q8 | no-MTP f16 (ctx 4096)¹ | MTP nmax2 KV Q8 |
|---|---:|---:|---:|
| load RSS | **~9010 MiB** | ~7014 MiB | ~9560 MiB |
| peak prompt cache | **~5889 MiB** | ~8187 MiB | ~5940 MiB |
| peak prompt state | **~182 MiB** | ~349 MiB | ~189 MiB |

¹ earlier baseline used `-c 4096`, not 262144.

## 2×2 comparison (KV Q8 rows at `-c 0`)

| | **no MTP** | **MTP n-max=2** |
|---|---:|---:|
| **KV f16** | 77.8 / 15.70 tok/s² | **78.9 / 21.65 tok/s** |
| **KV q8_0** | **76.9 / 14.12 tok/s** | 76.9 / 15.83 tok/s |

² f16 no-MTP at ctx 4096 (not 262144).

**Takeaway:** KV Q8 costs ~10% tok/s vs no-MTP f16@4096, and ~27% vs MTP f16@262k. MTP+f16 is still the speed winner; KV Q8 saves ~0.5–2 GB vs MTP+f16 depending on config.
