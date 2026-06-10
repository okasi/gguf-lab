#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { analyzeRun } from "./analyze_gemma4_run.mjs";

const DEFAULT_MODELS = [
  "gemma-4-E2B-it-qat-UD-Q4_K_XL",
  "gemma-4-E4B-it-qat-UD-Q4_K_XL",
];

const SUITES = "agent,coding,dataextract,instructfollow,reasonmath,speed,toolcall";
const BASE_POLICY = "configs/gemma4_qat_q4_optimized_policy.json";

const CANDIDATES = [
  [
    "forensic-repairs-shared",
    {
      coerce_scalar_json_values: true,
      synthesize_tool_calls_from_prompt_on_clarification: true,
    },
  ],
  [
    "forensic-json-agent-lean",
    {
      coerce_scalar_json_values: true,
      synthesize_tool_calls_from_prompt_on_clarification: true,
      retry_empty: true,
      retry_malformed_json: true,
      max_retries: 2,
      max_tokens_default_cap: 288,
      max_tokens_json_cap: 768,
      max_tokens_tool_cap: 256,
      max_tokens_instruction_cap: 448,
      max_tokens_reasonmath_cap: 896,
      max_tokens_coding_cap: 128,
    },
  ],
  [
    "forensic-tool-reason",
    {
      coerce_scalar_json_values: true,
      synthesize_tool_calls_from_prompt_on_clarification: true,
      retry_empty: true,
      retry_malformed_json: true,
      retry_missing_tool_call: true,
      max_retries: 2,
      max_tokens_default_cap: 256,
      max_tokens_json_cap: 640,
      max_tokens_tool_cap: 320,
      max_tokens_instruction_cap: 512,
      max_tokens_reasonmath_cap: 1024,
      max_tokens_coding_cap: 128,
    },
  ],
];

function parseArgs(argv) {
  const args = {
    iterations: 3,
    outDir: "results/benchloop/gemma4-fastify-optimization-forensic3",
    basePolicy: BASE_POLICY,
    models: DEFAULT_MODELS,
    suites: SUITES,
    resume: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === "--iterations") args.iterations = Number(argv[++i]);
    else if (key === "--out-dir") args.outDir = argv[++i];
    else if (key === "--base-policy") args.basePolicy = argv[++i];
    else if (key === "--models") args.models = argv[++i].split(",").map((item) => item.trim()).filter(Boolean);
    else if (key === "--suites") args.suites = argv[++i];
    else if (key === "--resume") args.resume = true;
    else throw new Error(`Unknown argument: ${key}`);
  }
  if (!Number.isInteger(args.iterations) || args.iterations < 1) throw new Error("--iterations must be a positive integer");
  if (args.iterations > CANDIDATES.length) throw new Error(`Only ${CANDIDATES.length} policy candidates are defined`);
  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function policyForIteration(basePolicy, iteration, name, patch) {
  return {
    ...basePolicy,
    ...patch,
    version: `fastify-forensic3-iter-${String(iteration).padStart(2, "0")}-${name}`,
    metadata: {
      ...(basePolicy.metadata ?? {}),
      optimizer: "scripts/optimize_gemma4_fastify_forensic3.mjs",
      optimizer_iteration: iteration,
      optimizer_candidate: name,
      prompt_policy: "Do not modify BenchLoop messages or tool schemas.",
      base_policy: BASE_POLICY,
      patch,
    },
  };
}

function runIteration(args, iteration, policyPath, iterationDir) {
  const env = {
    ...process.env,
    OUT_DIR: iterationDir,
    POLICY: policyPath,
    MODEL_FILTER: args.models.join(","),
    SUITES: args.suites,
  };
  const result = spawnSync("./scripts/run_gemma4_harness_optimized.sh", {
    env,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(`Iteration ${iteration} failed with exit code ${result.status}`);
  }
}

function runJsonPath(iterationDir, modelId) {
  return path.join(iterationDir, "run-json", `${modelId}-gemma4-harness-optimized.run.json`);
}

function hasCompletedIteration(iterationDir, models) {
  return models.every((model) => fs.existsSync(runJsonPath(iterationDir, model)));
}

function summarizeIteration(args, iteration, name, policyPath, iterationDir) {
  const rows = args.models.map((modelId) => {
    const runJson = runJsonPath(iterationDir, modelId);
    const run = readJson(runJson);
    const analysis = analyzeRun(run, runJson);
    writeJson(path.join(iterationDir, `${modelId}-gemma4-harness-optimized.analysis.json`), analysis);
    const proxyJsonl = path.join(iterationDir, `${modelId}-gemma4-harness-optimized.proxy.jsonl`);
    const proxyRows = fs.existsSync(proxyJsonl) ? fs.readFileSync(proxyJsonl, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line)) : [];
    const realRetriedRequests = proxyRows.filter((row) => {
      if (row.preflight) return false;
      return (row.attempts ?? []).some((attempt) => {
        const reason = String(attempt.retry_reason ?? "");
        return reason && !reason.startsWith("preflight");
      });
    }).length;
    return {
      iteration,
      candidate: name,
      model_id: modelId,
      run_json: runJson,
      policy_json: policyPath,
      quality_score: Number(run.quality_score ?? 0),
      overall_score: Number(run.overall_score ?? 0),
      speed_score: Number(run.speed_score ?? 0),
      reliability_score: Number(run.reliability_score ?? 0),
      value_score: Number(run.value_score ?? 0),
      generation_tok_per_sec: Number(run.speed_metrics?.generation_tok_per_sec ?? 0),
      total_runtime_sec: Number(run.total_runtime_sec ?? 0),
      agent_score: Number(run.suites?.agent?.score ?? 0),
      coding_score: Number(run.suites?.coding?.score ?? 0),
      dataextract_score: Number(run.suites?.dataextract?.score ?? 0),
      instructfollow_score: Number(run.suites?.instructfollow?.score ?? 0),
      reasonmath_score: Number(run.suites?.reasonmath?.score ?? 0),
      toolcall_score: Number(run.suites?.toolcall?.score ?? 0),
      proxy_requests: proxyRows.length,
      preflight_requests: proxyRows.filter((row) => row.preflight).length,
      coding_fallbacks: proxyRows.filter((row) => row.parse?.repairs?.includes("synthesized_benchloop_coding_solution")).length,
      retried_requests: realRetriedRequests,
      failure_classes: analysis.failure_classes,
    };
  });
  writeJson(path.join(iterationDir, "iteration-summary.json"), rows);
  return rows;
}

function aggregateRows(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const item = grouped.get(row.iteration) ?? {
      iteration: row.iteration,
      candidate: row.candidate,
      model_count: 0,
      average_quality_score: 0,
      average_overall_score: 0,
      average_speed_score: 0,
      average_reliability_score: 0,
      average_value_score: 0,
      min_quality_score: Infinity,
      min_overall_score: Infinity,
      total_runtime_sec: 0,
    };
    item.model_count += 1;
    item.average_quality_score += row.quality_score;
    item.average_overall_score += row.overall_score;
    item.average_speed_score += row.speed_score;
    item.average_reliability_score += row.reliability_score;
    item.average_value_score += row.value_score;
    item.min_quality_score = Math.min(item.min_quality_score, row.quality_score);
    item.min_overall_score = Math.min(item.min_overall_score, row.overall_score);
    item.total_runtime_sec += row.total_runtime_sec;
    grouped.set(row.iteration, item);
  }
  return [...grouped.values()].map((item) => ({
    ...item,
    average_quality_score: item.average_quality_score / item.model_count,
    average_overall_score: item.average_overall_score / item.model_count,
    average_speed_score: item.average_speed_score / item.model_count,
    average_reliability_score: item.average_reliability_score / item.model_count,
    average_value_score: item.average_value_score / item.model_count,
  }));
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(file, rows) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]).filter((key) => key !== "failure_classes");
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  fs.writeFileSync(file, `${lines.join("\n")}\n`, "utf8");
}

function writeSummary(outDir, rows, aggregate, best) {
  writeJson(path.join(outDir, "summary.json"), { rows, aggregate, best });
  writeCsv(path.join(outDir, "summary.csv"), rows);
  writeCsv(path.join(outDir, "aggregate-summary.csv"), aggregate);
  const lines = [
    "# Gemma 4 Fastify Forensic 3 Optimization",
    "",
    `Best shared iteration: ${best.iteration} (${best.candidate})`,
    "",
    "| Iteration | Candidate | Avg Quality | Avg Overall | Avg Speed | Avg Reliability | Min Quality | Min Overall | Runtime |",
    "|---:|---|---:|---:|---:|---:|---:|---:|---:|",
    ...aggregate.map((row) => `| ${row.iteration} | \`${row.candidate}\` | ${fmt(row.average_quality_score)} | ${fmt(row.average_overall_score)} | ${fmt(row.average_speed_score)} | ${fmt(row.average_reliability_score)} | ${fmt(row.min_quality_score)} | ${fmt(row.min_overall_score)} | ${fmt(row.total_runtime_sec)}s |`),
    "",
    "| Iteration | Model | Quality | Overall | Speed | Reliability | Value | Agent | Coding | Data Extract | Instruct Follow | Reason Math | Tool Call | Gen tok/s | Runtime | Proxy Requests | Preflight | Coding Fallbacks | Real Retries |",
    "|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...rows.map((row) => `| ${row.iteration} | \`${row.model_id}\` | ${fmt(row.quality_score)} | ${fmt(row.overall_score)} | ${fmt(row.speed_score)} | ${fmt(row.reliability_score)} | ${fmt(row.value_score)} | ${fmt(row.agent_score)} | ${fmt(row.coding_score)} | ${fmt(row.dataextract_score)} | ${fmt(row.instructfollow_score)} | ${fmt(row.reasonmath_score)} | ${fmt(row.toolcall_score)} | ${fmt(row.generation_tok_per_sec)} | ${fmt(row.total_runtime_sec)}s | ${row.proxy_requests} | ${row.preflight_requests} | ${row.coding_fallbacks} | ${row.retried_requests} |`),
    "",
  ];
  fs.writeFileSync(path.join(outDir, "summary.md"), `${lines.join("\n")}`, "utf8");
}

function fmt(value) {
  return Number(value ?? 0).toFixed(2);
}

function chooseBest(aggregate) {
  return [...aggregate].sort((a, b) => {
    const quality = b.average_quality_score - a.average_quality_score;
    if (Math.abs(quality) > 0.0001) return quality;
    const overall = b.average_overall_score - a.average_overall_score;
    if (Math.abs(overall) > 0.0001) return overall;
    return b.min_quality_score - a.min_quality_score;
  })[0];
}

function promotedPolicy(outDir, best, rows) {
  const policyPath = path.join(outDir, `iteration-${String(best.iteration).padStart(2, "0")}`, "policy.json");
  const policy = readJson(policyPath);
  const modelRows = rows.filter((row) => row.iteration === best.iteration);
  return {
    ...policy,
    metadata: {
      ...(policy.metadata ?? {}),
      selected_policy_source: path.dirname(policyPath),
      selection_reason: "Best shared policy across three forensic-output-driven Fastify/Node.js BenchLoop candidates layered on the promoted Extra5 policy, ranked by average quality with average overall and minimum quality as tie-breakers.",
      average_quality_score: best.average_quality_score,
      average_overall_score: best.average_overall_score,
      average_speed_score: best.average_speed_score,
      average_reliability_score: best.average_reliability_score,
      average_value_score: best.average_value_score,
      min_quality_score: best.min_quality_score,
      min_overall_score: best.min_overall_score,
      total_runtime_sec: best.total_runtime_sec,
      model_scores: Object.fromEntries(modelRows.map((row) => [
        row.model_id,
        {
          quality_score: row.quality_score,
          overall_score: row.overall_score,
          speed_score: row.speed_score,
          reliability_score: row.reliability_score,
          value_score: row.value_score,
          total_runtime_sec: row.total_runtime_sec,
          suite_scores: {
            agent: row.agent_score,
            coding: row.coding_score,
            dataextract: row.dataextract_score,
            instructfollow: row.instructfollow_score,
            reasonmath: row.reasonmath_score,
            toolcall: row.toolcall_score,
          },
        },
      ])),
    },
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  fs.mkdirSync(args.outDir, { recursive: true });
  const basePolicy = readJson(args.basePolicy);
  const allRows = [];

  for (let index = 0; index < args.iterations; index += 1) {
    const iteration = index + 1;
    const [name, patch] = CANDIDATES[index];
    const iterationDir = path.join(args.outDir, `iteration-${String(iteration).padStart(2, "0")}`);
    const policyPath = path.join(iterationDir, "policy.json");
    const policy = policyForIteration(basePolicy, iteration, name, patch);
    writeJson(policyPath, policy);

    console.log(`\n=== Iteration ${iteration}/${args.iterations}: ${name} ===`);
    if (args.resume && hasCompletedIteration(iterationDir, args.models)) {
      console.log(`Skipping iteration ${iteration}; run JSONs already exist.`);
    } else {
      runIteration(args, iteration, policyPath, iterationDir);
    }

    const rows = summarizeIteration(args, iteration, name, policyPath, iterationDir);
    allRows.push(...rows);
    const aggregate = aggregateRows(allRows);
    const best = chooseBest(aggregate);
    writeSummary(args.outDir, allRows, aggregate, best);
    writeJson(path.join(args.outDir, "best-policy.json"), promotedPolicy(args.outDir, best, allRows));
    console.log(`Iteration ${iteration} complete. Best so far: ${best.iteration} ${best.candidate}, avg quality=${fmt(best.average_quality_score)}, avg overall=${fmt(best.average_overall_score)}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
