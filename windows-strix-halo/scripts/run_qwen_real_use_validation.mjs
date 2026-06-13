#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const DEFAULT_PROMPTS = path.join(REPO_ROOT, "qwen_harness/real_use_validation_prompts.json");
const DEFAULT_OUT = path.join(REPO_ROOT, "windows-strix-halo/logs/qwen-real-use-validation");

function parseArgs(argv) {
  const args = {
    endpoint: "http://127.0.0.1:8080",
    model: "",
    prompts: DEFAULT_PROMPTS,
    outDir: DEFAULT_OUT,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === "--endpoint") args.endpoint = argv[++i];
    else if (key === "--model") args.model = argv[++i];
    else if (key === "--prompts") args.prompts = path.resolve(argv[++i]);
    else if (key === "--out-dir") args.outDir = path.resolve(argv[++i]);
    else throw new Error(`Unknown argument: ${key}`);
  }
  if (!args.model) throw new Error("--model is required");
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

function appendJsonl(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`, "utf8");
}

function firstMessage(response) {
  return response?.choices?.[0]?.message ?? {};
}

function validateNonemptyContent(response) {
  const content = String(firstMessage(response).content ?? "").trim();
  return content ? [] : ["assistant content is empty"];
}

function validateJsonObjectContent(response) {
  const content = String(firstMessage(response).content ?? "").trim();
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? [] : ["assistant content is not a JSON object"];
  } catch (error) {
    return [`assistant content is not parseable JSON: ${error.message}`];
  }
}

function validateToolCalls(response, request) {
  const message = firstMessage(response);
  const calls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
  if (!calls.length) return ["no tool_calls emitted"];
  const allowed = new Set((request.tools ?? []).map((tool) => tool?.function?.name).filter(Boolean));
  const failures = [];
  for (const call of calls) {
    const name = call?.function?.name ?? "";
    if (!allowed.has(name)) failures.push(`tool_call used unknown tool: ${name}`);
    try {
      JSON.parse(call?.function?.arguments ?? "{}");
    } catch (error) {
      failures.push(`tool_call arguments are not parseable JSON for ${name}: ${error.message}`);
    }
  }
  return failures;
}

function validateResponse(response, request, validators) {
  const failures = [];
  for (const validator of validators ?? []) {
    if (validator === "nonempty_content") failures.push(...validateNonemptyContent(response));
    else if (validator === "json_object_content") failures.push(...validateJsonObjectContent(response));
    else if (validator === "valid_tool_calls") failures.push(...validateToolCalls(response, request));
    else failures.push(`unknown validator: ${validator}`);
  }
  return failures;
}

async function postChat(endpoint, payload) {
  const response = await fetch(new URL("/v1/chat/completions", endpoint), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw_text: text };
  }
  return { status: response.status, body };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prompts = readJson(args.prompts);
  fs.mkdirSync(args.outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z");
  const rawJsonl = path.join(args.outDir, `${stamp}-${args.model}-raw.jsonl`.replace(/[^\w.=-]+/g, "_"));
  const rows = [];

  for (const item of prompts) {
    const request = { model: args.model, temperature: 0.85, ...item.request };
    const started = Date.now();
    const result = await postChat(args.endpoint, request);
    const elapsedMs = Date.now() - started;
    const failures = result.status >= 400
      ? [`HTTP ${result.status}`]
      : validateResponse(result.body, request, item.validators);
    const row = {
      id: item.id,
      status: failures.length ? "failed" : "ok",
      failures,
      elapsed_ms: elapsedMs,
      http_status: result.status,
    };
    rows.push(row);
    appendJsonl(rawJsonl, {
      ts: new Date().toISOString(),
      id: item.id,
      description: item.description,
      validators: item.validators,
      request,
      http_status: result.status,
      response: result.body,
      validation: row,
    });
    console.log(`${row.status.toUpperCase()} ${item.id} ${elapsedMs}ms${failures.length ? ` ${failures.join("; ")}` : ""}`);
  }

  const summary = {
    timestamp: new Date().toISOString(),
    endpoint: args.endpoint,
    model: args.model,
    prompts: args.prompts,
    raw_jsonl: rawJsonl,
    passed: rows.filter((row) => row.status === "ok").length,
    failed: rows.filter((row) => row.status !== "ok").length,
    rows,
  };
  const summaryPath = path.join(args.outDir, `${stamp}-${args.model}-summary.json`.replace(/[^\w.=-]+/g, "_"));
  writeJson(summaryPath, summary);
  console.log(`Summary: ${summaryPath}`);
  if (summary.failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
