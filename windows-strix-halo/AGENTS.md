# Windows Strix Halo Agent Guide

Run PowerShell commands from `windows-strix-halo/`.

## Architecture

- `Common.ps1`: config access, Hugging Face cache resolution, argument quoting, and logged process startup.
- `ModelDraft.ps1`: MTP model/draft resolution and speculative decoding arguments.
- `ReasoningArgs.ps1`: family-aware reasoning arguments.
- `Serve-LAN.ps1`: llama-server/LAN lifecycle, resilient aliases, and optional ASR integration.
- `Run-BenchLoop.ps1`: reusable BenchLoop runner.
- `Run-Hard-Typescript.ps1`: hard TypeScript and runtime validation.
- `readme-models.json`: portable model manifest with repository/file identifiers.

Model config flows through `Common.ps1`, which resolves files from the local Hugging Face cache. Launch scripts combine shared runtime, family reasoning, and MTP arguments, start `llama-server`, wait for health, then run the selected workload or LAN adapter.

## Defaults

- llama.cpp runtime: `tools/llama-b9551-bin-win-vulkan-x64/`
- normal context maximum: `131072`
- prompt batch/micro-batch: `4096 / 1024`
- cache reuse: opt-in
- target and draft KV: `q4_0`
- Gemma sampler: `1.0 / 0.95 / 64 / min_p 0.0`
- Qwen/Qwopus sampler: `0.85 / 0.95 / 20 / min_p 0.0`

Explicit matrix configs may use `262144`; do not promote that as the normal default. Preserve explicit client sampler values. The primary Qwopus 35B LAN profile uses reasoning off, MTP n-max 2, q4 target/draft KV, and the shared 131K `-b 4096 -ub 1024` prefill profile.

## Commands

```powershell
.\Install-LlamaB9551.ps1
.\Serve-LAN.ps1 -Action List
.\Serve-LAN.ps1 -Action Start -Model <model-key>
.\Run-BenchLoop.ps1 -ModelConfig <config>
.\Run-Hard-Typescript.ps1 -ModelConfig <config>
.\Export-ReadmeBenchmarkTable.ps1
```

Keep generated logs, models, and runtime archives untracked. Record durable results in the root README. Windows firewall, Vulkan/GPU memory, and FastFlowLM integrations require validation on the target Windows host.
