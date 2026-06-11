# Local LLM Agent Settings

Shared LAN tooling (`lan-adapter.js`, `lan-models.json`) lives at the repo root. Windows/Strix Halo scripts, llama.cpp builds, and benchmark harnesses live in [`windows-strix-halo/`](windows-strix-halo/). See [`windows-strix-halo/AGENTS.md`](windows-strix-halo/AGENTS.md) for the full serving runbook.

macOS M1 Pro Gemma 4 QAT / MTP BenchLoop runs live in [`macos-m1-pro/`](macos-m1-pro/). See [`macos-m1-pro/AGENTS.md`](macos-m1-pro/AGENTS.md) for the promoted **Gemma 4 12B Unsloth MTP nmax2, KV Q4, no cap** serving profile (`run_gemma4_12b_promoted_serve.sh` → harness on `:8092`). The E2B/E4B/12B Fastify BenchLoop harness is [`gemma4_benchloop_harness_fastify/`](gemma4_benchloop_harness_fastify/) (`npm install && npm test` there).

Benchmark results belong in the repo root [`README.md`](README.md).

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
