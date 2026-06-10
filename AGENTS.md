# Local LLM Agent Settings

Shared LAN tooling (`lan-adapter.js`, `lan-models.json`) lives at the repo root. Windows/Strix Halo scripts, llama.cpp builds, and benchmark harnesses live in [`windows-strix-halo/`](windows-strix-halo/). See [`windows-strix-halo/AGENTS.md`](windows-strix-halo/AGENTS.md) for the full serving runbook.

macOS M1 Pro Gemma 4 QAT / MTP BenchLoop runs live in [`macos-m1-pro/`](macos-m1-pro/). The optimized Gemma 4 Fastify BenchLoop proxy is at [`gemma4_benchloop_harness_fastify/proxy.mjs`](gemma4_benchloop_harness_fastify/proxy.mjs) with policy [`configs/gemma4_qat_q4_optimized_policy.json`](configs/gemma4_qat_q4_optimized_policy.json).

Benchmark results belong in the repo root [`README.md`](README.md).
