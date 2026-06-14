# Agent Progress

## Goal

Continuously improve the Gemma 4 harness and make it as concise and lightweight as possible without reducing quality, over a target of at least 200 safe loops.

## Definition of Done

- Complete at least 3 safe shared E2B/E4B/12B/26B Gemma harness policy loops.
- Keep policy behavior changes tied to BenchLoop reruns before reporting scores as current.
- Preserve no-cheat boundaries for BenchLoop, OpenClaw/ClawBench, Hermes Agent, opencode, and other OpenAI-compatible clients.
- Keep `gemma4_harness` tests passing after each code loop.

## Current State

- Active serve script: `macos-m1-pro/scripts/run_gemma4_12b_promoted_serve.sh`
- Active BenchLoop rerun script: `macos-m1-pro/scripts/run_gemma4_12b_harness_optimized.sh`
- Active harness policy: `gemma4_harness/configs/gemma4_qat_q4_optimized_policy.json`
- Current validated 12B harness result: `macos-m1-pro/results/benchloop/gemma4-12b-quality-goal-20260613/loop-03-temp090/`
- Score: overall 78.9760, quality 87.1533, speed 52.68, reliability 82.0225.
- Current 26B check for the same policy: `macos-m1-pro/results/benchloop/gemma4-26b-quality-goal-20260613/temp090/` — overall 78.7599, quality 84.5233, speed 64.45, reliability 77.5281.
- Loop progress: 200/200 cleanup loops completed; 5/5 12B sampler-policy quality loops completed on 2026-06-13; 3/3 active shared 12B+26B policy loops completed on 2026-06-14; E2B/E4B current-policy gate completed on 2026-06-14.
- Current `gemma4_harness/proxy.mjs` size: 2863 lines, 118855 bytes.

## Active Boundaries

- Keep benchmark/client prompts, schemas, rubrics, task answers, browser state, tool formats, and expected actions unmodified.
- Do not add prompt-derived direct answers, prompt-to-tool-call synthesis, prompt-specific answer formatting, benchmark coding replacements, phrase/word transforms, or client-specific website/action heuristics.
- Run BenchLoop after policy behavior changes before treating scores as current.
- Docs-only cleanup does not require a BenchLoop rerun.

## Active Shared E2B/E4B/12B/26B Quality Goal (2026-06-14)

- Objective: improve shared E2B, E4B, 12B, and 26B BenchLoop quality without cheats while keeping the harness general for OpenClaw/ClawBench, Hermes Agent, opencode, BenchLoop, and other OpenAI-compatible agent clients.
- Definition of done: at least 3 tracked safe loops; every policy behavior change must have BenchLoop evidence before scores are treated as current; no benchmark-specific answer/tool/action synthesis, phrase/word transforms, prompt/schema rewriting, or client-specific action heuristics; selected policy must improve E2B, E4B, 12B, and 26B quality before all-size promotion.
- Current evaluated shared policy: `shared-current-best-temp090` using `temperature=0.90`, `top_p=0.95`, `top_k=64`.
- Current selected 12B result: `results/benchloop/gemma4-12b-quality-goal-20260613/loop-03-temp090/` — overall 78.9760, quality 87.1533, speed 52.68, reliability 82.0225.
- Current selected 26B result: `results/benchloop/gemma4-26b-quality-goal-20260613/temp090/` — overall 78.7599, quality 84.5233, speed 64.45, reliability 77.5281.
- E2B/E4B current-policy gate: `results/benchloop/gemma4-e2b-e4b-current-policy-rerun-20260614/` used the no-cap matrix defaults (`f16` KV) and found raw better than the evaluated shared policy. E2B raw 79.6631 overall / 84.1217 quality vs harness 75.6018 / 80.1800. E4B raw 77.6922 / 83.3200 vs harness 75.3981 / 81.1683. Outcome: `shared-current-best-temp090` remains useful for 12B/26B but is not an all-size promoted policy. Disallowed repair grep over proxy jsonl returned no hits; `node --check gemma4_harness/proxy.mjs`, `git diff --check`, and `npm test` passed.
- All-size candidate 001 (`temperature=0.90`, `top_p=0.90`, `top_k=64`) failed the E2B gate: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-001-topp090-e2e4-gate/` scored E2B overall 76.3804 / quality 81.9050 vs raw 79.6631 / 84.1217. Stopped before E4B because it cannot be all-size promoted.
- All-size candidate 002 (`temperature=0.95`, `top_p=0.90`, `top_k=64`) failed the E2B gate: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-002-temp095-topp090-e2-gate/` scored E2B overall 78.4388 / quality 82.6350 vs raw 79.6631 / 84.1217. Disallowed repair grep over proxy jsonl returned no hits.
- All-size candidate 003 (`temperature=1.00`, `top_p=0.90`, `top_k=64`) failed the E2B gate: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-003-temp100-topp090-e2-gate/` scored E2B overall 75.9357 / quality 80.5433 vs raw 79.6631 / 84.1217. Disallowed repair grep over proxy jsonl returned no hits.
- All-size candidate 004 (`temperature=0.95`, `top_p=0.925`, `top_k=64`) failed the E2B gate: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-004-temp095-topp0925-e2-gate/` scored E2B overall 77.3142 / quality 81.0683 vs raw 79.6631 / 84.1217. Disallowed repair grep over proxy jsonl returned no hits.
- All-size candidate 005 (`temperature=0.95`, `top_p=0.95`, `top_k=64`) failed the E2B gate: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-005-temp095-e2-gate/` scored E2B overall 76.4531 / quality 81.2167 vs raw 79.6631 / 84.1217. Disallowed repair grep over proxy jsonl returned no hits.
- All-size candidate 006 (`temperature=0.80`, `top_p=0.95`, `top_k=64`) failed the E2B gate: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-006-temp080-e2-gate/` scored E2B overall 76.3223 / quality 80.8067 vs raw 79.6631 / 84.1217. Disallowed repair grep over proxy jsonl returned no hits.
- All-size candidate 007 (`temperature=0.95`, `top_p=0.90`, `top_k=64`, `normalize_tool_args=true`, `dedupe_tool_calls=true`) failed the E2B gate: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-007-toolnorm-e2-gate/` scored E2B overall 77.6742 / quality 82.0683 vs raw 79.6631 / 84.1217. Disallowed repair grep over proxy jsonl returned no hits.
- E4B follow-up for candidate 002 (`temperature=0.95`, `top_p=0.90`, `top_k=64`): `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-002-temp095-topp090-e4-gate/` scored E4B overall 73.2971 / quality 79.6717 vs raw 77.6922 / 83.3200 and current-policy harness 75.3981 / 81.1683. Disallowed repair grep over proxy jsonl returned no hits.
- Outcome of the active all-size search: no tested no-cheat shared policy improved all four models. The policy JSON was restored to `shared-current-best-temp090` because it remains the best measured no-cheat 12B+26B policy, with `all_size_gate.status=failed`.
- Loop 001 tested `temperature=1.00`, `top_p=0.95`, `top_k=64` on both models. 12B: overall 72.7571, quality 82.6250, speed 43.87, reliability 74.1573. 26B: overall 79.2358, quality 85.9833, speed 61.41, reliability 78.6517. Outcome: rejected as shared policy because it improved 26B but regressed 12B.
- Loop 002 tested `temperature=0.92`, `top_p=0.95`, `top_k=64` on both models. 12B: overall 76.3978, quality 85.9450, speed 48.73, reliability 77.5281. 26B: overall 77.4314, quality 84.1900, speed 57.32, reliability 78.6517. Outcome: rejected because it regressed quality and overall on both selected 12B and selected 26B baselines.
- Loop 003 tested `temperature=0.90`, `top_p=0.95`, `top_k=80` on both models. 12B: overall 77.3492, quality 86.9900, speed 46.40, reliability 80.8989. 26B: overall 74.8121, quality 80.8850, speed 58.93, reliability 74.1573. Outcome: rejected because it failed to improve 12B quality and regressed 26B quality.
- Progress: 3/3 12B+26B policy loops plus the E2B/E4B current-policy gate completed for this goal; no policy has yet beaten raw or improved quality across all four model sizes.

## Completed Cleanup

- Removed the root docs folder by moving the client compatibility note to `macos-m1-pro/docs/gemma4-harness-clients.md`.
- Removed the historical Gemma 4 iteration schedule and obsolete sweep-analysis scripts.
- Replaced the long merged progress history with this compact current-state note.

## Completed Policy Quality Goal (2026-06-13)

- Ran five full 12B BenchLoop policy loops after each sampler-only policy change; no prompt-derived answers, prompt-to-tool synthesis, phrase/word transforms, prompt/schema rewriting, or benchmark-specific formatting were added.
- Best 12B policy: `current-best-temp090` (`temperature=0.90`, `top_p=0.95`, `top_k=64`) from `results/benchloop/gemma4-12b-quality-goal-20260613/loop-03-temp090/`.
- 12B best score: overall 78.9760, quality 87.1533, speed 52.68, reliability 82.0225; suites agent 96.88, coding 100, dataextract 79.38, instructfollow 83.33, reasonmath 80.00, toolcall 83.33.
- 26B check with the selected policy: overall 78.7599, quality 84.5233, speed 64.45, reliability 77.5281; suites agent 96.88, coding 100, dataextract 81.37, instructfollow 72.23, reasonmath 73.33, toolcall 83.33.
- Loop outcomes: baseline 76.7188/86.4983 overall/quality; loop 1 temp 0.80 = 78.1821/85.7917; loop 2 top_p 0.90 = 78.0832/86.2133; loop 3 temp 0.90 = 78.9760/87.1533; loop 4 temp 0.95 = 76.8534/84.6700; loop 5 temp 0.90 top_k 48 = 76.6993/84.0733.

## Completed Loops

- Loop 001, concise ID generation: added compact ID helpers, replaced repeated UUID-slice expressions, and removed two unused schema helpers from `gemma4_harness/proxy.mjs`. Result: `proxy.mjs` shrank from 2889 to 2876 lines and from 121400 to 120478 bytes. `npm test` passed 263/263; policy behavior fields were unchanged, so no BenchLoop rerun was required.
- Loop 002, concise elapsed timing: added `elapsedMs(started)` and replaced repeated elapsed-time formatting in request diagnostics. Result after loops 001-002: `proxy.mjs` is 2877 lines and 120357 bytes. `npm test` passed 263/263; no policy behavior changed.
- Loop 003, concise content-type fallback: added `responseContentType(headers)` and replaced repeated upstream header fallback expressions. Result after loops 001-003: `proxy.mjs` is 2878 lines and 120297 bytes. `npm test` passed 263/263; no policy behavior changed.
- Loop 004, concise request-body validation: added `badJsonBody(reply)` and reused `isPlainObject(requestPayload)` for the three JSON route guards. `npm test` passed 263/263; no policy behavior changed.
- Loop 005, concise retry limit: added `maxAttempts(policy)` and replaced repeated retry-count expressions in the three non-streaming routes. `npm test` passed 263/263; no policy behavior changed.
- Loop 006, removed an unused JavaScript parser helper parameter. `npm test` passed 263/263; no policy behavior changed.
- Loop 007, added `uniqueTrimmed(values)` for repeated candidate trim/dedupe cleanup in JSON/Python/JavaScript extraction. `npm test` passed 263/263; no policy behavior changed.
- Loop 008, removed the one-line `looksLikeJsonRequest()` wrapper and called `jsonFormatRequest()` directly. `npm test` passed 263/263; no policy behavior changed.
- Loop 009, inlined the one-use `jsonStringLength()` helper. `npm test` passed 263/263; no policy behavior changed.
- Loop 010, shared fenced-code candidate cleaning between Python and JavaScript extraction. `npm test` passed 263/263; no policy behavior changed.
- Loop 011, shared absolute URL validation between URI and IRI schema formats. `npm test` passed 263/263; no policy behavior changed.
- Loop 012, collapsed identical IRI-reference validation onto URI-reference validation. `npm test` passed 263/263; no policy behavior changed.
- Loop 013, shared email host parsing between email and IDN-email schema formats. `npm test` passed 263/263; no policy behavior changed.
- Loop 014, added `hasOwn(value, key)` and replaced repeated `hasOwnProperty.call` boilerplate in schema handling. `npm test` passed 263/263; no policy behavior changed.
- Loop 015, reused `isPlainObject()` in argument parsing and local `$ref` schema resolution. `npm test` passed 263/263; no policy behavior changed.
- Loop 016, reused `isPlainObject()` in object-property schema handling. `npm test` passed 263/263; no policy behavior changed.
- Loop 017, reused `isPlainObject()` in schema enum, conditional, dependency, and contains checks. `npm test` passed 263/263; no policy behavior changed.
- Loops 018-020, hoisted code-fence language sets, avoided retry-language array allocation, and shared Responses role normalization. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 021-024, reused `isPlainObject()` across format, schema-composition, discriminator, message, media, and tool-call guards. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 025-030, hoisted parser plugins and schema/request key lists, added `hasAnyOwn`, `firstDefined`, and `copyDefined` to reduce repeated allocation and adapter boilerplate. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 031-039, shared JSON buffer creation, function argument serialization, content-part joining, Responses message/content output helpers, and incomplete-status mapping. `node test.mjs` passed after fixes; no policy behavior changed.
- Loops 040-045, removed IRI/email wrappers, tightened Responses object guards, and shared response send helpers across passthrough and final route replies. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 046-049, removed `matchAll()` array materialization and shared fenced-code candidate and parseable-prefix normalization across Python and JavaScript extraction. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 050-057, added small key-presence, empty-delete, string, whitespace, and validation-regex helpers for schema and format handling. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 058-069, reused string/nil/uniqueness helpers across content adapters, tool parsing, schema coercion, and Responses/Completions adapters. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 070-078, centralized schema property fallbacks, allowed-property sets, delimiter helpers, and object dependency validation helpers. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 079-085, shared object required/property-count checks, array length/contains checks, JSON-start checks, and remaining nil guards. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 086-090, added `isDefined()` and reused it across payload normalization, schema coercion/merge checks, Responses metadata, completion max tokens, and CLI overrides. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 091-097, added object-like and array fallback helpers and reused them in JSON pointer/anchor traversal, schema guards, sort/output adapters, tool normalization, and dependency checks. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 098-105, shared schema array/object/union helpers and fence-language extraction across code inference and schema coercion/validation. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 106-114, reused string, defined, first-array, and number helpers in schema refs, adapters, retry checks, completions choices, numeric bounds, and response timestamps. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 115-125, shared allOf/anyOf/oneOf/enum and object-entry helpers across schema composition, validation, merge, and sorting paths. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 126-134, expanded object/array helper reuse across schema loops, deep equality, anchor traversal, content normalization, tool-call parsing, and adapter branches. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 135-143, added boolean, JSON text/buffer, and retry-attempt helpers; reused them in schema checks, serialization, upstream parsing, logging, and route retry bookkeeping. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 144-151, shared 5xx, invalid-JSON, retry-limit, and processed-attempt handling across the three non-streaming route loops. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 152-161, finished remaining array guard reuse, shared object construction, stream-attempt logging, and Responses stream body selection. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 162-176, tightened generic Responses/OpenAI adapter code by sharing call-id fallbacks, nullish output selection, function-tool guards, optional metadata fields, incomplete details, and typed SSE event construction. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 177-182, replaced repeated route JSONL log object construction across chat, Responses, and completions routes with one request-log helper. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 183-191, shared empty-buffer, stream-flag, content-type, error-status, timestamp, model-fallback, and long-ID helpers across route and adapter code. `node test.mjs` passed after each loop; no policy behavior changed.
- Loops 192-200, shared Responses function-call item construction, streaming tool-call accumulation, streamed delta extraction, adapter-parse metadata, and skipped-parse logging. `node test.mjs` passed after each loop; no policy behavior changed.

## Validation

- `npm test` in `gemma4_harness` passed 263/263 after the no-cheat cleanup.
- `npm test` in `gemma4_harness` passed 263/263 after loop 001.
- `npm test` in `gemma4_harness` passed 263/263 after loop 002.
- `npm test` in `gemma4_harness` passed 263/263 after loop 003.
- `npm test` in `gemma4_harness` passed 263/263 after each loop from 004 through 017.
- `node test.mjs` in `gemma4_harness` passed after each completed loop from 018 through 200; current suite count is 263/263.
- Active shared policy loop 001 completed paired 12B and 26B BenchLoop runs for `temperature=1.00`, `top_p=0.95`, `top_k=64`; rejected because 12B regressed.
- Active shared policy loop 002 completed paired 12B and 26B BenchLoop runs for `temperature=0.92`, `top_p=0.95`, `top_k=64`; rejected because both selected baselines regressed.
- Active shared policy loop 003 completed paired 12B and 26B BenchLoop runs for `temperature=0.90`, `top_p=0.95`, `top_k=80`; rejected because it did not improve both models.
- All-size non-sampler candidate 008 kept the selected sampler and enabled schema-aware tool-argument normalization plus tool-call dedupe. E2B BenchLoop gate scored overall 76.5522, quality 80.1100, speed 75.38, reliability 69.6629; rejected because it remained below clean E2B raw 79.6631/84.1217 overall/quality. Proxy audit grep was clean.
- All-size non-sampler candidate 009 kept the selected sampler, restored current tool settings, and disabled harness-level code extraction. E2B BenchLoop gate scored overall 76.2860, quality 82.4133, speed 66.31, reliability 70.7865; rejected because it remained below clean E2B raw and caused 36 malformed-Python retry attempts. Proxy audit grep was clean.
- All-size non-sampler candidate 010 kept code extraction disabled but also disabled malformed-code retries. E2B BenchLoop gate scored overall 76.4216, quality 80.0050, speed 76.42, reliability 68.5393; rejected because it remained below clean E2B raw and reduced coding/data/instruction quality. Proxy audit grep was clean.
- All-size non-sampler candidate 011 restored code extraction and disabled malformed-code retries. E2B BenchLoop gate scored overall 75.6672, quality 79.4350, speed 75.62, reliability 67.4157; rejected because it remained below clean E2B raw/current. Proxy audit grep was clean.
- All-size non-sampler candidate 012 restored selected parser behavior and reduced `max_retries` from 2 to 1. E2B BenchLoop gate scored overall 77.7266, quality 81.5617, speed 77.26, reliability 69.6629; best non-sampler candidate so far by overall but still rejected because it remained below clean E2B raw 79.6631/84.1217. Proxy audit grep was clean.
- Candidate 012 E4B follow-up scored overall 71.9210, quality 79.5167, speed 55.26, reliability 68.5393; rejected because it regressed below E4B current harness 75.3981/81.1683 and raw 77.6922/83.3200. Proxy audit grep was clean.
- All-size non-sampler candidate 013 restored selected parser behavior and set `max_retries=0`. E2B BenchLoop gate scored overall 75.5041, quality 78.7167, speed 76.78, reliability 67.4157; rejected because removing retries entirely hurt quality. Proxy audit grep was clean.
- All-size non-sampler candidate 014 restored selected parser behavior and disabled only malformed-JSON retries. E2B BenchLoop gate scored overall 73.0081, quality 77.3817, speed 70.78, reliability 65.1685; rejected because JSON retries/repair interplay is important for E2B quality. Proxy audit grep was clean.
- Candidate 015 attempted an E4B follow-up for the candidate-008 tool-normalization/dedupe policy, but the run was interrupted during the session handoff and logged only 30 proxy calls. Its low score is not counted as valid policy evidence; the selected policy was restored to `shared-current-best-temp090`.
- Post-loop-003 checks passed: policy JSON parse, `node --check gemma4_harness/proxy.mjs`, production no-cheat grep, `git diff --check`, and `npm test` in `gemma4_harness` at 263/263.
- Policy behavior-field check passed after loop 001.
- Policy behavior-field check passed after loop 085.
- Policy behavior-field check passed after loop 125.
- Policy behavior-field check passed after loop 161.
- Policy behavior-field check passed after loop 200.
- Production cheat-symbol audit passed after the no-cheat cleanup.
- Production no-cheat grep after loop 085 only hit explicit "not allowed" audit notes in docs/policy metadata; no production harness hits.
- Production no-cheat grep after loop 125 only hit explicit "not allowed" audit notes in docs/policy metadata; no production harness hits.
- Production no-cheat grep after loop 161 only hit explicit "not allowed" audit notes in docs/policy metadata; no production harness hits.
- Production no-cheat grep after loop 200 only hit explicit "not allowed" audit notes in docs/policy metadata; no production harness hits.
- `git diff --check` passed after docs consolidation.
- `node --check gemma4_harness/proxy.mjs` and `git diff --check` passed after loop 085.
- `node --check gemma4_harness/proxy.mjs` and `git diff --check` passed after loop 125.
- `node --check gemma4_harness/proxy.mjs` and `git diff --check` passed after loop 161.
- `node --check gemma4_harness/proxy.mjs` and `git diff --check` passed after loop 200.

## Failures and Fixes

- Loop 039 first test run failed because a refactor left one function-call output field reading the removed `outputStatus` variable; changed it to `status` and reran `node test.mjs` successfully.

## Blockers

- None.
