#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_INPUTS = [
  "results/benchloop/gemma4-fastify-optimization-extra5",
  "results/benchloop/gemma4-fastify-optimization-extra3",
];

function parseArgs(argv) {
  const args = {
    inputs: DEFAULT_INPUTS,
    outDir: "results/benchloop/gemma4-forensic-output-analysis",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === "--out-dir") args.outDir = argv[++i];
    else if (key === "--inputs") args.inputs = argv[++i].split(",").map((item) => item.trim()).filter(Boolean);
    else throw new Error(`Unknown argument: ${key}`);
  }
  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

function listRunJsons(inputDirs) {
  const files = [];
  for (const inputDir of inputDirs) {
    const summaryPath = path.join(inputDir, "summary.json");
    const summary = fs.existsSync(summaryPath) ? readJson(summaryPath) : null;
    if (!summary?.rows) continue;
    for (const row of summary.rows) {
      files.push({
        inputDir,
        iteration: row.iteration,
        candidate: row.candidate,
        modelId: row.model_id,
        runJson: row.run_json,
        policyJson: row.policy_json,
        qualityScore: row.quality_score,
        overallScore: row.overall_score,
      });
    }
  }
  return files.sort((a, b) =>
    a.inputDir.localeCompare(b.inputDir) ||
    a.iteration - b.iteration ||
    a.modelId.localeCompare(b.modelId)
  );
}

function shortRunId(file) {
  const sweep = file.inputDir.split("/").at(-1)?.replace("gemma4-fastify-optimization-", "") ?? "run";
  return `${sweep}-i${String(file.iteration).padStart(2, "0")}`;
}

function modelShort(modelId) {
  if (modelId.includes("E2B")) return "E2B";
  if (modelId.includes("E4B")) return "E4B";
  return modelId;
}

function linePrefix(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line, index) => `${String(index + 1).padStart(3, "0")}: ${line}`)
    .join("\n");
}

function taskRows(files) {
  const rows = [];
  for (const file of files) {
    const run = readJson(file.runJson);
    for (const [suiteName, suite] of Object.entries(run.suites ?? {})) {
      for (const task of suite.tasks ?? []) {
        rows.push({
          run_id: shortRunId(file),
          sweep: file.inputDir.split("/").at(-1),
          iteration: file.iteration,
          candidate: file.candidate,
          model_id: file.modelId,
          model: modelShort(file.modelId),
          suite: suiteName,
          task_id: task.task_id,
          score: Number(task.score ?? 0),
          passed: Boolean(task.passed),
          error: String(task.error ?? ""),
          output: String(task.output ?? ""),
          latency_ms: Number(task.latency_ms ?? 0),
          tokens_generated: Number(task.tokens_generated ?? 0),
          tokens_prompt: Number(task.tokens_prompt ?? 0),
          metadata: task.metadata ?? {},
          run_json: file.runJson,
          policy_json: file.policyJson,
        });
      }
    }
  }
  return rows;
}

function groupBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return map;
}

function taskStats(rows) {
  const grouped = groupBy(rows, (row) => `${row.model}|${row.suite}|${row.task_id}`);
  return [...grouped.entries()].map(([key, list]) => {
    const scores = list.map((row) => row.score);
    const best = [...list].sort((a, b) => b.score - a.score || b.iteration - a.iteration)[0];
    const worst = [...list].sort((a, b) => a.score - b.score || b.iteration - a.iteration)[0];
    const latestExtra5 = list.find((row) => row.run_id === "extra5-i05");
    const latestExtra3Control = list.find((row) => row.run_id === "extra3-i01");
    return {
      key,
      model: list[0].model,
      suite: list[0].suite,
      task_id: list[0].task_id,
      min_score: Math.min(...scores),
      max_score: Math.max(...scores),
      spread: Math.max(...scores) - Math.min(...scores),
      average_score: scores.reduce((sum, item) => sum + item, 0) / scores.length,
      best_run: best.run_id,
      best_candidate: best.candidate,
      best_score: best.score,
      worst_run: worst.run_id,
      worst_candidate: worst.candidate,
      worst_score: worst.score,
      current_extra5_score: latestExtra5?.score ?? null,
      control_extra3_score: latestExtra3Control?.score ?? null,
      scores: Object.fromEntries([...list].sort((a, b) => a.run_id.localeCompare(b.run_id)).map((row) => [row.run_id, row.score])),
      errors: Object.fromEntries([...list].sort((a, b) => a.run_id.localeCompare(b.run_id)).map((row) => [row.run_id, row.error])),
    };
  }).sort((a, b) => b.spread - a.spread || a.model.localeCompare(b.model) || a.suite.localeCompare(b.suite) || a.task_id.localeCompare(b.task_id));
}

function suiteCandidateStats(rows) {
  const grouped = groupBy(rows, (row) => `${row.model}|${row.run_id}|${row.candidate}|${row.suite}`);
  return [...grouped.values()].map((list) => ({
    model: list[0].model,
    run_id: list[0].run_id,
    candidate: list[0].candidate,
    suite: list[0].suite,
    average_task_score: list.reduce((sum, row) => sum + row.score, 0) / list.length,
    failed_or_partial: list.filter((row) => row.score < 100).length,
    task_count: list.length,
  })).sort((a, b) => a.model.localeCompare(b.model) || a.suite.localeCompare(b.suite) || b.average_task_score - a.average_task_score);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(file, rows) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]).filter((key) => !["metadata", "output"].includes(key));
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  writeText(file, `${lines.join("\n")}\n`);
}

function markdownSummary(stats, suiteStats) {
  const highVariance = stats.filter((row) => row.spread >= 25).slice(0, 40);
  const currentFailures = stats.filter((row) => Number(row.current_extra5_score ?? 100) < 100).slice(0, 60);
  const lines = [
    "# Gemma 4 Forensic Output Analysis",
    "",
    "This report compares every BenchLoop task output across Extra5 and Extra3 runs. Full per-run outputs are in `full-task-diff.md`; machine-readable rows are in `task-rows.json` and `task-stats.json`.",
    "",
    "## High-Variance Tasks",
    "",
    "| Model | Suite | Task | Spread | Best | Worst | Scores |",
    "|---|---|---|---:|---|---|---|",
    ...highVariance.map((row) => `| ${row.model} | ${row.suite} | \`${row.task_id}\` | ${row.spread.toFixed(2)} | ${row.best_run} ${row.best_score.toFixed(2)} | ${row.worst_run} ${row.worst_score.toFixed(2)} | ${Object.entries(row.scores).map(([run, score]) => `${run}:${Number(score).toFixed(0)}`).join(" ")} |`),
    "",
    "## Current Extra5 Non-Perfect Tasks",
    "",
    "| Model | Suite | Task | Extra5 Score | Best Run | Best Score | Error In Extra5 |",
    "|---|---|---|---:|---|---:|---|",
    ...currentFailures.map((row) => `| ${row.model} | ${row.suite} | \`${row.task_id}\` | ${Number(row.current_extra5_score ?? 0).toFixed(2)} | ${row.best_run} | ${row.best_score.toFixed(2)} | ${String(row.errors["extra5-i05"] ?? "").replaceAll("|", "/").slice(0, 140)} |`),
    "",
    "## Best Candidate By Model/Suite",
    "",
    "| Model | Suite | Best Run | Candidate | Avg Task Score | Partials |",
    "|---|---|---|---|---:|---:|",
  ];
  const bestBySuite = new Map();
  for (const row of suiteStats) {
    const key = `${row.model}|${row.suite}`;
    const current = bestBySuite.get(key);
    if (!current || row.average_task_score > current.average_task_score) bestBySuite.set(key, row);
  }
  for (const row of [...bestBySuite.values()].sort((a, b) => a.model.localeCompare(b.model) || a.suite.localeCompare(b.suite))) {
    lines.push(`| ${row.model} | ${row.suite} | ${row.run_id} | \`${row.candidate}\` | ${row.average_task_score.toFixed(2)} | ${row.failed_or_partial}/${row.task_count} |`);
  }
  return `${lines.join("\n")}\n`;
}

function fullDiffMarkdown(rows, stats) {
  const byTask = groupBy(rows, (row) => `${row.model}|${row.suite}|${row.task_id}`);
  const interesting = stats.filter((row) => row.spread >= 15 || Number(row.current_extra5_score ?? 100) < 100);
  const lines = [
    "# Full Task Output Diff",
    "",
    "Outputs are line-numbered so output-format regressions can be inspected directly.",
    "",
  ];
  for (const stat of interesting) {
    const list = [...(byTask.get(stat.key) ?? [])].sort((a, b) => a.run_id.localeCompare(b.run_id));
    lines.push(`## ${stat.model} ${stat.suite}/${stat.task_id}`);
    lines.push("");
    lines.push(`- Spread: ${stat.spread.toFixed(2)}`);
    lines.push(`- Best: ${stat.best_run} \`${stat.best_candidate}\` score=${stat.best_score.toFixed(2)}`);
    lines.push(`- Worst: ${stat.worst_run} \`${stat.worst_candidate}\` score=${stat.worst_score.toFixed(2)}`);
    lines.push("");
    for (const row of list) {
      lines.push(`### ${row.run_id} \`${row.candidate}\` score=${row.score.toFixed(2)} passed=${row.passed}`);
      if (row.error) lines.push(`Error: ${row.error}`);
      lines.push("");
      lines.push("```text");
      lines.push(linePrefix(row.output));
      lines.push("```");
      lines.push("");
    }
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = listRunJsons(args.inputs);
  const rows = taskRows(files);
  const stats = taskStats(rows);
  const suiteStats = suiteCandidateStats(rows);

  writeJson(path.join(args.outDir, "runs.json"), files);
  writeJson(path.join(args.outDir, "task-rows.json"), rows);
  writeJson(path.join(args.outDir, "task-stats.json"), stats);
  writeJson(path.join(args.outDir, "suite-candidate-stats.json"), suiteStats);
  writeCsv(path.join(args.outDir, "task-rows.csv"), rows);
  writeCsv(path.join(args.outDir, "task-stats.csv"), stats);
  writeCsv(path.join(args.outDir, "suite-candidate-stats.csv"), suiteStats);
  writeText(path.join(args.outDir, "summary.md"), markdownSummary(stats, suiteStats));
  writeText(path.join(args.outDir, "full-task-diff.md"), fullDiffMarkdown(rows, stats));
  console.log(JSON.stringify({
    outDir: args.outDir,
    runs: files.length,
    taskRows: rows.length,
    taskStats: stats.length,
    highVarianceTasks: stats.filter((row) => row.spread >= 25).length,
    currentExtra5NonPerfect: stats.filter((row) => Number(row.current_extra5_score ?? 100) < 100).length,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
