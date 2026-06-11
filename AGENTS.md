# Local LLM Agent Settings

Shared LAN tooling (`lan-adapter.js`, `lan-models.json`) lives at the repo root. Windows/Strix Halo scripts, llama.cpp builds, and benchmark harnesses live in [`windows-strix-halo/`](windows-strix-halo/). See [`windows-strix-halo/AGENTS.md`](windows-strix-halo/AGENTS.md) for the full serving runbook.

macOS M1 Pro Gemma 4 QAT / MTP BenchLoop runs live in [`macos-m1-pro/`](macos-m1-pro/). See [`macos-m1-pro/AGENTS.md`](macos-m1-pro/AGENTS.md) for the promoted **Gemma 4 12B Unsloth MTP nmax2, KV Q4, no cap** serving profile (`run_gemma4_12b_promoted_serve.sh` → harness on `:8092`). The E2B/E4B/12B Fastify BenchLoop harness is [`gemma4_benchloop_harness_fastify/`](gemma4_benchloop_harness_fastify/) (`npm install && npm test` there).

Benchmark results belong in the repo root [`README.md`](README.md).
