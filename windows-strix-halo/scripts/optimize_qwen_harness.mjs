#!/usr/bin/env node
/**
 * Iterative Qwen/Qwopus harness optimizer for lan-adapter + qwen_harness.
 * Runs unit tests then BenchLoop for each policy candidate; keeps the best defensible policy.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARNESS_DIR = path.join(REPO_ROOT, "qwen_harness");
const DEFAULT_BASE_POLICY_PATH = path.join(HARNESS_DIR, "configs/qwopus35_optimized_policy.json");
const RUN_PS1 = path.join(REPO_ROOT, "windows-strix-halo/Run-Qwen-Harness-BenchLoop.ps1");
const BENCHLOOP = path.join(REPO_ROOT, "windows-strix-halo/.venv-benchloop/Scripts/benchloop.exe");
const DEFAULT_MODELS_JSON = path.join(REPO_ROOT, "windows-strix-halo/configs/qwen-harness-target-models.json");
const DEFAULT_OUT = path.join(REPO_ROOT, "windows-strix-halo/logs/qwen-harness-optimization");

/** General-purpose policy iterations: parser/runtime/logging only, no answer or value rewriting. */
const CANDIDATES = [
  ["01-baseline", {}],
  ["02-no-code-extraction", { extract_python_code: false, extract_javascript_code: false }],
  ["03-no-tool-arg-normalize", { normalize_tool_args: false }],
  ["04-no-dedupe", { dedupe_tool_calls: false }],
  ["05-tagged-tools-only", { parse_json_tool_calls: false, parse_function_syntax: false }],
  ["06-json-tools-only", { parse_tagged_tool_calls: false, parse_function_syntax: false }],
  ["07-no-function-syntax", { parse_function_syntax: false }],
  ["08-no-escaped-json", { parse_escaped_json: false }],
  ["09-no-markdown-fence-strip", { strip_markdown_fences: false }],
  ["10-json-repair-off", { repair_json: false, retry_malformed_json: false }],
  ["11-retry-empty-1", { retry_empty: true, max_retries: 1 }],
  ["12-retry-json-1", { retry_malformed_json: true, max_retries: 1 }],
  ["13-retry-missing-tool-1", { retry_missing_tool_call: true, max_retries: 1 }],
  ["14-retry-python-1", { retry_malformed_python: true, max_retries: 1 }],
  ["15-retry-typescript-1", { retry_malformed_javascript: true, max_retries: 1 }],
  ["16-retry-json-tool-2", { retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, max_retries: 2 }],
  ["17-retry-code-2", { retry_empty: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
  ["18-retry-full-2", { retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
  ["19-retry-full-3", { retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 3 }],
  ["20-parser-full-retry-1", { parse_tagged_tool_calls: true, parse_json_tool_calls: true, parse_function_syntax: true, parse_escaped_json: true, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 1 }],
  ["21-parser-full-retry-2", { parse_tagged_tool_calls: true, parse_json_tool_calls: true, parse_function_syntax: true, parse_escaped_json: true, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
  ["22-parser-full-retry-2-no-code-extract", { extract_python_code: false, extract_javascript_code: false, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, max_retries: 2 }],
  ["23-parser-full-retry-2-no-tool-normalize", { normalize_tool_args: false, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
  ["24-parser-full-retry-2-no-dedupe", { dedupe_tool_calls: false, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
  ["25-no-truncated-reasoning-retry", { retry_truncated_reasoning: false }],
  ["26-truncated-reasoning-cap-2048", { retry_truncated_reasoning: true, retry_max_tokens_cap: 2048, max_retries: 2 }],
  ["27-truncated-reasoning-cap-8192", { retry_truncated_reasoning: true, retry_max_tokens_cap: 8192, max_retries: 2 }],
  ["28-retry-full-2-no-missing-tool-retry", { retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: false, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
  ["29-parser-full-retry-2-json-strict", { parse_tagged_tool_calls: true, parse_json_tool_calls: true, parse_function_syntax: true, parse_escaped_json: false, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
  ["30-parser-full-retry-2-no-function-syntax", { parse_tagged_tool_calls: true, parse_json_tool_calls: true, parse_function_syntax: false, parse_escaped_json: true, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
];

function parseArgs(argv) {
  const args = {
    outDir: DEFAULT_OUT,
    modelsJson: DEFAULT_MODELS_JSON,
    basePolicy: DEFAULT_BASE_POLICY_PATH,
    promotePolicy: DEFAULT_BASE_POLICY_PATH,
    modelNameFilter: "",
    start: 1,
    end: CANDIDATES.length,
    suites: "",
    skipBench: false,
    resume: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === "--out-dir") args.outDir = path.resolve(argv[++i]);
    else if (key === "--models-json") args.modelsJson = path.resolve(argv[++i]);
    else if (key === "--base-policy") args.basePolicy = path.resolve(argv[++i]);
    else if (key === "--promote-policy") args.promotePolicy = path.resolve(argv[++i]);
    else if (key === "--model-name-filter") args.modelNameFilter = argv[++i];
    else if (key === "--start") args.start = Number(argv[++i]);
    else if (key === "--end") args.end = Number(argv[++i]);
    else if (key === "--suites") args.suites = argv[++i];
    else if (key === "--skip-bench") args.skipBench = true;
    else if (key === "--resume") args.resume = true;
    else throw new Error(`Unknown argument: ${key}`);
  }
  return args;
}

function readJson(file) {
  let text = fs.readFileSync(file, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return JSON.parse(text);
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function run(cmd, cmdArgs, options = {}) {
  const result = spawnSync(cmd, cmdArgs, { stdio: "inherit", shell: false, ...options });
  if (result.status !== 0) {
    throw new Error(`${cmd} ${cmdArgs.join(" ")} failed with exit ${result.status}`);
  }
}

function policyForCandidate(basePolicy, iteration, name, patch) {
  const policy = {
    ...basePolicy,
    ...patch,
    version: `lan-adapter-iter-${String(iteration).padStart(2, "0")}-${name}`,
    metadata: {
      ...(basePolicy.metadata ?? {}),
      optimizer: "windows-strix-halo/scripts/optimize_qwen_harness.mjs",
      optimizer_iteration: iteration,
      optimizer_candidate: name,
      anti_cheat_boundary: "No semantic post-processing, value canonicalization, output injection, prompt mutation, dataset literals, or benchmark branches.",
      patch,
    },
  };
  assertDefensiblePolicy(policy);
  return policy;
}

function assertDefensiblePolicy(policy) {
  const forbiddenTrueFlags = [
    "coerce_numeric_json_values",
    "coerce_scalar_json_values",
    "normalize_instruction_constraints",
    "normalize_extraction_values",
    "canonicalize_reasonmath_answer_line",
    "normalize_final_numeric_answers",
    "synthesize_direct_answer",
    "synthesize_missing_tool_call",
    "synthesize_batch_tool_calls",
    "repair_python_class_alias",
  ];
  for (const flag of forbiddenTrueFlags) {
    if (policy[flag] === true) throw new Error(`Forbidden policy flag enabled: ${flag}`);
  }
  const serialized = JSON.stringify(policy).toLowerCase();
  for (const needle of ["expected_output", "task_id", "benchloop answer", "dataset answer"]) {
    if (serialized.includes(needle)) throw new Error(`Forbidden benchmark-specific literal in policy: ${needle}`);
  }
}

function runUnitTests() {
  run(process.execPath, ["test.mjs"], { cwd: HARNESS_DIR });
}

function runBenchLoop(policyPath, iterationDir, name, suites, modelsJson, modelNameFilter) {
  const psArgs = [
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", RUN_PS1,
    "-ModelsJson", modelsJson,
    "-PolicyPath", policyPath,
    "-OutDir", iterationDir,
    "-IterationLabel", name,
    "-Reasoning", "off",
    "-AliasSuffix", "-qwen-harness-noreason-mtp2",
    "-SpecDraftNMaxOverride", "2",
  ];
  if (suites) psArgs.push("-SuitesOverride", suites);
  if (modelNameFilter) psArgs.push("-ModelNameFilter", modelNameFilter);
  run("powershell.exe", psArgs, { cwd: path.dirname(RUN_PS1) });
}

function findBenchLoopRunJson(iterationDir, label) {
  const files = fs.readdirSync(iterationDir).filter((name) => name.includes(label) && name.endsWith("-benchloop.out.log"));
  if (!files.length) return null;
  const text = fs.readFileSync(path.join(iterationDir, files[0]), "utf8");
  const normalized = text.replace(/\r?\n/g, "");
  const match = normalized.match(/Saved results to\s+([A-Za-z]:\\[^\s]+\\\.bench-loop\\runs\\[^\s]+\\run\.json)/i);
  return match?.[1] ?? null;
}

function summarizeBenchLoopRun(run) {
  return {
    overall_score: Number(run.overall_score ?? 0),
    quality_score: Number(run.quality_score ?? 0),
    speed_score: Number(run.speed_score ?? 0),
    generation_tok_per_sec: Number(run.speed_metrics?.generation_tok_per_sec ?? run.generation_tok_per_sec ?? 0),
    reliability_score: Number(run.reliability_score ?? 0),
    value_score: Number(run.value_score ?? 0),
    suites: Object.fromEntries(Object.entries(run.suites ?? {}).map(([k, v]) => [k, Number(v.score ?? 0)])),
  };
}

function average(values) {
  const nums = values.map(Number).filter((value) => Number.isFinite(value));
  return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : 0;
}

function readHarnessSummaries(iterationDir) {
  const file = path.join(iterationDir, "qwen-harness-run-summaries.jsonl");
  if (!fs.existsSync(file)) return null;
  const rows = fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const okRows = rows.filter((row) => row.status === "ok" && row.metrics);
  if (!okRows.length) return null;
  const suiteNames = new Set(okRows.flatMap((row) => Object.keys(row.metrics.suites ?? {})));
  const suites = {};
  for (const suite of suiteNames) {
    suites[suite] = average(okRows.map((row) => row.metrics.suites?.[suite]));
  }
  return {
    overall_score: average(okRows.map((row) => row.metrics.overall_score)),
    quality_score: average(okRows.map((row) => row.metrics.quality_score)),
    speed_score: average(okRows.map((row) => row.metrics.speed_score)),
    generation_tok_per_sec: average(okRows.map((row) => row.metrics.generation_tok_per_sec)),
    reliability_score: average(okRows.map((row) => row.metrics.reliability_score)),
    suites,
    model_summaries: rows.map((row) => ({
      model_name: row.model_name,
      run_alias: row.run_alias,
      status: row.status,
      error: row.error ?? "",
      benchloop_run_json: row.benchloop_run_json ?? "",
      metrics: row.metrics ?? null,
      summary_path: row.summary_path ?? "",
    })),
  };
}

function readBenchLoopMetrics(iterationDir, label) {
  const runJson = findBenchLoopRunJson(iterationDir, label);
  if (runJson && fs.existsSync(runJson)) {
    return { ...summarizeBenchLoopRun(readJson(runJson)), run_json: runJson };
  }
  return null;
}

function exportLatestRun(modelNeedle) {
  if (!fs.existsSync(BENCHLOOP)) return null;
  const result = spawnSync(BENCHLOOP, ["export"], {
    cwd: path.join(REPO_ROOT, "windows-strix-halo"),
    encoding: "utf8",
  });
  if (result.status !== 0 || !result.stdout) return null;
  let text = result.stdout;
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const data = JSON.parse(text);
  let latest = null;
  for (const run of data.runs ?? []) {
    if (!String(run.model ?? "").includes(modelNeedle)) continue;
    if (!latest || String(run.timestamp) > String(latest.timestamp)) latest = run;
  }
  return latest;
}

function summarizeRun(run) {
  if (!run) return { overall_score: 0, quality_score: 0, suites: {} };
  return summarizeBenchLoopRun(run);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  fs.mkdirSync(args.outDir, { recursive: true });
  const basePolicy = readJson(args.basePolicy);
  const summaryPath = path.join(args.outDir, "optimization-summary.json");
  const rows = fs.existsSync(summaryPath) ? readJson(summaryPath) : [];
  let best = rows.reduce((acc, row) => {
    if (row.status !== "ok" || !(row.overall_score > 0)) return acc;
    if (!acc || row.overall_score > acc.overall_score + 0.05) return row;
    if (Math.abs(row.overall_score - acc.overall_score) <= 0.05 && row.quality_score > (acc.quality_score ?? 0)) return row;
    return acc;
  }, null);

  for (let i = args.start; i <= Math.min(args.end, CANDIDATES.length); i += 1) {
    const [name, patch] = CANDIDATES[i - 1];
    const iterationDir = path.join(args.outDir, `iteration-${String(i).padStart(2, "0")}-${name}`);
    const policyPath = path.join(iterationDir, "policy.json");
    const rowPath = path.join(iterationDir, "iteration-result.json");

    if (args.resume && fs.existsSync(rowPath)) {
      console.log(`Skipping completed iteration ${i} ${name}`);
      continue;
    }

    console.log(`\n=== Iteration ${i}/${CANDIDATES.length}: ${name} ===`);
    fs.mkdirSync(iterationDir, { recursive: true });
    const policy = policyForCandidate(basePolicy, i, name, patch);
    writeJson(policyPath, policy);

    try {
      runUnitTests();
    } catch (error) {
      console.error(`Unit tests failed for ${name}: ${error.message}`);
      writeJson(rowPath, { iteration: i, candidate: name, status: "unit_test_failed", error: error.message });
      continue;
    }

    let metrics = { overall_score: 0, quality_score: 0, suites: {} };
    if (!args.skipBench) {
      try {
        runBenchLoop(policyPath, iterationDir, name, args.suites, args.modelsJson, args.modelNameFilter);
        metrics = readHarnessSummaries(iterationDir) ?? readBenchLoopMetrics(iterationDir, name) ?? summarizeRun(exportLatestRun("qwen-harness-noreason-mtp2"));
      } catch (error) {
        console.error(`BenchLoop failed for ${name}: ${error.message}`);
        writeJson(rowPath, { iteration: i, candidate: name, status: "bench_failed", error: error.message });
        continue;
      }
    }

    const row = {
      iteration: i,
      candidate: name,
      status: "ok",
      policy_path: policyPath,
      ...metrics,
      kept: false,
    };

    if (
      metrics.overall_score > 0 &&
      (!best || metrics.overall_score > best.overall_score + 0.05 ||
        (Math.abs(metrics.overall_score - best.overall_score) <= 0.05 && metrics.quality_score > (best.quality_score ?? 0)))
    ) {
      best = row;
      row.kept = true;
      writeJson(args.promotePolicy, policy);
      console.log(`Promoted policy ${name}: overall=${metrics.overall_score.toFixed(2)} quality=${metrics.quality_score.toFixed(2)}`);
    } else {
      console.log(`Rejected ${name}: overall=${metrics.overall_score.toFixed(2)} (best=${best?.overall_score?.toFixed?.(2) ?? "none"})`);
    }

    rows.push(row);
    writeJson(rowPath, row);
    writeJson(summaryPath, rows);
  }

  writeJson(path.join(args.outDir, "best-policy.json"), best);
  console.log("\nOptimization complete.");
  if (best) {
    console.log(`Best: iteration ${best.iteration} ${best.candidate} overall=${best.overall_score?.toFixed?.(2)} quality=${best.quality_score?.toFixed?.(2)}`);
  }
}

main();
