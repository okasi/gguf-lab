# Agent Progress

## Goal

Maintain the general Gemma 4 harness on macOS M1 Pro so it works well with BenchLoop, OpenClaw/ClawBench, Hermes Agent, opencode, and other OpenAI-compatible agent clients without benchmark-specific cheats.

## Current State

- Active serve script: `macos-m1-pro/scripts/run_gemma4_12b_promoted_serve.sh`
- Active BenchLoop rerun script: `macos-m1-pro/scripts/run_gemma4_12b_harness_optimized.sh`
- Active harness policy: `gemma4_harness/configs/gemma4_qat_q4_optimized_policy.json`
- Current validated 12B harness result: `macos-m1-pro/results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter186-restore-safe-baseline-full/`
- Score: overall 76.7188, quality 86.4983, speed 44.60, reliability 80.8989.

## Active Boundaries

- Keep benchmark/client prompts, schemas, rubrics, task answers, browser state, tool formats, and expected actions unmodified.
- Do not add prompt-derived direct answers, prompt-to-tool-call synthesis, prompt-specific answer formatting, benchmark coding replacements, phrase/word transforms, or client-specific website/action heuristics.
- Run BenchLoop after policy behavior changes before treating scores as current.
- Docs-only cleanup does not require a BenchLoop rerun.

## Completed Cleanup

- Removed the root docs folder by moving the client compatibility note to `macos-m1-pro/docs/gemma4-harness-clients.md`.
- Removed the historical Gemma 4 iteration schedule and obsolete sweep-analysis scripts.
- Replaced the long merged progress history with this compact current-state note.

## Validation

- `npm test` in `gemma4_harness` passed 263/263 after the no-cheat cleanup.
- Production cheat-symbol audit passed after the no-cheat cleanup.
- `git diff --check` passed after docs consolidation.

## Blockers

- None.
