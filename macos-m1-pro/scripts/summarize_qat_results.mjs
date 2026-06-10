import fs from "node:fs";
import path from "node:path";

const outDir = "results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64";
const runDir = path.join(outDir, "run-json");

const models = [
  ["gemma-4-12B-it-qat-UD-Q4_K_XL", "Metal"],
  ["gemma-4-E4B-it-qat-UD-Q4_K_XL", "Metal"],
  ["gemma-4-E2B-it-qat-UD-Q4_K_XL", "Metal"],
];

const suiteOrder = [
  "agent",
  "coding",
  "dataextract",
  "instructfollow",
  "reasonmath",
  "speed",
  "toolcall",
];

function readRun(model) {
  return JSON.parse(fs.readFileSync(path.join(runDir, `${model}.run.json`), "utf8"));
}

function fmt(value, digits = 1) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "";
  return Number(value).toFixed(digits);
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function jsonCell(value) {
  if (value === undefined || value === null) return "";
  return JSON.stringify(value);
}

function runId(run) {
  return `${String(run.timestamp ?? "").replaceAll(/[^0-9A-Za-z]+/g, "-")}-${run.model?.model_id ?? "unknown"}`;
}

function writeCsv(fileName, columns, rows) {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ];
  fs.writeFileSync(path.join(outDir, fileName), `${lines.join("\n")}\n`);
}

const runs = models.map(([model, backend]) => ({ model, backend, run: readRun(model) }));

const summaryColumns = [
  "model",
  "backend",
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
  "backend_mode",
  "run_id",
  "run_json",
  "version",
  "timestamp",
  "model_id",
  "model_family",
  "model_parameter_count",
  "model_quantization",
  "machine_id",
  "machine_cpu",
  "machine_gpu",
  "machine_gpu_memory_gb",
  "machine_system_memory_gb",
  "machine_os",
  "machine_backend",
  "machine_is_remote",
  "machine_remote_host",
  "machine_endpoint",
  "machine_hardware_label",
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
  "backend_mode",
  "run_id",
  "run_json",
  "model_id",
  "provider",
  "harness",
  "suite_name",
  "task_id",
  "task_suite",
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
  "task_eval_count",
  "task_eval_duration",
  "task_prompt_eval_count",
  "task_prompt_eval_duration",
  "task_load_duration",
  "task_selected_trial",
  "task_warmup_dropped",
  "task_selection_method",
  "task_metadata_json",
];

const trialColumns = [
  "variant",
  "backend_mode",
  "run_id",
  "run_json",
  "model_id",
  "provider",
  "harness",
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
  "trial_speed_metrics_ttft_ms",
  "trial_speed_metrics_prompt_eval_tok_per_sec",
  "trial_speed_metrics_generation_tok_per_sec",
  "trial_speed_metrics_total_latency_ms",
];

const summaryRows = [];
const runRows = [];
const taskRows = [];
const trialRows = [];

for (const { model, backend, run } of runs) {
  const id = runId(run);
  const runJson = path.join(outDir, "run-json", `${model}.run.json`);
  const variant = "qat_latest_llamacpp_all_suites_temp1_top_p095_top_k64";
  const base = {
    variant,
    backend_mode: backend,
    run_id: id,
    run_json: runJson,
    model_id: run.model?.model_id,
    provider: run.provider,
    harness: run.harness,
  };

  const summaryRow = {
    model,
    backend,
    quality_score: run.quality_score,
    overall_score: run.overall_score,
    speed_score: run.speed_score,
    reliability_score: run.reliability_score,
    value_score: run.value_score,
    generation_tok_per_sec: run.speed_metrics?.generation_tok_per_sec,
    total_runtime_sec: run.total_runtime_sec,
  };

  const runRow = {
    ...base,
    version: run.version,
    timestamp: run.timestamp,
    model_family: run.model?.family,
    model_parameter_count: run.model?.parameter_count,
    model_quantization: run.model?.quantization,
    machine_id: run.machine?.machine_id,
    machine_cpu: run.machine?.cpu,
    machine_gpu: run.machine?.gpu,
    machine_gpu_memory_gb: run.machine?.gpu_memory_gb,
    machine_system_memory_gb: run.machine?.system_memory_gb,
    machine_os: run.machine?.os,
    machine_backend: run.machine?.backend,
    machine_is_remote: run.machine?.is_remote,
    machine_remote_host: run.machine?.remote_host,
    machine_endpoint: run.machine?.endpoint,
    machine_hardware_label: run.machine?.hardware_label,
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
        ...base,
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
        task_speed_metrics_ttft_ms: metadata.speed_metrics?.ttft_ms,
        task_speed_metrics_prompt_eval_tok_per_sec: metadata.speed_metrics?.prompt_eval_tok_per_sec,
        task_speed_metrics_generation_tok_per_sec: metadata.speed_metrics?.generation_tok_per_sec,
        task_speed_metrics_total_latency_ms: metadata.speed_metrics?.total_latency_ms,
        task_eval_count: metadata.eval_count,
        task_eval_duration: metadata.eval_duration,
        task_prompt_eval_count: metadata.prompt_eval_count,
        task_prompt_eval_duration: metadata.prompt_eval_duration,
        task_load_duration: metadata.load_duration,
        task_selected_trial: metadata.selected_trial,
        task_warmup_dropped: metadata.warmup_dropped,
        task_selection_method: metadata.selection_method,
        task_metadata_json: jsonCell(metadata),
      });

      for (const trial of metadata.trials ?? []) {
        trialRows.push({
          ...base,
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
          trial_speed_metrics_ttft_ms: trial.speed_metrics?.ttft_ms,
          trial_speed_metrics_prompt_eval_tok_per_sec: trial.speed_metrics?.prompt_eval_tok_per_sec,
          trial_speed_metrics_generation_tok_per_sec: trial.speed_metrics?.generation_tok_per_sec,
          trial_speed_metrics_total_latency_ms: trial.speed_metrics?.total_latency_ms,
        });
      }
    }
  }

  summaryRows.push(summaryRow);
  runRows.push(runRow);
}

writeCsv("summary.csv", summaryColumns, summaryRows);
writeCsv("benchloop-runs-all-columns.csv", runColumns, runRows);
writeCsv("benchloop-tasks-all-columns.csv", taskColumns, taskRows);
writeCsv("benchloop-trials-all-columns.csv", trialColumns, trialRows);

const columnReferenceLines = [
  "# QAT BenchLoop All Columns",
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

const summaryLines = [
  "# QAT Gemma 4 BenchLoop Results",
  "",
  "- BenchLoop: `0.2.3`",
  "- llama.cpp: `308f61c`",
  "- Suites: `agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall`",
  "- Sampler: `--temp 1 --top-p 0.95 --top-k 64`",
  "- Server: `-c 4096 -np 1 --jinja --reasoning off -n 256`",
  "- Note: UD-Q4 models used Metal with `-ngl all`.",
  "",
  "## Summary",
  "",
  "| Model | Backend | Quality | Overall | Speed | Reliability | Value | Gen tok/s | Runtime |",
  "|---|---|---:|---:|---:|---:|---:|---:|---:|",
  ...runs.map(({ model, backend, run }) => [
    `| \`${model}\``,
    backend,
    fmt(run.quality_score),
    fmt(run.overall_score),
    fmt(run.speed_score),
    fmt(run.reliability_score),
    fmt(run.value_score),
    fmt(run.speed_metrics?.generation_tok_per_sec, 2),
    `${fmt(run.total_runtime_sec)}s |`,
  ].join(" | ")),
  "",
  "## Suite Scores",
  "",
  "| Model | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Speed | Tool Call |",
  "|---|---:|---:|---:|---:|---:|---:|---:|",
  ...runs.map(({ model, run }) => {
    const cells = suiteOrder.map((suiteName) => {
      const suite = run.suites?.[suiteName] ?? {};
      return `${fmt(suite.score)} (${suite.pass_count ?? ""}/${suite.task_count ?? ""})`;
    });
    return `| \`${model}\` | ${cells.join(" | ")} |`;
  }),
  "",
  "## Run JSON",
  "",
  ...runs.map(({ model }) => `- [${model}](run-json/${model}.run.json)`),
  "",
  "## Expanded Exports",
  "",
  "- [Run-level all columns CSV](benchloop-runs-all-columns.csv)",
  "- [Task-level all columns CSV](benchloop-tasks-all-columns.csv)",
  "- [Trial-level all columns CSV](benchloop-trials-all-columns.csv)",
  "- [Column reference](benchloop-all-columns.md)",
  "",
];

fs.writeFileSync(path.join(outDir, "summary.md"), `${summaryLines.join("\n")}`);
