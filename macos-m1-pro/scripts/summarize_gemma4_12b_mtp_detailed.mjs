#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sweepDir =
  process.argv[2] ??
  path.join(root, "results/benchloop/gemma4-12b-qat-unsloth-mtp-sweep-16gb-maxctx");

function parseServerLog(logPath) {
  if (!fs.existsSync(logPath)) return {};
  const text = fs.readFileSync(logPath, "utf8");
  const nums = (re) =>
    [...text.matchAll(re)].map((m) => Number(m[1])).filter((n) => Number.isFinite(n));

  const cache = nums(/cache state: \d+ prompts, ([0-9.]+) MiB/g);
  const states = nums(/total state size = ([0-9.]+) MiB/g);
  const checkpoints = nums(/size = ([0-9.]+) MiB/g);
  const draft = nums(/draft acceptance = ([0-9.]+)/g);
  const nCtx = text.match(/new slot, n_ctx = (\d+)/)?.[1];

  return {
    n_ctx: nCtx ? Number(nCtx) : null,
    max_prompt_cache_mib: cache.length ? Math.max(...cache) : null,
    max_prompt_state_mib: states.length ? Math.max(...states) : null,
    max_checkpoint_mib: checkpoints.length ? Math.max(...checkpoints) : null,
    draft_accept_pct: draft.length
      ? (draft.reduce((a, b) => a + b, 0) / draft.length) * 100
      : null,
  };
}

// Fresh RSS probes (load, idle, post-warmup) on Apple M1 Pro 32GB unified memory.
const loadRssMib = {
  "baseline-no-mtp": 7014,
  "janvitos-mtp-ctx4096": 7651,
  "mtp-ctx262144": 11574,
  "mtp-ctx262144-reasoning-on": 11693,
};

const baselines = [
  {
    label: "baseline-no-mtp",
    mtp: "none",
    n_max: "—",
    reasoning: "off",
    ctx_req: 4096,
    ngl: "all",
    fa: "auto",
    runJson: path.join(
      root,
      "results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL.run.json",
    ),
    serverLog: path.join(
      root,
      "results/benchloop/qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/gemma-4-12B-it-qat-UD-Q4_K_XL.server.log",
    ),
    load_rss_mib: loadRssMib["baseline-no-mtp"],
  },
  {
    label: "janvitos-mtp-ctx4096",
    mtp: "Janvitos",
    n_max: 4,
    reasoning: "off",
    ctx_req: 4096,
    ngl: "all",
    fa: "auto",
    runJson: path.join(
      root,
      "results/benchloop/gemma4-12b-qat-mtp-metal-temp1-top_p095-top_k64/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL.run.json",
    ),
    serverLog: path.join(
      root,
      "results/benchloop/gemma4-12b-qat-mtp-metal-temp1-top_p095-top_k64/gemma-4-12B-it-qat-UD-Q4_K_XL.server.log",
    ),
    load_rss_mib: loadRssMib["janvitos-mtp-ctx4096"],
  },
];

const rows = [];

for (const base of baselines) {
  const run = JSON.parse(fs.readFileSync(base.runJson, "utf8"));
  const mem = parseServerLog(base.serverLog);
  rows.push({
    label: base.label,
    mtp: base.mtp,
    n_max: base.n_max,
    reasoning: base.reasoning,
    ctx_req: base.ctx_req,
    ngl: base.ngl,
    fa: base.fa,
    quality: run.quality_score,
    overall: run.overall_score,
    speed: run.speed_score,
    reliability: run.reliability_score,
    gen_tps: run.speed_metrics?.generation_tok_per_sec,
    runtime_sec: run.total_runtime_sec,
    load_rss_mib: base.load_rss_mib,
    ...mem,
  });
}

for (const tag of fs.readdirSync(sweepDir)) {
  const runJson = path.join(sweepDir, "run-json", `gemma-4-12B-it-qat-UD-Q4_K_XL.${tag}.run.json`);
  if (!fs.existsSync(runJson)) continue;
  const run = JSON.parse(fs.readFileSync(runJson, "utf8"));
  const cfgPath = path.join(sweepDir, tag, "run-config.json");
  const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, "utf8")) : {};
  const serverLog = path.join(sweepDir, tag, "gemma-4-12B-it-qat-UD-Q4_K_XL.server.log");
  const mem = parseServerLog(serverLog);
  const reasoningOn = cfg.reasoning === "on";
  rows.push({
    label: tag,
    mtp: "Unsloth",
    n_max: cfg.spec_draft_n_max,
    reasoning: cfg.reasoning ?? "off",
    ctx_req: cfg.ctx_size ?? 0,
    ngl: cfg.ngl ?? 999,
    fa: cfg.flash_attn ?? "on",
    quality: run.quality_score,
    overall: run.overall_score,
    speed: run.speed_score,
    reliability: run.reliability_score,
    gen_tps: run.speed_metrics?.generation_tok_per_sec,
    runtime_sec: run.total_runtime_sec,
    load_rss_mib: reasoningOn
      ? loadRssMib["mtp-ctx262144-reasoning-on"]
      : loadRssMib["mtp-ctx262144"],
    ...mem,
  });
}

rows.sort((a, b) => {
  const mtpOrder = (r) => (r.mtp === "none" ? 0 : r.mtp === "Janvitos" ? 1 : 2);
  const d = mtpOrder(a) - mtpOrder(b);
  if (d) return d;
  if (a.n_max !== b.n_max) {
    if (a.n_max === "—") return -1;
    if (b.n_max === "—") return 1;
    return a.n_max - b.n_max;
  }
  return a.reasoning.localeCompare(b.reasoning);
});

const fmt = (v, d = 1) => (v == null ? "—" : Number(v).toFixed(d));
const fmt0 = (v) => (v == null ? "—" : String(Math.round(v)));

const lines = [
  "# Gemma 4 12B QAT — MTP sweep + baselines (Metal, M1 Pro 32GB)",
  "",
  "**Hardware:** Apple M1 Pro, 32 GB unified memory (25.6 GB Metal-reported pool).",
  "**Target:** `unsloth/gemma-4-12b-it-qat-GGUF` · `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf`",
  "**MTP draft (Unsloth):** `MTP/gemma-4-12B-it-Q8_0-MTP.gguf`",
  "**llama.cpp:** `76da245` (Gemma4 MTP, PR #23398)",
  "",
  "### Server flags",
  "",
  "| group | `-c` | fit | `-ngl` | `-fa` | MTP | reasoning |",
  "|---|---:|---|---|---|---|---|",
  "| baseline (no MTP) | 4096 | off | all | auto | — | off |",
  "| Janvitos MTP | 4096 | off | all | auto | draft-mtp n-max=4 | off |",
  "| Unsloth sweep | 0 → 262144 | on, target 16384¹ | 999 / 999d | on | draft-mtp n-max 1–4 | on/off |",
  "",
  "¹ `--fit on --fit-target 16384` did **not** shrink context because `-ngl 999` was preset (`common_fit_params: abort`). All Unsloth runs still loaded **n_ctx = 262144**.",
  "",
  "### Memory notes",
  "",
  "- **Load RSS** — process resident set right after model load (post-warmup, idle). On Apple Silicon this is the best practical proxy for peak unified-memory footprint at startup.",
  "- **Peak prompt cache** — max `cache state` MiB seen during BenchLoop (limit 8192 MiB). Fills toward the ceiling on long multi-suite runs.",
  "- **Peak prompt state** — largest single saved prompt KV state (`total state size`).",
  "- **Peak checkpoint** — largest context checkpoint blob during the run.",
  "- Metal `MTL0 … MiB free` lines in logs do **not** track usage during inference on unified memory; ignore `mtl_peak_used_mib` from those.",
  "",
  "## Full comparison",
  "",
  "| config | MTP | n-max | reasoning | n_ctx | load RSS | peak cache | peak prompt | peak ckpt | draft % | quality | overall | gen tok/s | runtime |",
  "|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
];

for (const r of rows) {
  lines.push(
    `| ${r.label} | ${r.mtp} | ${r.n_max} | ${r.reasoning} | ${r.n_ctx ?? r.ctx_req} | ${fmt0(r.load_rss_mib)} MiB | ${fmt(r.max_prompt_cache_mib, 0)} MiB | ${fmt(r.max_prompt_state_mib, 0)} MiB | ${fmt(r.max_checkpoint_mib, 0)} MiB | ${r.draft_accept_pct == null ? "—" : fmt(r.draft_accept_pct, 1)} | ${fmt(r.quality)} | ${fmt(r.overall)} | ${fmt(r.gen_tps, 2)} | ${fmt0(r.runtime_sec)}s |`,
  );
}

lines.push(
  "",
  "## Takeaways",
  "",
  "- **Best overall (reasoning off):** `nmax2-reasoning-off` — overall **78.9**, **21.65 gen tok/s**, ~**16 min** runtime.",
  "- **No-MTP baseline** (ctx 4096): overall **77.8**, **15.70 gen tok/s**; load RSS **~7.0 GB** vs **~11.6 GB** for max-ctx Unsloth MTP.",
  "- **Janvitos MTP** (ctx 4096): modest speedup (+13% tok/s) with lower draft acceptance (~75%) vs Unsloth (~84% at n-max=2).",
  "- **Reasoning on** cuts quality to **66.7** and multiplies runtime 3–5×; peak checkpoints jump to **~708 MiB** (vs ~326 MiB off).",
  "- Prompt cache hits **~8.2 GB** on every long run regardless of MTP — the dominant runtime memory growth beyond model+KV load.",
  "",
);

const outJson = path.join(sweepDir, "detailed-summary.json");
const outMd = path.join(sweepDir, "summary.md");
fs.writeFileSync(outJson, `${JSON.stringify(rows, null, 2)}\n`);
fs.writeFileSync(outMd, `${lines.join("\n")}\n`);
console.log(`Wrote ${outMd} and ${outJson} (${rows.length} rows)`);
