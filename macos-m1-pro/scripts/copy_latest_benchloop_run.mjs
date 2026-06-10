#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [alias, benchLog, dest] = process.argv.slice(2);
if (!alias || !benchLog || !dest) {
  console.error("Usage: copy_latest_benchloop_run.mjs MODEL_ALIAS BENCH_LOG DEST_JSON");
  process.exit(2);
}

function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function copyRunJson(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  console.log(source);
}

function candidatesFromBenchLog(file) {
  if (!fs.existsSync(file)) return [];
  const text = stripAnsi(fs.readFileSync(file, "utf8"));
  const matches = [...text.matchAll(/Saved results to\s+([\s\S]*?run\.json)/g)];
  return matches.map((match) => match[1].replace(/\s+/g, "").trim()).filter(Boolean).reverse();
}

function walkRunJsons(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name === "run.json") out.push(full);
    }
  }
  return out;
}

for (const candidate of candidatesFromBenchLog(benchLog)) {
  if (fs.existsSync(candidate)) {
    copyRunJson(candidate, dest);
    process.exit(0);
  }
}

const runsRoot = path.join(os.homedir(), ".bench-loop", "runs");
const candidates = walkRunJsons(runsRoot)
  .filter((file) => file.includes(alias))
  .map((file) => ({ file, mtime: fs.statSync(file).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime);

if (!candidates.length) {
  console.error(`No BenchLoop run.json found for ${alias}`);
  process.exit(1);
}

copyRunJson(candidates[0].file, dest);
