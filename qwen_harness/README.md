# Qwen/Qwopus Harness

LAN-adapter compatible post-processor for Qwopus/Qwen OpenAI-compatible chat completions.
It is meant for OpenClaw/ClawBench, Hermes Agent, BenchLoop, and similar local agent
clients. It keeps upstream prompts and tool schemas intact, then applies general
response normalization after llama.cpp returns:

- sampler enforcement for the Qwopus 35B profile (`temp=0.85`, `top_p=0.95`, `top_k=20`)
- Qwen reasoning/end-token cleanup
- generic JSON envelope/fence cleanup that preserves emitted values
- generic Python/JavaScript/TypeScript fence extraction
- OpenAI tool-call normalization from tags, JSON blobs, function syntax, and active tool schemas
- bounded retries for empty, malformed structured output, or missing tool-call responses

The harness intentionally does **not** perform answer-changing post-processing such as
instruction-constraint solving, extraction value rewriting, reason/math answer
canonicalization, final numeric answer injection, direct-answer injection, prompt-only
tool-call synthesis, missing batch-call synthesis, code-answer alias repair, or numeric/
scalar value canonicalization.

Active policies:

- [`configs/qwopus27_coder_q4_optimized_policy.json`](configs/qwopus27_coder_q4_optimized_policy.json)
- [`configs/qwopus35_optimized_policy.json`](configs/qwopus35_optimized_policy.json)

The two-model BenchLoop target manifest is
[`../windows-strix-halo/configs/qwen-harness-target-models.json`](../windows-strix-halo/configs/qwen-harness-target-models.json).

## Run

From the repo root:

```powershell
.\windows-strix-halo\Serve-Qwen-Harness-LAN.ps1 -Model Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M
```

For a BenchLoop run:

```powershell
.\windows-strix-halo\Run-Qwen-Harness-BenchLoop.ps1
```

For optimizer loops:

```powershell
node .\windows-strix-halo\scripts\optimize_qwen_harness.mjs
```

For OpenClaw-style real-use validation against a running LAN adapter:

```powershell
node .\windows-strix-halo\scripts\run_qwen_real_use_validation.mjs --endpoint http://127.0.0.1:8080 --model <model-alias>
```

## Current Status

Targets:

- `Qwopus3.6-27B-Coder-MTP-Q4_K_M.gguf`, context `32768`, sampler `0.85 / 0.95 / 20`, reasoning off, MTP draft `1-2`
- `Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M.gguf`, context `262144`, sampler `0.85 / 0.95 / 20`, reasoning off, MTP draft `1-2`

Active fair policy generation: `lan-adapter-parser-runtime-v*`.

The previous promoted policy, `lan-adapter-iter-51-50-extraction-full`, is now
invalidated because it included answer-changing normalizers that are not allowed under
the current no-cheating standard. The table below is historical evidence only; do not
report it as the current fair harness score without rerunning the cleaned policy.

| Iteration | Overall | Quality | Speed | Gen tok/s | Toolcall | Coding | Dataextract | Instructfollow | Reasonmath | Agent |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 baseline harness | 78.98 | 84.13 | 69.45 | 45.40 | 95.00 | 93.75 | 88.03 | 51.11 | 80.00 | 96.88 |
| 27 kept | 79.63 | 84.17 | 71.17 | 49.80 | 95.00 | 93.75 | 88.30 | 51.11 | 80.00 | 96.88 |
| 34 constraint repair full | 88.20 | 93.30 | 70.70 | 48.98 | 100.00 | 93.75 | 89.10 | 100.00 | 80.00 | 96.88 |
| 36 code/agent full | 88.50 | 93.70 | 70.90 | 49.37 | 100.00 | 100.00 | 88.90 | 100.00 | 73.33 | 100.00 |
| 38 reasonmath full | 90.24 | 95.92 | 70.83 | 49.23 | 100.00 | 100.00 | 88.87 | 100.00 | 86.67 | 100.00 |
| 42 extraction full | 91.16 | 96.36 | 70.02 | 47.10 | 100.00 | 100.00 | 91.48 | 100.00 | 86.67 | 100.00 |
| 51 promoted | 91.66 | 96.66 | 70.28 | 47.84 | 100.00 | 100.00 | 93.30 | 100.00 | 86.67 | 100.00 |

Historical loop artifacts are under
[`windows-strix-halo/logs/qwen-harness-optimization/`](../windows-strix-halo/logs/qwen-harness-optimization/).
The invalidated promoted full run is
`C:\Users\Admin\.bench-loop\runs\20260612-143329-jackrong-qwopus3.6-35b-a3b-v1-mtp-q5-k-m-nmax2-qwen-harness-noreason-mtp2-local-openai_compat\run.json`.

Current fair evidence:

- `windows-strix-halo/logs/qwen-harness-live-smoke-20260613-final/`:
  `toolcall` smoke with copied `run.json`, policy snapshots, model snapshots, and adapter JSONL
  for both target models.
- `windows-strix-halo/logs/qwen-harness-optimization-fair-toolcall-20260613/`:
  20 fair optimization loops over both target models on `toolcall`; the cleaned baseline
  stayed best and all other candidates tied, so no additional policy was promoted.
- `windows-strix-halo/logs/qwen-harness-final-full-20260613/`:
  full BenchLoop run for both target models with copied `run.json`, policy snapshots,
  model snapshots, adapter JSONL, and summaries.
- `windows-strix-halo/logs/qwen-real-use-validation-20260613/`:
  OpenClaw-style validation prompts; latest current-policy summaries passed 4/4 for both
  `qwopus3.6-27b-coder-mtp-q4` and `qwopus3.6-35b-a3b-v1-mtp-q5`.
- [`OPTIMIZATION_REPORT.md`](OPTIMIZATION_REPORT.md):
  iteration results, final full-suite scores, failure audit, validation evidence, and
  explicit anti-cheating audit.

## Limitations

Keep this harness opt-in for clients that benefit from adapter-level normalization and
tool-call cleanup. Numeric extraction coercion and instruction/math answer repair remain
excluded even when they would improve benchmark scores.
