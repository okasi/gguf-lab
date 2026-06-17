# Local LLM Agent Settings

Shared LAN/proxy server tooling lives in [`proxy-lan-server/`](proxy-lan-server/). Windows/Strix Halo scripts, llama.cpp builds, and benchmark harnesses live in [`windows-strix-halo/`](windows-strix-halo/). See [`windows-strix-halo/AGENTS.md`](windows-strix-halo/AGENTS.md) for the full serving runbook.

macOS M1 Pro Gemma 4 QAT / MTP BenchLoop runs live in [`macos-m1-pro/`](macos-m1-pro/). See [`macos-m1-pro/AGENTS.md`](macos-m1-pro/AGENTS.md) for the promoted **Gemma 4 12B Unsloth MTP nmax2, KV Q4, no cap** serving profile (`run_gemma4_12b_promoted_serve.sh` → harness on `:8092`). The merged Gemma/Qwen harness lives in [`proxy-lan-server/`](proxy-lan-server/): [`proxy.mjs`](proxy-lan-server/proxy.mjs), [`test.mjs`](proxy-lan-server/test.mjs), [`lan-adapter.js`](proxy-lan-server/lan-adapter.js), and [`gemma_qwen_merged_policy.json`](proxy-lan-server/gemma_qwen_merged_policy.json). Run `npm install && npm test` from `proxy-lan-server/`.

Merged Gemma/Qwen harness work must keep sampler profiles separate and pinned unless the user explicitly asks for a sampler sweep. Use Gemma 4 `temp=1.0`, `top_p=0.95`, `top_k=64`, `min_p=0.0`; use Qwen/Qwopus `temp=0.85`, `top_p=0.95`, `top_k=20`, `min_p=0.0`. These profiles are defaults for clients that omit sampler fields; raw-compatible clients with explicit sampler values should be respected. Focus policy changes on generic protocol adaptation, parsing, retries, and output normalization rather than sampler tuning.

Benchmark results belong in the repo root [`README.md`](README.md).

Use `--ctx-size 131072` as the maximum serving and benchmark context unless the user explicitly asks for a larger context run. Larger windows such as `262144` make prefills too slow for normal comparisons.

Use `-b 4096 -ub 1024` for long-context prefill speed in benchmark and LAN shortcut profiles.

### Peak memory (llama-server, macOS + Windows)

README memory columns use the same **llama.cpp log + idle load** recipe on both platforms. Prompt cache must be enabled (default); capture server stdout/stderr to a log file.

| column | how |
|---|---|
| **Load** | Footprint right after the model is up and idle (~2s after `/health`), same flags as the benchmark run. |
| **Peak cache** | Max `cache state: … MiB` line in that run’s server log during the workload (limit usually 8192 MiB). |
| **≈ Peak** | `Load + peak cache` for that row; practical upper bound, not a second sample at max cache. |

**Load** probe by OS:

- **macOS** (unified memory) — process RSS: `ps -o rss= -p <llama-server-pid>` → **Load RSS** in [`macos-m1-pro/README.md`](macos-m1-pro/README.md).
- **Windows** (Vulkan / UMA) — GPU Process Memory **Total Committed** for the server PID via `Get-Counter` → **GiB** in Strix Halo README tables. See `Get-GpuProcessMemory` in [`windows-strix-halo/Run-Hard-Typescript.ps1`](windows-strix-halo/Run-Hard-Typescript.ps1).

**Peak cache** parsing is shared — regex `cache state: \d+ prompts, ([0-9.]+) MiB` on `*.llama-server.stdout.log` (macOS BenchLoop) or `*-server.err.log` / equivalent (Windows). Helper: [`macos-m1-pro/scripts/summarize_gemma4_12b_full.mjs`](macos-m1-pro/scripts/summarize_gemma4_12b_full.mjs) (`parseServerLog`).

Do not use Metal `MTL0 … MiB free` lines for peak tracking; they do not reflect live usage on unified memory.
