# Agent Progress

## Goal

Continuously improve the Gemma 4 harness and make it as concise and lightweight as possible without reducing quality, over a target of at least 200 safe loops.

## Definition of Done

- Complete at least 200 safe Gemma harness improvement loops.
- Keep policy behavior changes tied to BenchLoop reruns before reporting scores as current.
- Preserve no-cheat boundaries for BenchLoop, OpenClaw/ClawBench, Hermes Agent, opencode, and other OpenAI-compatible clients.
- Keep `gemma4_harness` tests passing after each code loop.

## Current State

- Active serve script: `macos-m1-pro/scripts/run_gemma4_12b_promoted_serve.sh`
- Active BenchLoop rerun script: `macos-m1-pro/scripts/run_gemma4_12b_harness_optimized.sh`
- Active harness policy: `gemma4_harness/configs/gemma4_qat_q4_optimized_policy.json`
- Current validated 12B harness result: `macos-m1-pro/results/benchloop/gemma4-12b-policy-20iter-20260612T100148Z/iter186-restore-safe-baseline-full/`
- Score: overall 76.7188, quality 86.4983, speed 44.60, reliability 80.8989.
- Loop progress: 200/200 completed.
- Current `gemma4_harness/proxy.mjs` size: 2852 lines, 116587 bytes.

## Active Boundaries

- Keep benchmark/client prompts, schemas, rubrics, task answers, browser state, tool formats, and expected actions unmodified.
- Do not add prompt-derived direct answers, prompt-to-tool-call synthesis, prompt-specific answer formatting, benchmark coding replacements, phrase/word transforms, or client-specific website/action heuristics.
- Run BenchLoop after policy behavior changes before treating scores as current.
- Docs-only cleanup does not require a BenchLoop rerun.

## Completed Cleanup

- Removed the root docs folder by moving the client compatibility note to `macos-m1-pro/docs/gemma4-harness-clients.md`.
- Removed the historical Gemma 4 iteration schedule and obsolete sweep-analysis scripts.
- Replaced the long merged progress history with this compact current-state note.

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
- `node test.mjs` in `gemma4_harness` passed after each completed loop from 018 through 200; current suite count is 267/267.
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
