#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ACTIONABLE_HINTS = {
  invalid_json: "Enable JSON extraction/repair and escaped JSON parsing.",
  numeric_string: "Enable numeric coercion for extraction JSON values.",
  tool_missing: "Enable tool-call synthesis for obvious tool-use prompts.",
  tool_unneeded: "Enable direct-answer guard to drop unnecessary tool calls.",
  tool_partial_batch: "Enable missing batch-call synthesis.",
  answer_line: "Enable answer-line canonicalization.",
  format_cleanup: "Enable fence/reasoning stripping and content normalization.",
  speed_measurement: "Use conservative max-token caps by task type to reduce temp=1 rambling.",
};

function parseArgs(argv) {
  const args = { runJson: null, jsonOut: null, mdOut: null };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--json-out") args.jsonOut = argv[++i];
    else if (item === "--md-out") args.mdOut = argv[++i];
    else if (!args.runJson) args.runJson = item;
    else throw new Error(`Unexpected argument: ${item}`);
  }
  if (!args.runJson) throw new Error("Usage: analyze_gemma4_run.mjs RUN_JSON [--json-out FILE] [--md-out FILE]");
  return args;
}

function inc(map, key, amount = 1) {
  map[key] = (map[key] ?? 0) + amount;
}

function classifyTask(suiteName, task) {
  const labels = [];
  const error = String(task.error ?? "").toLowerCase();
  const output = String(task.output ?? "");
  const metadata = task.metadata && typeof task.metadata === "object" ? task.metadata : {};
  const score = Number(task.score ?? 0);

  if (suiteName === "dataextract") {
    if (error.includes("invalid json") || metadata.evaluation_status === "invalid_json") labels.push("invalid_json");
    if (error.includes("expected number")) labels.push("numeric_string");
    if (output.trimStart().startsWith("```") || output.includes('\\"')) labels.push("format_cleanup");
    if (!labels.length) labels.push("semantic_extraction");
  } else if (suiteName === "toolcall" || suiteName === "agent") {
    if (error.includes("answered directly instead of using tools") || error.includes("matched 0/")) labels.push("tool_missing");
    if (error.includes("unexpected tool call")) labels.push("tool_unneeded");
    if (error.includes("matched 1/2") || (String(metadata).toLowerCase().includes("all_required_called") && score < 100)) labels.push("tool_partial_batch");
    if (!labels.length && score < 100) labels.push("agent_or_tool_semantic");
  } else if (suiteName === "reasonmath") {
    if (error.includes("missing answer line") || error.includes("missing switch") || error.includes("missing stay")) labels.push("answer_line");
    else if (score < 85) labels.push("semantic_math");
  } else if (suiteName === "instructfollow") {
    if (score < 85) labels.push("format_or_instruction");
  } else if (suiteName === "coding") {
    if (error.includes("no code") || error.includes("syntax")) labels.push("format_cleanup");
    else labels.push("coding_semantic");
  } else if (suiteName === "speed") {
    labels.push("speed_measurement");
  }

  return labels.length ? labels : ["uncategorized"];
}

export function analyzeRun(run, source = "") {
  const suiteScores = {};
  const failureClasses = {};
  const failureClassesBySuite = {};
  const examples = {};
  let totalFailures = 0;

  for (const [suiteName, suite] of Object.entries(run.suites ?? {})) {
    suiteScores[suiteName] = Number(suite.score ?? 0);
    failureClassesBySuite[suiteName] = {};
    for (const task of suite.tasks ?? []) {
      if (task.passed && Number(task.score ?? 0) >= 100) continue;
      totalFailures += 1;
      for (const label of classifyTask(suiteName, task)) {
        inc(failureClasses, label);
        inc(failureClassesBySuite[suiteName], label);
        examples[label] ??= [];
        if (examples[label].length < 8) {
          examples[label].push({
            suite: suiteName,
            task_id: task.task_id,
            score: task.score,
            error: String(task.error ?? ""),
            output: String(task.output ?? "").slice(0, 240),
          });
        }
      }
    }
  }

  const recommendations = Object.entries(failureClasses)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label]) => ACTIONABLE_HINTS[label])
    .filter((hint, index, arr) => hint && arr.indexOf(hint) === index);

  return {
    source,
    model: run.model?.model_id ?? run.model,
    overall_score: run.overall_score,
    quality_score: run.quality_score,
    speed_score: run.speed_score,
    reliability_score: run.reliability_score,
    suite_scores: suiteScores,
    total_failures_or_partials: totalFailures,
    failure_classes: failureClasses,
    failure_classes_by_suite: failureClassesBySuite,
    examples,
    recommendations,
  };
}

function markdown(analysis) {
  const lines = [
    "# Gemma 4 Harness Failure Analysis",
    "",
    `- Source: \`${analysis.source ?? ""}\``,
    `- Model: \`${analysis.model ?? ""}\``,
    `- Overall: ${analysis.overall_score}`,
    `- Quality: ${analysis.quality_score}`,
    `- Speed: ${analysis.speed_score}`,
    `- Reliability: ${analysis.reliability_score}`,
    `- Failures/partials: ${analysis.total_failures_or_partials}`,
    "",
    "## Failure Classes",
    "",
    "| Class | Count |",
    "| --- | ---: |",
  ];
  for (const [label, count] of Object.entries(analysis.failure_classes).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    lines.push(`| \`${label}\` | ${count} |`);
  }
  lines.push("", "## Recommendations", "");
  for (const item of analysis.recommendations) lines.push(`- ${item}`);
  lines.push("", "## Examples", "");
  for (const [label, rows] of Object.entries(analysis.examples)) {
    lines.push(`### \`${label}\``);
    for (const row of rows) {
      lines.push(`- \`${row.suite}/${row.task_id}\` score=${row.score}: ${String(row.error).replaceAll("|", "/").slice(0, 180)}`);
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const run = JSON.parse(fs.readFileSync(args.runJson, "utf8"));
    const analysis = analyzeRun(run, args.runJson);
    const json = JSON.stringify(analysis, null, 2);
    console.log(json);
    if (args.jsonOut) {
      fs.mkdirSync(path.dirname(args.jsonOut), { recursive: true });
      fs.writeFileSync(args.jsonOut, json, "utf8");
    }
    if (args.mdOut) {
      fs.mkdirSync(path.dirname(args.mdOut), { recursive: true });
      fs.writeFileSync(args.mdOut, markdown(analysis), "utf8");
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
