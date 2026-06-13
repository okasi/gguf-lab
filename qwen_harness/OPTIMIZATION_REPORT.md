# Qwen/Qwopus Harness Optimization Report

Date: 2026-06-13

## Scope

Targets:

- `Qwopus3.6-27B-Coder-MTP-Q4_K_M.gguf`, temp/top-p/top-k `0.85 / 0.95 / 20`, reasoning off, MTP draft `1-2`
- `Qwopus3.6-35B-A3B-v1-Q5_K_M.gguf` public label, served from the matching MTP Q5 file with temp/top-p/top-k `0.85 / 0.95 / 20`, reasoning off, MTP draft `1-2`

The harness uses `lan-adapter.js` plus `qwen_harness/processor.mjs`. It does not modify prompts, tool schemas, or tool-call formats sent by the client.

## Final Policies

| Model | Policy | Decision |
|---|---|---|
| 27B Coder Q4 | `qwen_harness/configs/qwopus27_coder_q4_optimized_policy.json` | Keep model-specific policy. |
| 35B A3B Q5 | `qwen_harness/configs/qwopus35_optimized_policy.json` | Keep model-specific policy. |

Both policies are parser/runtime policies only: sampler enforcement, reasoning/end-token cleanup, JSON envelope/fence cleanup that preserves emitted values, code-fence extraction, emitted tool-call parsing/normalization, bounded retries, and trace logging.

## Reproducible Commands

Unit tests:

```powershell
cd C:\Users\Admin\Documents\Developer\local-llm\qwen_harness
npm test
```

Thirty-loop optimizer pass:

```powershell
node C:\Users\Admin\Documents\Developer\local-llm\windows-strix-halo\scripts\optimize_qwen_harness.mjs `
  --out-dir C:\Users\Admin\Documents\Developer\local-llm\windows-strix-halo\logs\qwen-harness-optimization-fair-toolcall-20260613 `
  --suites toolcall `
  --end 30 `
  --promote-policy C:\Users\Admin\Documents\Developer\local-llm\windows-strix-halo\logs\qwen-harness-optimization-fair-toolcall-20260613\promoted-policy-21-30.json
```

Final full BenchLoop run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File C:\Users\Admin\Documents\Developer\local-llm\windows-strix-halo\Run-Qwen-Harness-BenchLoop.ps1 `
  -OutDir C:\Users\Admin\Documents\Developer\local-llm\windows-strix-halo\logs\qwen-harness-final-full-20260613 `
  -IterationLabel final-full-current-policy `
  -Reasoning off `
  -AliasSuffix -qwen-harness-final-noreason-mtp2 `
  -SpecDraftNMaxOverride 2 `
  -SuitesOverride speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent
```

Real-use validation against a running LAN endpoint:

```powershell
node C:\Users\Admin\Documents\Developer\local-llm\windows-strix-halo\scripts\run_qwen_real_use_validation.mjs `
  --endpoint http://127.0.0.1:<adapter-port> `
  --model <public-model-alias>
```

## Optimization Iterations

Artifacts: `windows-strix-halo/logs/qwen-harness-optimization-fair-toolcall-20260613/`

The optimizer ran 30 candidate policies over both target models on the `toolcall` suite. Every run kept raw logs, adapter JSONL, policy/model snapshots, copied `run.json`, and per-run summaries.

| Result | Iterations |
|---|---|
| Kept | `01-baseline`, overall `65.83425`, quality/toolcall `83.335` |
| Rejected ties | `02-no-code-extraction`, `03-no-tool-arg-normalize`, `04-no-dedupe`, `05-tagged-tools-only`, `06-json-tools-only`, `07-no-function-syntax`, `08-no-escaped-json`, `09-no-markdown-fence-strip`, `10-json-repair-off`, `11-retry-empty-1`, `12-retry-json-1`, `13-retry-missing-tool-1`, `14-retry-python-1`, `15-retry-typescript-1`, `16-retry-json-tool-2`, `17-retry-code-2`, `18-retry-full-2`, `19-retry-full-3`, `20-parser-full-retry-1`, `21-parser-full-retry-2`, `22-parser-full-retry-2-no-code-extract`, `23-parser-full-retry-2-no-tool-normalize`, `24-parser-full-retry-2-no-dedupe`, `25-no-truncated-reasoning-retry`, `26-truncated-reasoning-cap-2048`, `27-truncated-reasoning-cap-8192`, `28-retry-full-2-no-missing-tool-retry`, `29-parser-full-retry-2-json-strict`, `30-parser-full-retry-2-no-function-syntax` |

No candidate beat the cleaned baseline, so no extra optimizer-generated policy was promoted.

## Final Full BenchLoop Evidence

Artifacts: `windows-strix-halo/logs/qwen-harness-final-full-20260613/`

| Model | Overall | Quality | Speed | Reliability | Gen tok/s | Toolcall | Coding | Dataextract | Instructfollow | Reasonmath | Agent |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 27B Coder Q4 | 74.59 | 82.28 | 52.59 | 75.28 | 17.80 | 75.00 | 93.75 | 86.92 | 67.78 | 73.33 | 96.88 |
| 35B A3B Q5 | 76.95 | 81.64 | 70.36 | 71.91 | 48.25 | 91.67 | 93.75 | 83.07 | 51.11 | 73.33 | 96.88 |

Adapter audit:

| Model | Calls | Retries | Structural repairs observed |
|---|---:|---|---|
| 27B Coder Q4 | 119 | `malformed_python` x3 | think stripping x6, existing tool-call normalization x23, Python fence extraction x11, JSON envelope repair x15 |
| 35B A3B Q5 | 118 | none | think stripping x4, existing tool-call normalization x21, Python fence extraction x12, JSON envelope repair x15 |

Server logs confirmed reasoning off and MTP draft `n_max=2`. The 35B run used `--ctx-size 262144`; the 27B run used `--ctx-size 32768`.

## Failure Audit

Raw failed outputs remain in each copied `run.json` under `run-json/`.

Important failure patterns:

- Tool calls: 27B missed or over-used tools on `tc-03`, `tc-05`, `tc-11`, `tc-15`; 35B missed `tc-03` and partially missed `tc-15`.
- Coding: 27B failed `coding-rate-limiter`; 35B failed `coding-lru-cache` by naming the class `LRU_Cache` instead of `LRUCache`.
- Data extraction: several misses are numeric strings such as `"$4.75"` or `"$1,299"` where the evaluator expected numbers. These were deliberately not fixed in the harness because that would be extraction value rewriting.
- Instruction following: failures were line counts, exact word counts, sorting/order constraints, and exact format constraints. The removed `normalize_instruction_constraints` style of repair would have improved these unfairly, so no harness fix was promoted.
- Reason/math: failures were actual model reasoning errors, including non-unique ordering, Monty Hall probability wording, bathtub fill time, and compound interest. The removed reasonmath/final numeric normalizers would be cheating here.
- Agent: both models lost points on the stock portfolio final value formatting/rounding despite calling required tools.

No failure suggested a general parser/runtime improvement that was both production-safe and non-semantic.

## Real-Use Validation

Prompts: `qwen_harness/real_use_validation_prompts.json`

Latest current-policy summaries:

- 35B MTP Q5: `windows-strix-halo/logs/qwen-real-use-validation-20260613/20260612T235508Z-qwopus3.6-35b-a3b-v1-mtp-q5-summary.json`, 4/4 passed.
- 27B Coder Q4: `windows-strix-halo/logs/qwen-real-use-validation-20260613/20260612T235649Z-qwopus3.6-27b-coder-mtp-q4-summary.json`, 4/4 passed.

The 35B validation shows the truncated-reasoning retry doing the intended thing: repeat the same request with a higher token budget, without rewriting the model output.

## Anti-Cheating Audit

Forbidden production behaviors are absent:

- No semantic post-processing.
- No extraction value rewriting.
- No math/date/unit/value/reasoning canonicalization.
- No final/direct answer injection.
- No missing tool-call synthesis.
- No code semantic repair.
- No benchmark-specific task IDs, answers, expected outputs, or dataset branches in the harness or active policies.

The production forbidden-name scan across `qwen_harness/processor.mjs`, active configs, runner scripts, and validation scripts found hits only in the optimizer's guard list. Active policy files do not enable any forbidden flags. `normalize_tool_args` is limited to model-emitted tool calls and declared JSON schema coercion/defaults; it does not create a call from the prompt alone. JSON repair is limited to preserving already emitted content by removing wrappers/fences or completing obvious syntax envelopes.

## Remaining Limitations

- The harness improves compatibility, not model intelligence; exact instruction following and arithmetic remain model weaknesses.
- Numeric extraction coercion would raise benchmark scores but is intentionally excluded.
- The 27B policy is slower and weaker at tool calling than 35B, but it is competitive on coding and agent tasks.
- The 35B policy is faster and stronger on tool calls, but weaker on strict instruction-following in this run.
- OpenClaw/Hermes behavior is expected to benefit from the harness for malformed structure and retries, but only the included real-use validation prompts were run here, not a full live OpenClaw task suite.
