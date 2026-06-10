#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sweepDir = process.argv[2] ?? path.join(root, "results/benchloop/gemma4-12b-qat-unsloth-mtp-sweep-16gb-maxctx");

const rows = [];
for (const tag of fs.readdirSync(sweepDir)) {
  const runJson = path.join(sweepDir, "run-json", `gemma-4-12B-it-qat-UD-Q4_K_XL.${tag}.run.json`);
  if (!fs.existsSync(runJson)) continue;
  const run = JSON.parse(fs.readFileSync(runJson, "utf8"));
  const cfgPath = path.join(sweepDir, tag, "run-config.json");
  const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, "utf8")) : {};
  rows.push({
    tag,
    n_max: cfg.spec_draft_n_max,
    reasoning: cfg.reasoning,
    quality: run.quality_score,
    overall: run.overall_score,
    speed: run.speed_score,
    reliability: run.reliability_score,
    gen_tps: run.speed_metrics?.generation_tok_per_sec,
    runtime_sec: run.total_runtime_sec,
  });
}

rows.sort((a, b) => (a.n_max - b.n_max) || a.reasoning.localeCompare(b.reasoning));

const lines = [
  "# Gemma 4 12B QAT Unsloth MTP sweep (16GB cap, max ctx)",
  "",
  "Server: `-c 0` (262144), `--fit on --fit-target 16384`, `-ngl 999 -ngld 999 -fa on`, `--spec-type draft-mtp`",
  "Models: `unsloth/gemma-4-12b-it-qat-GGUF` target + `MTP/gemma-4-12B-it-Q8_0-MTP.gguf` draft",
  "",
  "| tag | n-max | reasoning | quality | overall | speed | gen tok/s | runtime |",
  "|---|---:|---|---:|---:|---:|---:|---:|",
];

for (const r of rows) {
  lines.push(
    `| ${r.tag} | ${r.n_max} | ${r.reasoning} | ${r.quality?.toFixed(1)} | ${r.overall?.toFixed(1)} | ${r.speed?.toFixed(1)} | ${r.gen_tps?.toFixed(2)} | ${r.runtime_sec?.toFixed(0)}s |`,
  );
}

const out = path.join(sweepDir, "summary.md");
fs.writeFileSync(out, `${lines.join("\n")}\n`);
console.log(`Wrote ${out} (${rows.length} rows)`);
