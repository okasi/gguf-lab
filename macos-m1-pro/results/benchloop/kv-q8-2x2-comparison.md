# KV cache 2×2 — Gemma 4 12B QAT (Metal, M1 Pro)

All KV Q8 runs: `--cache-type-k q8_0 --cache-type-v q8_0`, `-c 0` (262144), `-ngl 999 -fa on`, `--reasoning off`.

| | **no MTP** | **MTP n-max=2** |
|---|---|---|
| **KV f16 (default)** | overall **77.8**, 15.70 tok/s, 1477s<br/>ctx **4096**¹, load RSS ~7.0 GB | overall **78.9**, **21.65 tok/s**, 957s<br/>ctx 262144, load RSS ~11.6 GB |
| **KV q8_0** | overall **76.9**, 14.12 tok/s, 1735s<br/>ctx 262144, load RSS ~9.0 GB | overall **76.9**, 15.83 tok/s, 1723s<br/>ctx 262144, load RSS ~9.6 GB |

¹ no-MTP f16 baseline predates max-ctx sweep; not directly comparable on context size.

### Quality

| | no MTP | MTP nmax2 |
|---|---:|---:|
| KV f16 | 86.2 | 86.2 |
| KV q8_0 | 85.9 | 85.1 |

### Peak prompt cache (BenchLoop)

| | no MTP | MTP nmax2 |
|---|---:|---:|
| KV f16 | ~8187 MiB | ~8189 MiB |
| KV q8_0 | ~5889 MiB | ~5940 MiB |

### Conclusions

1. **KV Q8 saves ~2 GB load RSS** vs MTP+f16, and **~2.2 GB peak prompt cache** during long runs.
2. **KV Q8 speed hit is real without MTP** (−10% vs f16@4096) and **worse with MTP** (−27% vs MTP+f16).
3. **MTP+f16 remains best** for throughput; KV Q8 is a memory tradeoff, not a speed win on Metal here.

**Result dirs:**
- `gemma4-12b-qat-no-mtp-kvq8-maxctx/`
- `gemma4-12b-qat-unsloth-mtp-nmax2-kvq8-maxctx/`
- `gemma4-12b-qat-unsloth-mtp-sweep-16gb-maxctx/nmax2-reasoning-off/`
- `qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/` (no-MTP f16)
