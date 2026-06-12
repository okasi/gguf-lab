# Qwen/Qwopus BenchLoop Harness

LAN-adapter compatible post-processor for Qwopus/Qwen OpenAI-compatible chat completions.
It keeps the upstream prompt and BenchLoop tool schemas intact, then applies general response
normalization after llama.cpp returns:

- sampler enforcement for the Qwopus 35B profile (`temp=0.85`, `top_p=0.95`, `top_k=20`)
- Qwen reasoning/end-token cleanup
- generic JSON scalar and numeric cleanup
- generic Python/JavaScript/TypeScript fence extraction
- OpenAI tool-call normalization from tags, JSON blobs, function syntax, and active tool schemas
- bounded retries for empty, malformed structured output, or missing tool-call responses

The harness intentionally does **not** perform answer-changing post-processing such as
instruction-constraint solving, extraction value rewriting, reason/math answer
canonicalization, final numeric answer injection, direct-answer injection, prompt-only
tool-call synthesis, missing batch-call synthesis, or code-answer alias repair.

The active policy is [`configs/qwopus35_optimized_policy.json`](configs/qwopus35_optimized_policy.json).

## Run

From the repo root:

```powershell
.\windows-strix-halo\Serve-Qwopus35-Harness-LAN.ps1
```

For a BenchLoop run:

```powershell
.\windows-strix-halo\Run-Qwen-Harness-BenchLoop.ps1
```

For optimizer loops:

```powershell
node .\windows-strix-halo\scripts\optimize_qwen_harness.mjs
```

## Current Status

Target: `Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M.gguf`, context `262144`, sampler
`0.85 / 0.95 / 20`, reasoning off, MTP draft `1-2`.

Active policy: `lan-adapter-no-answer-rewrite`.

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

The cleaned active policy has not yet been rerun after removing the answer-changing
normalizers.

## Limitations

Keep this harness opt-in for clients that benefit from adapter-level normalization and
tool-call cleanup. The current policy should be evaluated again before claiming a score.
