import fs from "node:fs";
import path from "node:path";

const outDir = "results/benchloop/gemma4-harness-optimized";
const suiteOrder = ["agent", "coding", "dataextract", "instructfollow", "reasonmath", "speed", "toolcall"];

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function fmt(value, digits = 2) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "";
  return Number(value).toFixed(digits);
}

function jsonCell(value) {
  if (value === undefined || value === null) return "";
  return JSON.stringify(value);
}

function writeCsv(fileName, columns, rows) {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ];
  fs.writeFileSync(path.join(outDir, fileName), `${lines.join("\n")}\n`);
}

function scalarFlatten(value, prefix = "", out = {}) {
  if (value === undefined || value === null) {
    out[prefix] = "";
    return out;
  }
  if (Array.isArray(value)) {
    out[prefix] = jsonCell(value);
    return out;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      scalarFlatten(child, prefix ? `${prefix}_${key}` : key, out);
    }
    return out;
  }
  out[prefix] = value;
  return out;
}

function orderedColumns(preferred, rows) {
  const seen = new Set();
  const columns = [];
  for (const column of preferred) {
    if (!seen.has(column)) {
      seen.add(column);
      columns.push(column);
    }
  }
  for (const row of rows) {
    for (const column of Object.keys(row).sort()) {
      if (!seen.has(column)) {
        seen.add(column);
        columns.push(column);
      }
    }
  }
  return columns;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function runFiles() {
  return fs.readdirSync(outDir)
    .filter((entry) => /^iteration-\d+$/.test(entry))
    .flatMap((iterationDir) => {
      const fullIterationDir = path.join(outDir, iterationDir);
      return fs.readdirSync(fullIterationDir)
        .map((modelDir) => path.join(fullIterationDir, modelDir, "run.json"))
        .filter((file) => fs.existsSync(file));
    })
    .sort();
}

const runs = runFiles().map((file) => {
  const modelDir = path.basename(path.dirname(file));
  const iterationDir = path.basename(path.dirname(path.dirname(file)));
  const iteration = Number(iterationDir.replace("iteration-", ""));
  const policyPath = path.join(path.dirname(file), "policy.json");
  const analysisPath = path.join(path.dirname(file), "analysis.json");
  return {
    iteration,
    iteration_id: iterationDir,
    model_alias: modelDir,
    run_json: file,
    policy: fs.existsSync(policyPath) ? readJson(policyPath) : {},
    analysis: fs.existsSync(analysisPath) ? readJson(analysisPath) : {},
    run: readJson(file),
  };
});

const summaryRows = [];
const runRows = [];
const suiteRows = [];
const taskRows = [];
const trialRows = [];

for (const item of runs) {
  const { iteration, iteration_id, model_alias, run_json, policy, analysis, run } = item;
  const modelId = model_alias;
  const benchloopModelId = run.model?.model_id ?? model_alias;
  const runId = `${run.timestamp ?? iteration_id}-${benchloopModelId}`;
  const policyFeatures = policy.metadata?.enabled_features ?? [];
  const failureClasses = analysis.failure_classes ?? {};
  const common = {
    variant: "gemma4_harness_optimized_17x",
    iteration,
    iteration_id,
    model_alias,
    model_id: modelId,
    benchloop_model_id: benchloopModelId,
    run_id: runId,
    run_json,
    policy_json: path.join(path.dirname(run_json), "policy.json"),
    analysis_json: path.join(path.dirname(run_json), "analysis.json"),
    sampler_temp: policy.temperature,
    sampler_top_p: policy.top_p,
    sampler_top_k: policy.top_k,
    policy_version: policy.version,
    policy_enabled_features: policyFeatures.join(";"),
    analysis_failure_classes_json: jsonCell(failureClasses),
  };

  const summaryRow = {
    ...common,
    quality_score: run.quality_score,
    overall_score: run.overall_score,
    speed_score: run.speed_score,
    reliability_score: run.reliability_score,
    value_score: run.value_score,
    generation_tok_per_sec: run.speed_metrics?.generation_tok_per_sec,
    total_runtime_sec: run.total_runtime_sec,
  };

  const runBase = {
    ...common,
    version: run.version,
    timestamp: run.timestamp,
    provider: run.provider,
    harness: run.harness,
    harness_version: run.harness_version,
    total_runtime_sec: run.total_runtime_sec,
    overall_score: run.overall_score,
    quality_score: run.quality_score,
    speed_score: run.speed_score,
    reliability_score: run.reliability_score,
    value_score: run.value_score,
    ...scalarFlatten(run.model ?? {}, "model"),
    ...scalarFlatten(run.machine ?? {}, "machine"),
    ...scalarFlatten(run.speed_metrics ?? {}, "speed_metrics"),
  };

  for (const suiteName of suiteOrder) {
    const suite = run.suites?.[suiteName] ?? {};
    summaryRow[`suite_${suiteName}_score`] = suite.score;
    summaryRow[`suite_${suiteName}_pass_count`] = suite.pass_count;
    summaryRow[`suite_${suiteName}_task_count`] = suite.task_count;
    summaryRow[`suite_${suiteName}_median_latency_ms`] = suite.median_latency_ms;
    Object.assign(runBase, {
      [`suite_${suiteName}_score`]: suite.score,
      [`suite_${suiteName}_task_count`]: suite.task_count,
      [`suite_${suiteName}_pass_count`]: suite.pass_count,
      [`suite_${suiteName}_fail_count`]: suite.fail_count,
      [`suite_${suiteName}_median_latency_ms`]: suite.median_latency_ms,
    });

    suiteRows.push({
      ...common,
      suite_name: suiteName,
      suite_score: suite.score,
      suite_task_count: suite.task_count,
      suite_pass_count: suite.pass_count,
      suite_fail_count: suite.fail_count,
      suite_median_latency_ms: suite.median_latency_ms,
      suite_json: jsonCell(Object.fromEntries(Object.entries(suite).filter(([key]) => key !== "tasks"))),
    });

    for (const task of suite.tasks ?? []) {
      const metadata = task.metadata ?? {};
      const taskRow = {
        ...common,
        suite_name: suiteName,
        task_id: task.task_id,
        task_suite: task.suite,
        task_passed: task.passed,
        task_score: task.score,
        task_latency_ms: task.latency_ms,
        task_tokens_generated: task.tokens_generated,
        task_tokens_prompt: task.tokens_prompt,
        task_error: task.error,
        task_output: task.output,
        ...scalarFlatten(metadata.speed_metrics ?? {}, "task_speed_metrics"),
        task_eval_count: metadata.eval_count,
        task_eval_duration: metadata.eval_duration,
        task_prompt_eval_count: metadata.prompt_eval_count,
        task_prompt_eval_duration: metadata.prompt_eval_duration,
        task_load_duration: metadata.load_duration,
        task_selected_trial: metadata.selected_trial,
        task_warmup_dropped: metadata.warmup_dropped,
        task_selection_method: metadata.selection_method,
        task_metadata_json: jsonCell(metadata),
      };
      taskRows.push(taskRow);

      for (const trial of metadata.trials ?? []) {
        trialRows.push({
          ...common,
          suite_name: suiteName,
          task_id: task.task_id,
          ...scalarFlatten(trial, "trial"),
        });
      }
    }
  }

  summaryRows.push(summaryRow);
  runRows.push(runBase);
}

summaryRows.sort((a, b) => a.iteration - b.iteration || a.model_id.localeCompare(b.model_id));
runRows.sort((a, b) => a.iteration - b.iteration || a.model_id.localeCompare(b.model_id));
suiteRows.sort((a, b) => a.iteration - b.iteration || a.model_id.localeCompare(b.model_id) || suiteOrder.indexOf(a.suite_name) - suiteOrder.indexOf(b.suite_name));

const summaryColumns = orderedColumns([
  "variant",
  "iteration",
  "model_id",
  "sampler_temp",
  "sampler_top_p",
  "sampler_top_k",
  "quality_score",
  "overall_score",
  "speed_score",
  "reliability_score",
  "value_score",
  "generation_tok_per_sec",
  "total_runtime_sec",
], summaryRows);

const runColumns = orderedColumns([
  "variant",
  "iteration",
  "model_id",
  "run_id",
  "run_json",
  "version",
  "timestamp",
  "provider",
  "harness",
  "harness_version",
  "policy_version",
  "policy_enabled_features",
  "total_runtime_sec",
  "overall_score",
  "quality_score",
  "speed_score",
  "reliability_score",
  "value_score",
  "speed_metrics_generation_tok_per_sec",
], runRows);

const suiteColumns = orderedColumns([
  "variant",
  "iteration",
  "model_id",
  "suite_name",
  "suite_score",
  "suite_task_count",
  "suite_pass_count",
  "suite_fail_count",
  "suite_median_latency_ms",
], suiteRows);

const taskColumns = orderedColumns([
  "variant",
  "iteration",
  "model_id",
  "suite_name",
  "task_id",
  "task_passed",
  "task_score",
  "task_latency_ms",
  "task_tokens_generated",
  "task_tokens_prompt",
  "task_error",
  "task_output",
  "task_metadata_json",
], taskRows);

const trialColumns = orderedColumns([
  "variant",
  "iteration",
  "model_id",
  "suite_name",
  "task_id",
  "trial_trial_index",
  "trial_warmup",
  "trial_passed",
  "trial_score",
  "trial_latency_ms",
  "trial_tokens_generated",
  "trial_tokens_prompt",
  "trial_error",
], trialRows);

writeCsv("summary.csv", summaryColumns, summaryRows);
writeCsv("benchloop-runs-all-columns.csv", runColumns, runRows);
writeCsv("benchloop-suites-all-columns.csv", suiteColumns, suiteRows);
writeCsv("benchloop-tasks-all-columns.csv", taskColumns, taskRows);
writeCsv("benchloop-trials-all-columns.csv", trialColumns, trialRows);

const byModel = Map.groupBy(summaryRows, (row) => row.model_id);
const bestRows = [...byModel.entries()].map(([model, rows]) => ({
  model,
  best: rows.toSorted((a, b) => Number(b.quality_score) - Number(a.quality_score) || Number(b.overall_score) - Number(a.overall_score))[0],
}));

const summaryLines = [
  "# Gemma 4 Harness Optimization Runs",
  "",
  "- BenchLoop: `0.2.3`",
  "- Backend: `llama.cpp` through the optimized OpenAI-compatible proxy",
  "- Suites: `agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall`",
  "- Sampler: `temp=1.00, top_p=0.95, top_k=64`",
  "- Prompt/tool policy: BenchLoop messages and tool schemas are passed through unchanged.",
  "",
  "## Best Quality",
  "",
  "| Model | Iteration | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |",
  "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
  ...bestRows.map(({ model, best }) => `| \`${model}\` | ${best.iteration} | ${fmt(best.quality_score)} | ${fmt(best.overall_score)} | ${fmt(best.speed_score)} | ${fmt(best.reliability_score)} | ${fmt(best.value_score)} | ${fmt(best.generation_tok_per_sec)} | ${fmt(best.total_runtime_sec)}s |`),
  "",
  "## All Iterations",
  "",
  "| Iteration | Model | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |",
  "|---:|---|---:|---:|---:|---:|---:|---:|---:|",
  ...summaryRows.map((row) => `| ${row.iteration} | \`${row.model_id}\` | ${fmt(row.quality_score)} | ${fmt(row.overall_score)} | ${fmt(row.speed_score)} | ${fmt(row.reliability_score)} | ${fmt(row.value_score)} | ${fmt(row.generation_tok_per_sec)} | ${fmt(row.total_runtime_sec)}s |`),
  "",
  "## Expanded Exports",
  "",
  "- [Summary CSV](summary.csv)",
  "- [Run-level all columns CSV](benchloop-runs-all-columns.csv)",
  "- [Suite-level all columns CSV](benchloop-suites-all-columns.csv)",
  "- [Task-level all columns CSV](benchloop-tasks-all-columns.csv)",
  "- [Trial-level all columns CSV](benchloop-trials-all-columns.csv)",
  "- [Column reference](benchloop-all-columns.md)",
  "",
];

fs.writeFileSync(path.join(outDir, "summary.md"), `${summaryLines.join("\n")}`);

const columnReferenceLines = [
  "# Gemma 4 Harness Optimization BenchLoop Columns",
  "",
  `Run-level rows: ${runRows.length}`,
  `Suite-level rows: ${suiteRows.length}`,
  `Task-level rows: ${taskRows.length}`,
  `Trial-level rows: ${trialRows.length}`,
  "",
  "## Run-Level Columns",
  "",
  ...runColumns.map((column) => `- ${column}`),
  "",
  "## Suite-Level Columns",
  "",
  ...suiteColumns.map((column) => `- ${column}`),
  "",
  "## Task-Level Columns",
  "",
  ...taskColumns.map((column) => `- ${column}`),
  "",
  "## Trial-Level Columns",
  "",
  ...trialColumns.map((column) => `- ${column}`),
  "",
];

fs.writeFileSync(path.join(outDir, "benchloop-all-columns.md"), columnReferenceLines.join("\n"));
