#!/usr/bin/env node
/**
 * Iterative Qwen/Qwopus harness optimizer for lan-adapter + qwen_benchloop_harness.
 * Runs unit tests then BenchLoop for each policy candidate; keeps the best defensible policy.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARNESS_DIR = path.join(REPO_ROOT, "qwen_benchloop_harness");
const BASE_POLICY_PATH = path.join(HARNESS_DIR, "configs/qwopus35_optimized_policy.json");
const RUN_PS1 = path.join(REPO_ROOT, "windows-strix-halo/Run-Qwen-Harness-BenchLoop.ps1");
const BENCHLOOP = path.join(REPO_ROOT, "windows-strix-halo/.venv-benchloop/Scripts/benchloop.exe");
const DEFAULT_OUT = path.join(REPO_ROOT, "windows-strix-halo/logs/qwen-harness-optimization");

/** General-purpose policy iterations (no benchmark-specific answer injection). */
const CANDIDATES = [
  ["01-baseline", {}],
  ["01b-minimal-repair", {
    extract_python_code: false,
    extract_javascript_code: false,
    normalize_tool_args: false,
  }],
  ["02-coerce-scalar-json", { coerce_scalar_json_values: true }],
  ["04-retry-empty", { retry_empty: true, max_retries: 1 }],
  ["05-retry-json", { retry_malformed_json: true, max_retries: 1 }],
  ["06-retry-missing-tool", { retry_missing_tool_call: true, max_retries: 1 }],
  ["07-retry-python", { retry_malformed_python: true, max_retries: 1 }],
  ["08-retry-typescript", { retry_malformed_javascript: true, max_retries: 1 }],
  ["09-json-agent-lean", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, max_retries: 1 }],
  ["10-tool-reason-lean", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, max_retries: 2 }],
  ["11-code-retry-lean", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, retry_malformed_python: true, max_retries: 2 }],
  ["12-full-code-retry", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
  ["14-normalize-tool-args-off", { normalize_tool_args: false }],
  ["15-dedupe-off", { dedupe_tool_calls: false }],
  ["20-max-retries-2-baseline", { max_retries: 2 }],
  ["21-max-retries-3-json", { retry_empty: true, retry_malformed_json: true, max_retries: 3 }],
  ["22-forensic-shared", { coerce_scalar_json_values: true }],
  ["23-forensic-json-agent", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, max_retries: 2 }],
  ["24-forensic-tool-reason", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, max_retries: 2 }],
  ["25-forensic-code", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
  ["26-forensic-full", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
  ["27-promoted-lean", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, max_retries: 2, normalize_tool_args: true, dedupe_tool_calls: true }],
  ["28-promoted-code", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, max_retries: 2 }],
  ["29-promoted-full", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 2 }],
  ["30-promoted-full-plus", { coerce_scalar_json_values: true, retry_empty: true, retry_malformed_json: true, retry_missing_tool_call: true, retry_malformed_python: true, retry_malformed_javascript: true, max_retries: 3, dedupe_tool_calls: true }],
];

function parseArgs(argv) {
  const args = {
    outDir: DEFAULT_OUT,
    start: 1,
    end: CANDIDATES.length,
    suites: "",
    skipBench: false,
    resume: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === "--out-dir") args.outDir = path.resolve(argv[++i]);
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
  return {
    ...basePolicy,
    ...patch,
    version: `lan-adapter-iter-${String(iteration).padStart(2, "0")}-${name}`,
    metadata: {
      ...(basePolicy.metadata ?? {}),
      optimizer: "windows-strix-halo/scripts/optimize_qwen_harness.mjs",
      optimizer_iteration: iteration,
      optimizer_candidate: name,
      patch,
    },
  };
}

function runUnitTests() {
  run(process.execPath, ["test.mjs"], { cwd: HARNESS_DIR });
}

function runBenchLoop(policyPath, iterationDir, name, suites) {
  const psArgs = [
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", RUN_PS1,
    "-PolicyPath", policyPath,
    "-OutDir", iterationDir,
    "-IterationLabel", name,
    "-Reasoning", "off",
    "-AliasSuffix", "-qwen-harness-noreason-mtp2",
    "-SpecDraftNMaxOverride", "2",
  ];
  if (suites) psArgs.push("-SuitesOverride", suites);
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

const RAW_BASELINE_OVERALL = 82.33748689138578;
const RAW_BASELINE_QUALITY = 87.24666666666667;

function main() {
  const args = parseArgs(process.argv.slice(2));
  fs.mkdirSync(args.outDir, { recursive: true });
  const basePolicy = readJson(BASE_POLICY_PATH);
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
        runBenchLoop(policyPath, iterationDir, name, args.suites);
        metrics = readBenchLoopMetrics(iterationDir, name) ?? summarizeRun(exportLatestRun("qwen-harness-noreason-mtp2"));
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
      writeJson(path.join(HARNESS_DIR, "configs/qwopus35_optimized_policy.json"), policy);
      const rawDelta = metrics.overall_score - RAW_BASELINE_OVERALL;
      console.log(`Promoted policy ${name}: overall=${metrics.overall_score.toFixed(2)} quality=${metrics.quality_score.toFixed(2)} raw_delta=${rawDelta.toFixed(2)}`);
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
