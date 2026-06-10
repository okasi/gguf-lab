# Gemma 4 12B QAT — MTP sweep + baselines (Metal, M1 Pro 32GB)

**Hardware:** Apple M1 Pro, 32 GB unified memory (25.6 GB Metal-reported pool).
**Target:** `unsloth/gemma-4-12b-it-qat-GGUF` · `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf`
**MTP draft (Unsloth):** `MTP/gemma-4-12B-it-Q8_0-MTP.gguf`
**llama.cpp:** `76da245` (Gemma4 MTP, PR #23398)

### Server flags

| group | `-c` | fit | `-ngl` | `-fa` | MTP | reasoning |
|---|---:|---|---|---|---|---|
| baseline (no MTP) | 4096 | off | all | auto | — | off |
| Janvitos MTP | 4096 | off | all | auto | draft-mtp n-max=4 | off |
| Unsloth sweep | 0 → 262144 | on, target 16384¹ | 999 / 999d | on | draft-mtp n-max 1–4 | on/off |

¹ `--fit on --fit-target 16384` did **not** shrink context because `-ngl 999` was preset (`common_fit_params: abort`). All Unsloth runs still loaded **n_ctx = 262144**.

### Memory notes

- **Load RSS** — process resident set right after model load (post-warmup, idle). On Apple Silicon this is the best practical proxy for peak unified-memory footprint at startup.
- **Peak prompt cache** — max `cache state` MiB seen during BenchLoop (limit 8192 MiB). Fills toward the ceiling on long multi-suite runs.
- **Peak prompt state** — largest single saved prompt KV state (`total state size`).
- **Peak checkpoint** — largest context checkpoint blob during the run.
- Metal `MTL0 … MiB free` lines in logs do **not** track usage during inference on unified memory; ignore `mtl_peak_used_mib` from those.

## Full comparison

| config | MTP | n-max | reasoning | n_ctx | load RSS | peak cache | peak prompt | peak ckpt | draft % | quality | overall | gen tok/s | runtime |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline-no-mtp | none | — | off | 4096 | 7014 MiB | 8187 MiB | 349 MiB | 349 MiB | — | 86.2 | 77.8 | 15.70 | 1477s |
| janvitos-mtp-ctx4096 | Janvitos | 4 | off | 4096 | 7651 MiB | 8172 MiB | 349 MiB | 349 MiB | 74.6 | 86.2 | 78.2 | 17.79 | 1074s |
| nmax1-reasoning-off | Unsloth | 1 | off | 262144 | 11574 MiB | 8160 MiB | 349 MiB | 349 MiB | 89.2 | 86.2 | 78.1 | 17.36 | 1275s |
| nmax1-reasoning-on | Unsloth | 1 | on | 262144 | 11693 MiB | 8176 MiB | 365 MiB | 708 MiB | 89.4 | 66.7 | 63.8 | 18.96 | 5035s |
| nmax2-reasoning-off | Unsloth | 2 | off | 262144 | 11574 MiB | 8189 MiB | 349 MiB | 349 MiB | 84.0 | 86.2 | 78.9 | 21.65 | 957s |
| nmax2-reasoning-on | Unsloth | 2 | on | 262144 | 11693 MiB | 8176 MiB | 365 MiB | 708 MiB | 85.4 | 66.7 | 64.7 | 24.71 | 3455s |
| nmax3-reasoning-off | Unsloth | 3 | off | 262144 | 11574 MiB | 8168 MiB | 349 MiB | 349 MiB | 79.7 | 86.2 | 78.5 | 19.50 | 1009s |
| nmax3-reasoning-on | Unsloth | 3 | on | 262144 | 11693 MiB | 8178 MiB | 365 MiB | 708 MiB | 80.6 | 66.7 | 64.5 | 22.88 | 3575s |
| nmax4-reasoning-off | Unsloth | 4 | off | 262144 | 11574 MiB | 8172 MiB | 349 MiB | 349 MiB | 74.6 | 86.2 | 78.3 | 18.25 | 1042s |
| nmax4-reasoning-on | Unsloth | 4 | on | 262144 | 11693 MiB | 8180 MiB | 365 MiB | 708 MiB | 75.5 | 66.7 | 64.3 | 21.80 | 3613s |

## Takeaways

- **Best overall (reasoning off):** `nmax2-reasoning-off` — overall **78.9**, **21.65 gen tok/s**, ~**16 min** runtime.
- **No-MTP baseline** (ctx 4096): overall **77.8**, **15.70 gen tok/s**; load RSS **~7.0 GB** vs **~11.6 GB** for max-ctx Unsloth MTP.
- **Janvitos MTP** (ctx 4096): modest speedup (+13% tok/s) with lower draft acceptance (~75%) vs Unsloth (~84% at n-max=2).
- **Reasoning on** cuts quality to **66.7** and multiplies runtime 3–5×; peak checkpoints jump to **~708 MiB** (vs ~326 MiB off).
- Prompt cache hits **~8.2 GB** on every long run regardless of MTP — the dominant runtime memory growth beyond model+KV load.

