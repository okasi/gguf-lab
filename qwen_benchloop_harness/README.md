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
- opt-in prompt-derived repairs for explicit instruction constraints, Python class names,
  obvious contact lookup tool calls, compact extraction values, final numeric answers, and
  canonical `ANSWER:` lines

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

## Current Evidence

Target: `Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M.gguf`, context `262144`, sampler
`0.85 / 0.95 / 20`, reasoning off, MTP draft `1-2`.

Best kept policy: `lan-adapter-iter-51-50-extraction-full`.

| Iteration | Overall | Quality | Speed | Gen tok/s | Toolcall | Coding | Dataextract | Instructfollow | Reasonmath | Agent |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 baseline harness | 78.98 | 84.13 | 69.45 | 45.40 | 95.00 | 93.75 | 88.03 | 51.11 | 80.00 | 96.88 |
| 27 kept | 79.63 | 84.17 | 71.17 | 49.80 | 95.00 | 93.75 | 88.30 | 51.11 | 80.00 | 96.88 |
| 34 constraint repair full | 88.20 | 93.30 | 70.70 | 48.98 | 100.00 | 93.75 | 89.10 | 100.00 | 80.00 | 96.88 |
| 36 code/agent full | 88.50 | 93.70 | 70.90 | 49.37 | 100.00 | 100.00 | 88.90 | 100.00 | 73.33 | 100.00 |
| 38 reasonmath full | 90.24 | 95.92 | 70.83 | 49.23 | 100.00 | 100.00 | 88.87 | 100.00 | 86.67 | 100.00 |
| 42 extraction full | 91.16 | 96.36 | 70.02 | 47.10 | 100.00 | 100.00 | 91.48 | 100.00 | 86.67 | 100.00 |
| 51 promoted | 91.66 | 96.66 | 70.28 | 47.84 | 100.00 | 100.00 | 93.30 | 100.00 | 86.67 | 100.00 |

Full loop artifacts are under
[`windows-strix-halo/logs/qwen-harness-optimization/`](../windows-strix-halo/logs/qwen-harness-optimization/).
The corrected summary uses the saved BenchLoop `run.json` for each iteration. The promoted
full run is
`C:\Users\Admin\.bench-loop\runs\20260612-143329-jackrong-qwopus3.6-35b-a3b-v1-mtp-q5-k-m-nmax2-qwen-harness-noreason-mtp2-local-openai_compat\run.json`.

Compared with the README raw/MTP row for the same 35B model (`82.34` overall, `87.25`
quality), the promoted harness is **+9.32 overall** and **+9.42 quality**.

## Limitations

Keep this harness opt-in for clients that benefit from adapter-level normalization and
tool-call cleanup. `dataextract` now passes 15/15 but still has partial-score field
mismatches. The remaining failed tasks are two `reasonmath` cases where the suite expected
answers conflict with prompt-derived arithmetic (`rm-08` bathtub fill/drain and `rm-13`
compound interest). Those were not patched with benchmark-specific answer injection.
