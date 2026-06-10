import fs from "node:fs";
import path from "node:path";

const outDir = "results/benchloop/qat-e2b-e4b-sampler-sweep-all-suites";
const runDir = path.join(outDir, "run-json");
const baselineRunDir = "results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/run-json";
const suiteOrder = ["agent", "coding", "dataextract", "instructfollow", "reasonmath", "speed", "toolcall"];

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function writeCsv(fileName, columns, rows) {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ];
  fs.writeFileSync(path.join(outDir, fileName), `${lines.join("\n")}\n`);
}

function fmt(value, digits = 1) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "";
  return Number(value).toFixed(digits);
}

function jsonCell(value) {
  if (value === undefined || value === null) return "";
  return JSON.stringify(value);
}

function parseSampler(alias) {
  const baselineMatch = alias.match(/^(gemma-4-E[24]B-it-qat-UD-Q4_K_XL)-temp100_top_p095_top_k64$/);
  if (baselineMatch) {
    return {
      base_model: baselineMatch[1],
      sampler_id: "temp100_top_p095_top_k64",
      sampler_label: "original",
      temp: 1,
      top_p: 0.95,
      top_k: 64,
    };
  }
  const match = alias.match(/^(gemma-4-E[24]B-it-qat-UD-Q4_K_XL)-temp(\d{3})_top_p(\d{3})_top_k(\d+)$/);
  if (!match) throw new Error(`Unexpected alias: ${alias}`);
  const [, baseModel, tempRaw, topPRaw, topKRaw] = match;
  return {
    base_model: baseModel,
    sampler_id: `temp${tempRaw}_top_p${topPRaw}_top_k${topKRaw}`,
    sampler_label: "sweep",
    temp: Number(tempRaw) / 100,
    top_p: Number(topPRaw) / 100,
    top_k: Number(topKRaw),
  };
}

const sweepRunFiles = fs.readdirSync(runDir)
  .filter((file) => file.endsWith(".run.json"))
  .sort();

const runs = sweepRunFiles.map((file) => {
  const alias = file.replace(/\.run\.json$/, "");
  const run = JSON.parse(fs.readFileSync(path.join(runDir, file), "utf8"));
  return {
    alias,
    run,
    run_json: path.join(outDir, "run-json", file),
    ...parseSampler(alias),
  };
});

for (const baseModel of [
  "gemma-4-E2B-it-qat-UD-Q4_K_XL",
  "gemma-4-E4B-it-qat-UD-Q4_K_XL",
]) {
  const alias = `${baseModel}-temp100_top_p095_top_k64`;
  const file = `${baseModel}.run.json`;
  const run = JSON.parse(fs.readFileSync(path.join(baselineRunDir, file), "utf8"));
  runs.push({
    alias,
    run,
    run_json: path.join(baselineRunDir, file),
    ...parseSampler(alias),
  });
}

const summaryColumns = [
  "base_model",
  "sampler_label",
  "sampler_id",
  "temp",
  "top_p",
  "top_k",
  "quality_score",
  "overall_score",
  "speed_score",
  "reliability_score",
  "value_score",
  "generation_tok_per_sec",
  "total_runtime_sec",
  ...suiteOrder.flatMap((suite) => [
    `suite_${suite}_score`,
    `suite_${suite}_pass_count`,
    `suite_${suite}_task_count`,
    `suite_${suite}_median_latency_ms`,
  ]),
];

const runColumns = [
  "variant",
  "base_model",
  "sampler_label",
  "sampler_id",
  "temp",
  "top_p",
  "top_k",
  "run_id",
  "run_json",
  "version",
  "timestamp",
  "model_id",
  "machine_gpu",
  "machine_gpu_memory_gb",
  "machine_endpoint",
  "provider",
  "harness",
  "harness_version",
  "total_runtime_sec",
  "overall_score",
  "quality_score",
  "speed_score",
  "reliability_score",
  "value_score",
  "speed_metrics_ttft_ms",
  "speed_metrics_prompt_eval_tok_per_sec",
  "speed_metrics_generation_tok_per_sec",
  "speed_metrics_total_latency_ms",
  ...suiteOrder.flatMap((suite) => [
    `suite_${suite}_score`,
    `suite_${suite}_task_count`,
    `suite_${suite}_pass_count`,
    `suite_${suite}_fail_count`,
    `suite_${suite}_median_latency_ms`,
  ]),
];

const taskColumns = [
  "variant",
  "base_model",
  "sampler_label",
  "sampler_id",
  "temp",
  "top_p",
  "top_k",
  "run_id",
  "run_json",
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
  "task_speed_metrics_ttft_ms",
  "task_speed_metrics_prompt_eval_tok_per_sec",
  "task_speed_metrics_generation_tok_per_sec",
  "task_speed_metrics_total_latency_ms",
  "task_selected_trial",
  "task_warmup_dropped",
  "task_selection_method",
  "task_metadata_json",
];

const trialColumns = [
  "variant",
  "base_model",
  "sampler_label",
  "sampler_id",
  "temp",
  "top_p",
  "top_k",
  "run_id",
  "run_json",
  "model_id",
  "suite_name",
  "task_id",
  "trial_index",
  "trial_warmup",
  "trial_passed",
  "trial_score",
  "trial_latency_ms",
  "trial_tokens_generated",
  "trial_tokens_prompt",
  "trial_error",
  "trial_speed_metrics_generation_tok_per_sec",
  "trial_speed_metrics_total_latency_ms",
];

const summaryRows = [];
const runRows = [];
const taskRows = [];
const trialRows = [];

for (const item of runs) {
  const { alias, run, run_json, base_model, sampler_label, sampler_id, temp, top_p, top_k } = item;
  const runId = `${run.timestamp}-${alias}`;
  const common = {
    variant: "qat_e2b_e4b_sampler_sweep_all_suites",
    base_model,
    sampler_label,
    sampler_id,
    temp,
    top_p,
    top_k,
    run_id: runId,
    run_json,
    model_id: run.model?.model_id,
  };

  const summaryRow = {
    base_model,
    sampler_label,
    sampler_id,
    temp,
    top_p,
    top_k,
    quality_score: run.quality_score,
    overall_score: run.overall_score,
    speed_score: run.speed_score,
    reliability_score: run.reliability_score,
    value_score: run.value_score,
    generation_tok_per_sec: run.speed_metrics?.generation_tok_per_sec,
    total_runtime_sec: run.total_runtime_sec,
  };
  const runRow = {
    ...common,
    version: run.version,
    timestamp: run.timestamp,
    machine_gpu: run.machine?.gpu,
    machine_gpu_memory_gb: run.machine?.gpu_memory_gb,
    machine_endpoint: run.machine?.endpoint,
    provider: run.provider,
    harness: run.harness,
    harness_version: run.harness_version,
    total_runtime_sec: run.total_runtime_sec,
    overall_score: run.overall_score,
    quality_score: run.quality_score,
    speed_score: run.speed_score,
    reliability_score: run.reliability_score,
    value_score: run.value_score,
    speed_metrics_ttft_ms: run.speed_metrics?.ttft_ms,
    speed_metrics_prompt_eval_tok_per_sec: run.speed_metrics?.prompt_eval_tok_per_sec,
    speed_metrics_generation_tok_per_sec: run.speed_metrics?.generation_tok_per_sec,
    speed_metrics_total_latency_ms: run.speed_metrics?.total_latency_ms,
  };

  for (const suiteName of suiteOrder) {
    const suite = run.suites?.[suiteName] ?? {};
    summaryRow[`suite_${suiteName}_score`] = suite.score;
    summaryRow[`suite_${suiteName}_pass_count`] = suite.pass_count;
    summaryRow[`suite_${suiteName}_task_count`] = suite.task_count;
    summaryRow[`suite_${suiteName}_median_latency_ms`] = suite.median_latency_ms;
    runRow[`suite_${suiteName}_score`] = suite.score;
    runRow[`suite_${suiteName}_task_count`] = suite.task_count;
    runRow[`suite_${suiteName}_pass_count`] = suite.pass_count;
    runRow[`suite_${suiteName}_fail_count`] = suite.fail_count;
    runRow[`suite_${suiteName}_median_latency_ms`] = suite.median_latency_ms;

    for (const task of suite.tasks ?? []) {
      const metadata = task.metadata ?? {};
      taskRows.push({
        ...common,
        suite_name: suiteName,
        task_id: task.task_id,
        task_passed: task.passed,
        task_score: task.score,
        task_latency_ms: task.latency_ms,
        task_tokens_generated: task.tokens_generated,
        task_tokens_prompt: task.tokens_prompt,
        task_error: task.error,
        task_output: task.output,
        task_speed_metrics_ttft_ms: metadata.speed_metrics?.ttft_ms,
        task_speed_metrics_prompt_eval_tok_per_sec: metadata.speed_metrics?.prompt_eval_tok_per_sec,
        task_speed_metrics_generation_tok_per_sec: metadata.speed_metrics?.generation_tok_per_sec,
        task_speed_metrics_total_latency_ms: metadata.speed_metrics?.total_latency_ms,
        task_selected_trial: metadata.selected_trial,
        task_warmup_dropped: metadata.warmup_dropped,
        task_selection_method: metadata.selection_method,
        task_metadata_json: jsonCell(metadata),
      });
      for (const trial of metadata.trials ?? []) {
        trialRows.push({
          ...common,
          suite_name: suiteName,
          task_id: task.task_id,
          trial_index: trial.trial_index,
          trial_warmup: trial.warmup,
          trial_passed: trial.passed,
          trial_score: trial.score,
          trial_latency_ms: trial.latency_ms,
          trial_tokens_generated: trial.tokens_generated,
          trial_tokens_prompt: trial.tokens_prompt,
          trial_error: trial.error,
          trial_speed_metrics_generation_tok_per_sec: trial.speed_metrics?.generation_tok_per_sec,
          trial_speed_metrics_total_latency_ms: trial.speed_metrics?.total_latency_ms,
        });
      }
    }
  }

  summaryRows.push(summaryRow);
  runRows.push(runRow);
}

summaryRows.sort((a, b) => a.base_model.localeCompare(b.base_model) || b.overall_score - a.overall_score);
runRows.sort((a, b) => a.base_model.localeCompare(b.base_model) || b.overall_score - a.overall_score);

writeCsv("summary.csv", summaryColumns, summaryRows);
writeCsv("benchloop-runs-all-columns.csv", runColumns, runRows);
writeCsv("benchloop-tasks-all-columns.csv", taskColumns, taskRows);
writeCsv("benchloop-trials-all-columns.csv", trialColumns, trialRows);

const byModel = Map.groupBy(summaryRows, (row) => row.base_model);
const bestRows = [...byModel.entries()].map(([model, rows]) => ({
  model,
  best: rows.toSorted((a, b) => b.overall_score - a.overall_score)[0],
}));

function samplerText(row) {
  const text = `temp=${fmt(row.temp, 2)}, top_p=${fmt(row.top_p, 2)}, top_k=${row.top_k}`;
  return row.sampler_label === "original" ? `${text} (original)` : text;
}

const summaryLines = [
  "# QAT E2B/E4B Sampler Comparison",
  "",
  "- BenchLoop: `0.2.3`",
  "- llama.cpp: `308f61c`",
  "- Suites: `agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall`",
  "- Server: `-ngl all -c 4096 -np 1 --jinja --reasoning off -n 256`",
  "- Includes original baseline: `--temp 1 --top-p 0.95 --top-k 64`",
  "",
  "## Best Overall",
  "",
  "| Model | Best Sampler | Quality | Overall | Speed | Reliability | Gen tok/s | Runtime |",
  "|---|---|---:|---:|---:|---:|---:|---:|",
  ...bestRows.map(({ model, best }) => `| \`${model}\` | ${samplerText(best)} | ${fmt(best.quality_score)} | ${fmt(best.overall_score)} | ${fmt(best.speed_score)} | ${fmt(best.reliability_score)} | ${fmt(best.generation_tok_per_sec, 2)} | ${fmt(best.total_runtime_sec)}s |`),
  "",
  "## All Profiles",
  "",
  "| Model | Sampler | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |",
  "|---|---|---:|---:|---:|---:|---:|---:|---:|",
  ...summaryRows.map((row) => `| \`${row.base_model}\` | ${samplerText(row)} | ${fmt(row.quality_score)} | ${fmt(row.overall_score)} | ${fmt(row.speed_score)} | ${fmt(row.reliability_score)} | ${fmt(row.value_score)} | ${fmt(row.generation_tok_per_sec, 2)} | ${fmt(row.total_runtime_sec)}s |`),
  "",
  "## Suite Scores",
  "",
  "| Model | Sampler | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Speed | Tool Call |",
  "|---|---|---:|---:|---:|---:|---:|---:|---:|",
  ...summaryRows.map((row) => {
    const cells = suiteOrder.map((suite) => `${fmt(row[`suite_${suite}_score`])} (${row[`suite_${suite}_pass_count`]}/${row[`suite_${suite}_task_count`]})`);
    return `| \`${row.base_model}\` | ${samplerText(row)} | ${cells.join(" | ")} |`;
  }),
  "",
  "## Expanded Exports",
  "",
  "- [Summary CSV](summary.csv)",
  "- [Run-level all columns CSV](benchloop-runs-all-columns.csv)",
  "- [Task-level all columns CSV](benchloop-tasks-all-columns.csv)",
  "- [Trial-level all columns CSV](benchloop-trials-all-columns.csv)",
  "- [Column reference](benchloop-all-columns.md)",
  "",
];

fs.writeFileSync(path.join(outDir, "summary.md"), `${summaryLines.join("\n")}`);

const columnReferenceLines = [
  "# Sampler Sweep BenchLoop Columns",
  "",
  `Run-level rows: ${runRows.length}`,
  `Task-level rows: ${taskRows.length}`,
  `Trial-level rows: ${trialRows.length}`,
  "",
  "## Run-Level Columns",
  "",
  ...runColumns.map((column) => `- ${column}`),
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
