#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const bench = path.join(root, "results/benchloop");

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
  const kv = text.match(/cache_k=([^,]+), cache_v=([^,]+)/)?.slice(1);
  return {
    n_ctx: nCtx ? Number(nCtx) : null,
    kv_k: kv?.[0] ?? "f16",
    kv_v: kv?.[1] ?? "f16",
    max_prompt_cache_mib: cache.length ? Math.max(...cache) : null,
    max_prompt_state_mib: states.length ? Math.max(...states) : null,
    max_checkpoint_mib: checkpoints.length ? Math.max(...checkpoints) : null,
    draft_accept_pct: draft.length
      ? (draft.reduce((a, b) => a + b, 0) / draft.length) * 100
      : null,
  };
}

function suiteScores(run) {
  const out = {};
  for (const [name, s] of Object.entries(run.suites ?? {})) {
    out[name] = {
      score: s.score ?? s.quality_score,
      passed: s.pass_count ?? s.passed_tasks ?? s.passed,
      total: s.task_count ?? s.total_tasks ?? s.total,
    };
  }
  return out;
}

const loadRss = {
  "baseline-no-mtp": 7014,
  "janvitos-mtp-ctx4096": 7651,
  "no-mtp-kvq8-maxctx": 9010,
  "mtp-nmax2-kvq8": 9560,
  "mtp-ctx262144": 11574,
  "mtp-ctx262144-reasoning-on": 11693,
};

const runs = [
  {
    id: "baseline-no-mtp",
    label: "No MTP (f16 KV)",
    mtp: "none",
    draft: "—",
    n_max: "—",
    reasoning: "off",
    ctx_req: 4096,
    kv: "f16/f16",
    ngl: "all",
    fa: "auto",
    fit: "off",
    runJson: path.join(bench, "qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL.run.json"),
    serverLog: path.join(bench, "qat-latest-llamacpp-all-suites-temp1-top_p095-top_k64/gemma-4-12B-it-qat-UD-Q4_K_XL.server.log"),
    load_rss: loadRss["baseline-no-mtp"],
  },
  {
    id: "no-mtp-kvq8-maxctx",
    label: "No MTP (KV Q8)",
    mtp: "none",
    draft: "—",
    n_max: "—",
    reasoning: "off",
    ctx_req: 0,
    kv: "q8_0/q8_0",
    ngl: 999,
    fa: "on",
    fit: "16384",
    runJson: path.join(bench, "gemma4-12b-qat-no-mtp-kvq8-maxctx/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL.run.json"),
    serverLog: path.join(bench, "gemma4-12b-qat-no-mtp-kvq8-maxctx/gemma-4-12B-it-qat-UD-Q4_K_XL.server.log"),
    load_rss: loadRss["no-mtp-kvq8-maxctx"],
  },
  {
    id: "janvitos-mtp-ctx4096",
    label: "Janvitos MTP",
    mtp: "Janvitos",
    draft: "Janvitos Q8 MTP",
    n_max: 4,
    reasoning: "off",
    ctx_req: 4096,
    kv: "f16/f16",
    ngl: "all",
    fa: "auto",
    fit: "off",
    runJson: path.join(bench, "gemma4-12b-qat-mtp-metal-temp1-top_p095-top_k64/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL.run.json"),
    serverLog: path.join(bench, "gemma4-12b-qat-mtp-metal-temp1-top_p095-top_k64/gemma-4-12B-it-qat-UD-Q4_K_XL.server.log"),
    load_rss: loadRss["janvitos-mtp-ctx4096"],
  },
  {
    id: "mtp-nmax2-kvq8",
    label: "Unsloth MTP nmax2 (KV Q8)",
    mtp: "Unsloth",
    draft: "MTP/gemma-4-12B-it-Q8_0-MTP.gguf",
    n_max: 2,
    reasoning: "off",
    ctx_req: 0,
    kv: "q8_0/q8_0",
    ngl: 999,
    fa: "on",
    fit: "16384",
    runJson: path.join(bench, "gemma4-12b-qat-unsloth-mtp-nmax2-kvq8-maxctx/run-json/gemma-4-12B-it-qat-UD-Q4_K_XL.nmax2-reasoning-off-kvq8.run.json"),
    serverLog: path.join(bench, "gemma4-12b-qat-unsloth-mtp-nmax2-kvq8-maxctx/gemma-4-12B-it-qat-UD-Q4_K_XL.server.log"),
    load_rss: loadRss["mtp-nmax2-kvq8"],
  },
];

const sweepDir = path.join(bench, "gemma4-12b-qat-unsloth-mtp-sweep-16gb-maxctx");
for (const tag of fs.readdirSync(sweepDir)) {
  const runJson = path.join(sweepDir, "run-json", `gemma-4-12B-it-qat-UD-Q4_K_XL.${tag}.run.json`);
  if (!fs.existsSync(runJson)) continue;
  const cfgPath = path.join(sweepDir, tag, "run-config.json");
  const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, "utf8")) : {};
  const reasoningOn = (cfg.reasoning ?? "off") === "on";
  runs.push({
    id: tag,
    label: `Unsloth MTP ${tag}`,
    mtp: "Unsloth",
    draft: "MTP/gemma-4-12B-it-Q8_0-MTP.gguf",
    n_max: cfg.spec_draft_n_max,
    reasoning: cfg.reasoning ?? "off",
    ctx_req: cfg.ctx_size ?? 0,
    kv: "f16/f16",
    ngl: cfg.ngl ?? 999,
    fa: cfg.flash_attn ?? "on",
    fit: String(cfg.fit_target_mib ?? 16384),
    runJson,
    serverLog: path.join(sweepDir, tag, "gemma-4-12B-it-qat-UD-Q4_K_XL.server.log"),
    load_rss: reasoningOn ? loadRss["mtp-ctx262144-reasoning-on"] : loadRss["mtp-ctx262144"],
  });
}

const rows = runs.map((cfg) => {
  const benchRun = JSON.parse(fs.readFileSync(cfg.runJson, "utf8"));
  const mem = parseServerLog(cfg.serverLog);
  const { runJson, serverLog, load_rss, ...meta } = cfg;
  return {
    ...meta,
    ...mem,
    n_ctx: mem.n_ctx ?? cfg.ctx_req,
    quality: benchRun.quality_score,
    overall: benchRun.overall_score,
    speed: benchRun.speed_score,
    reliability: benchRun.reliability_score,
    value: benchRun.value_score,
    gen_tps: benchRun.speed_metrics?.generation_tok_per_sec,
    runtime_sec: benchRun.total_runtime_sec,
    suite_scores: suiteScores(benchRun),
    load_rss_mib: load_rss,
  };
});

rows.sort((a, b) => {
  const order = (r) => {
    if (r.mtp === "none") return 0;
    if (r.mtp === "Janvitos") return 1;
    if (r.kv.includes("q8")) return 3;
    return 2;
  };
  const d = order(a) - order(b);
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
const suiteNames = ["agent", "coding", "dataextract", "instructfollow", "reasonmath", "speed", "toolcall"];

const lines = [
  "# Gemma 4 12B QAT — Full BenchLoop Summary (Metal, M1 Pro 32GB)",
  "",
  "**Model:** `unsloth/gemma-4-12b-it-qat-GGUF` · `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf`",
  "**BenchLoop:** v0.2.3 · suites: agent, coding, dataextract, instructfollow, reasonmath, speed, toolcall",
  "**Sampler:** `--temp 1 --top-p 0.95 --top-k 64 -n 256`",
  "**llama.cpp:** `76da245` (Gemma4 MTP support)",
  "",
  "---",
  "",
  "## Master comparison",
  "",
  "| config | MTP | n-max | reasoning | KV | n_ctx | load RSS | peak cache | peak prompt | draft % | quality | overall | speed | reliability | gen tok/s | runtime |",
  "|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
];

for (const r of rows) {
  lines.push(
    `| ${r.label} | ${r.mtp} | ${r.n_max} | ${r.reasoning} | ${r.kv} | ${r.n_ctx} | ${fmt0(r.load_rss_mib)} | ${fmt(r.max_prompt_cache_mib, 0)} | ${fmt(r.max_prompt_state_mib, 0)} | ${r.draft_accept_pct == null ? "—" : fmt(r.draft_accept_pct, 1)} | ${fmt(r.quality)} | ${fmt(r.overall)} | ${fmt(r.speed)} | ${fmt(r.reliability)} | ${fmt(r.gen_tps, 2)} | ${fmt0(r.runtime_sec)}s |`,
  );
}

lines.push(
  "",
  "## 2×2 — KV cache × MTP (reasoning off)",
  "",
  "| | **no MTP** | **MTP n-max=2** |",
  "|---|---|---|",
);

const cell = (id) => {
  const r = rows.find((x) => x.id === id);
  if (!r) return "—";
  return `overall **${fmt(r.overall)}**, ${fmt(r.gen_tps, 2)} tok/s, ${fmt0(r.runtime_sec)}s, Q ${fmt(r.quality)}`;
};

lines.push(`| **KV f16** | ${cell("baseline-no-mtp")}¹ | ${cell("nmax2-reasoning-off")} |`);
lines.push(`| **KV q8_0** | ${cell("no-mtp-kvq8-maxctx")} | ${cell("mtp-nmax2-kvq8")} |`);
lines.push("", "¹ no-MTP f16 run used `-c 4096` (not 262144).", "");

lines.push("## Suite scores", "");
lines.push(
  "| config | " + suiteNames.map((s) => s.replace("dataextract", "data").replace("instructfollow", "instruct").replace("reasonmath", "math").replace("toolcall", "tool")).join(" | ") + " |",
);
lines.push("|---|" + suiteNames.map(() => "---:").join("|") + "|");

for (const r of rows) {
  const cells = suiteNames.map((s) => {
    const su = r.suite_scores[s];
    if (!su) return "—";
    return `${fmt(su.score)} (${su.passed}/${su.total})`;
  });
  lines.push(`| ${r.label} | ${cells.join(" | ")} |`);
}

lines.push(
  "",
  "## Server config reference",
  "",
  "| config | `-c` | fit | `-ngl` | `-fa` | draft model |",
  "|---|---:|---|---|---|---|",
);
for (const r of rows) {
  lines.push(
    `| ${r.label} | ${r.ctx_req} | ${r.fit} | ${r.ngl} | ${r.fa} | ${r.draft} |`,
  );
}

lines.push(
  "",
  "## Memory notes",
  "",
  "- **load RSS** — process memory after model load (idle). Apple unified memory; best BRAM proxy.",
  "- **peak cache** — max prompt-cache usage during BenchLoop (8192 MiB limit).",
  "- **peak prompt** — largest single saved prompt KV state.",
  "- `--fit-target 16384` did not reduce context when `-ngl 999` was preset; Unsloth runs loaded n_ctx=262144.",
  "",
  "## Recommendations",
  "",
  "| goal | config |",
  "|---|---|",
  "| **Best overall + speed** | Unsloth MTP, n-max=2, reasoning off, f16 KV (`nmax2-reasoning-off`) |",
  "| **Lowest memory at max ctx** | No MTP or MTP + KV q8_0 (~9.0–9.6 GB load RSS vs ~11.6 GB MTP+f16) |",
  "| **Avoid** | `--reasoning on` for benchmarks (quality −20 pts, 3–5× runtime) |",
  "| **KV Q8 tradeoff** | −10% tok/s (no MTP) to −27% (MTP) vs f16; saves ~2 GB RAM |",
  "",
);

const outMd = path.join(bench, "gemma4-12b-qat-full-summary.md");
const outJson = path.join(bench, "gemma4-12b-qat-full-summary.json");
const jsonRows = rows.map(({ runJson, serverLog, load_rss, suites, ...rest }) => rest);
fs.writeFileSync(outMd, `${lines.join("\n")}\n`);
fs.writeFileSync(outJson, `${JSON.stringify(jsonRows, null, 2)}\n`);
console.log(`Wrote ${outMd} (${rows.length} runs)`);
