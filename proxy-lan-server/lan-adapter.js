import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type, anthropic-version, x-api-key",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};
const MAX_STORED_RESPONSES = 100;

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function normalizeModelId(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function isUsableModelId(value) {
  const modelId = normalizeModelId(value);
  if (!modelId) return false;
  if (modelId.includes(",") || modelId.includes("\n") || modelId.includes("\r")) return false;
  if (modelId === "[object Object]") return false;
  if (/^System\.(Collections\.|Object(?:\[\])?$)/.test(modelId)) return false;
  return true;
}

function uniqueModelIds(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const modelId = normalizeModelId(value);
    if (!isUsableModelId(modelId) || seen.has(modelId)) continue;
    seen.add(modelId);
    result.push(modelId);
  }
  return result;
}

function parseModelAliases(value) {
  return uniqueModelIds(String(value || "").split(","));
}

function parseJsonEnv(value, fallback = {}) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function asNumber(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value != null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function filenameFromPath(value) {
  const text = String(value || "");
  if (!text) return "";
  return text.split(/[\\/]/).pop() || text;
}

function inferQuantization(...values) {
  const text = values.map((value) => filenameFromPath(value)).join(" ");
  const matches = [
    /\bUD[-_]?Q\d+[-_][A-Z]+(?:[-_][A-Z]+)?\b/i,
    /\bIQ\d+[-_][A-Z]+(?:[-_][A-Z]+)?\b/i,
    /\bQ\d+[-_][A-Z]+(?:[-_][A-Z]+)?\b/i,
    /\bQ\d+_\d\b/i,
    /\bF(?:16|32)\b/i,
  ];
  for (const pattern of matches) {
    const match = text.match(pattern);
    if (match) return match[0].replace(/-/g, "_");
  }
  return "";
}

function inferFamily(...values) {
  const text = values.join(" ").toLowerCase();
  if (text.includes("gemma-4") || text.includes("gemma4")) return "gemma-4";
  if (text.includes("qwopus3.6") || text.includes("qwen3.6")) return "qwen3.6";
  if (text.includes("qwopus3.5") || text.includes("qwen3.5")) return "qwen3.5";
  if (text.includes("qwen")) return "qwen";
  if (text.includes("whisper")) return "whisper-v3";
  if (text.includes("holo")) return "holo";
  if (text.includes("gpt-oss")) return "gpt-oss";
  return "";
}

function inferParameterSize(...values) {
  const text = values.join(" ");
  const match = text.match(/\b(?:E|A)?(\d+(?:\.\d+)?)B\b/i);
  return match ? `${match[1]}B` : "";
}

function compactObject(value) {
  if (Array.isArray(value)) {
    return value.map(compactObject).filter((item) => item != null && item !== "");
  }
  if (!value || typeof value !== "object") return value;
  const result = {};
  for (const [key, item] of Object.entries(value)) {
    const compacted = compactObject(item);
    if (compacted == null || compacted === "") continue;
    if (Array.isArray(compacted) && compacted.length === 0) continue;
    if (typeof compacted === "object" && !Array.isArray(compacted) && Object.keys(compacted).length === 0) continue;
    result[key] = compacted;
  }
  return result;
}

const host = process.env.ADAPTER_HOST || "0.0.0.0";
const port = Number(process.env.ADAPTER_PORT || 8080);
const listenPorts = Array.from(new Set(
  (process.env.ADAPTER_PORTS || String(port))
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0)
));
const upstream = process.env.LLAMA_UPSTREAM || "http://127.0.0.1:18081";
const audioUpstream = process.env.AUDIO_UPSTREAM || upstream;
const upstreamKind = process.env.UPSTREAM_KIND || "llama.cpp";
const defaultModel = isUsableModelId(process.env.MODEL_ALIAS) ? process.env.MODEL_ALIAS.trim() : "local-model";
const extraPublicModels = parseModelAliases(process.env.PUBLIC_MODEL_ALIASES || "");
const publicModels = uniqueModelIds([defaultModel, ...extraPublicModels]);
const audioModel = isUsableModelId(process.env.AUDIO_MODEL_ALIAS) ? process.env.AUDIO_MODEL_ALIAS.trim() : "whisper-v3:turbo";
const audioPublicModels = uniqueModelIds([
  audioModel,
  ...parseModelAliases(process.env.AUDIO_MODEL_ALIASES || "whisper-v3:turbo,whisper-v3,whisper-1"),
]);
const defaultTemperature = Number(process.env.DEFAULT_TEMPERATURE || 0.75);
const defaultTopP = Number(process.env.DEFAULT_TOP_P || 0.95);
const defaultTopK = Number(process.env.DEFAULT_TOP_K || 20);
const defaultMinP = Number(process.env.DEFAULT_MIN_P || 0.0);
const defaultPresencePenalty = Number(process.env.DEFAULT_PRESENCE_PENALTY || 0.0);
const defaultRepeatPenalty = Number(process.env.DEFAULT_REPEAT_PENALTY || 1.0);
const defaultMaxTokens = Number(process.env.DEFAULT_MAX_TOKENS || 16384);
const defaultThink = process.env.DEFAULT_THINK;
const harnessPolicyPath = process.env.HARNESS_POLICY || "";
const harnessModulePath = process.env.HARNESS_MODULE || path.join(__dirname, "proxy.mjs");
const harnessLogJsonl = process.env.HARNESS_LOG_JSONL || "";
const harnessModelAliases = parseModelAliases(process.env.HARNESS_MODEL_ALIASES || "");
const hasHarnessModelGate = harnessModelAliases.length > 0;
const runtimeModelMetadata = parseJsonEnv(process.env.MODEL_METADATA_JSON || "", {});

function modelUsesHarness(modelId) {
  if (!harnessPolicyPath) return false;
  if (!hasHarnessModelGate) return true;
  return harnessModelAliases.includes(normalizeModelId(modelId || defaultModel));
}

function buildMainModelMetadata() {
  const file = firstNonEmpty(runtimeModelMetadata.file, filenameFromPath(runtimeModelMetadata.path));
  const source = firstNonEmpty(runtimeModelMetadata.source);
  const family = inferFamily(runtimeModelMetadata.family, source, runtimeModelMetadata.name, file, defaultModel);
  const quantization = inferQuantization(runtimeModelMetadata.quantization, file, runtimeModelMetadata.path, runtimeModelMetadata.name);
  const draftQuantization = inferQuantization(runtimeModelMetadata.mtp?.draft_model);
  const mmprojQuantization = inferQuantization(runtimeModelMetadata.mmproj);
  const harness = compactObject({
    ...(runtimeModelMetadata.harness || {}),
    mode: hasHarnessModelGate ? "selected_models" : "all_models",
    model_aliases: harnessModelAliases,
  });
  const sampler = compactObject({
    temperature: asNumber(runtimeModelMetadata.sampler?.temperature ?? defaultTemperature),
    top_p: asNumber(runtimeModelMetadata.sampler?.top_p ?? defaultTopP),
    top_k: asNumber(runtimeModelMetadata.sampler?.top_k ?? defaultTopK),
    min_p: asNumber(runtimeModelMetadata.sampler?.min_p ?? defaultMinP),
    presence_penalty: asNumber(runtimeModelMetadata.sampler?.presence_penalty ?? defaultPresencePenalty),
    repeat_penalty: asNumber(runtimeModelMetadata.sampler?.repeat_penalty ?? defaultRepeatPenalty),
    seed: asNumber(runtimeModelMetadata.sampler?.seed),
  });
  const cache = compactObject({
    type_k: runtimeModelMetadata.cache?.type_k,
    type_v: runtimeModelMetadata.cache?.type_v,
    flash_attention: runtimeModelMetadata.cache?.flash_attention,
  });
  const mtp = compactObject({
    enabled: runtimeModelMetadata.mtp?.enabled,
    disabled_by_flag: runtimeModelMetadata.mtp?.disabled_by_flag,
    spec_type: runtimeModelMetadata.mtp?.spec_type,
    draft_model: runtimeModelMetadata.mtp?.draft_model,
    draft_quantization: draftQuantization,
    draft_n_min: asNumber(runtimeModelMetadata.mtp?.draft_n_min),
    draft_n_max: asNumber(runtimeModelMetadata.mtp?.draft_n_max),
  });
  const asr = compactObject(runtimeModelMetadata.asr || {});

  return compactObject({
    id: defaultModel,
    object: "model",
    aliases: publicModels,
    name: runtimeModelMetadata.name,
    key: runtimeModelMetadata.key,
    source,
    family,
    file,
    path: runtimeModelMetadata.path,
    model_file: file,
    quantization,
    model_quantization: quantization,
    context_length: asNumber(runtimeModelMetadata.context_size),
    max_tokens: asNumber(runtimeModelMetadata.max_tokens ?? defaultMaxTokens),
    sampler,
    reasoning: runtimeModelMetadata.reasoning,
    cache,
    kv_cache_quantization: compactObject({ k: cache.type_k, v: cache.type_v }),
    mtp,
    speculative_decoding: mtp,
    vision: runtimeModelMetadata.vision,
    multimodal: runtimeModelMetadata.multimodal,
    mmproj: runtimeModelMetadata.mmproj,
    mmproj_quantization: mmprojQuantization,
    image_min_tokens: asNumber(runtimeModelMetadata.image_min_tokens),
    backend: runtimeModelMetadata.backend || upstreamKind,
    upstream: runtimeModelMetadata.upstream || upstream,
    server: runtimeModelMetadata.server,
    adapter: compactObject({
      host: runtimeModelMetadata.adapter_host || host,
      ports: runtimeModelMetadata.adapter_ports || listenPorts,
    }),
    harness,
    gpu_layers: asNumber(runtimeModelMetadata.gpu_layers),
    parallel: asNumber(runtimeModelMetadata.parallel),
    asr,
    readme_file_label: runtimeModelMetadata.readme_file_label,
  });
}

function buildAudioModelMetadata() {
  return compactObject({
    id: audioModel,
    object: "model",
    aliases: audioPublicModels,
    source: "FastFlowLM",
    family: "whisper-v3",
    backend: "FastFlowLM",
    type: "audio.transcription",
    capabilities: ["audio.transcription"],
    upstream: audioUpstream,
  });
}

const mainModelMetadata = buildMainModelMetadata();
const audioModelMetadata = buildAudioModelMetadata();

let harnessModulePromise = null;
let harnessPolicyPromise = null;

async function getHarnessModule() {
  if (!harnessPolicyPath) return null;
  if (!harnessModulePromise) {
    harnessModulePromise = import(pathToFileURL(harnessModulePath).href);
  }
  return harnessModulePromise;
}

async function getHarnessPolicy() {
  if (!harnessPolicyPromise) {
    harnessPolicyPromise = getHarnessModule().then((mod) => mod?.loadPolicy(harnessPolicyPath) ?? null);
  }
  return harnessPolicyPromise;
}

async function getHarnessPolicyForModel(modelId) {
  if (!modelUsesHarness(modelId)) return null;
  return getHarnessPolicy();
}

const responses = new Map();

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    ...CORS_HEADERS,
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new HttpError(400, `Invalid JSON: ${err.message}`));
      }
    });
    req.on("error", reject);
  });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function sanitizeUpstreamBody(body) {
  if (!body || typeof body !== "object") return body;
  const next = normalizeUpstreamModel(body);
  if (upstreamKind.toLowerCase() !== "fastflowlm") return next;

  const sanitized = { ...next };
  delete sanitized.top_k;
  delete sanitized.min_p;
  delete sanitized.repeat_penalty;
  delete sanitized.repetition_penalty;
  if (defaultThink != null && sanitized.think == null) {
    sanitized.think = !["0", "false", "off", "no"].includes(defaultThink.toLowerCase());
  }
  return sanitized;
}

async function upstreamJson(path, body) {
  const upstreamBody = sanitizeUpstreamBody(body);
  const response = await fetch(`${upstream}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(upstreamBody),
  });
  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { error: text };
  }
  if (!response.ok) {
    const message = parsed?.error?.message || parsed?.error || `Upstream HTTP ${response.status}`;
    throw new HttpError(response.status, typeof message === "string" ? message : JSON.stringify(message));
  }
  return parsed;
}

async function upstreamStream(path, body, res) {
  const upstreamBody = sanitizeUpstreamBody(body);
  const response = await fetch(`${upstream}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(upstreamBody),
  });

  if (!response.ok) {
    const text = await response.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { error: text };
    }
    const message = parsed?.error?.message || parsed?.error || `Upstream HTTP ${response.status}`;
    throw new HttpError(response.status, typeof message === "string" ? message : JSON.stringify(message));
  }

  res.writeHead(response.status, {
    "content-type": response.headers.get("content-type") || "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    "connection": "keep-alive",
    "x-accel-buffering": "no",
    ...CORS_HEADERS,
  });

  const reader = response.body.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

async function proxyRaw(req, res, targetPath, targetUpstream = upstream) {
  let raw = await readRawBody(req);
  const headers = {};
  for (const name of ["content-type", "authorization", "x-api-key"]) {
    if (req.headers[name]) headers[name] = req.headers[name];
  }
  if (targetPath === "/v1/audio/transcriptions") {
    raw = normalizeAudioMultipartModel(raw);
  }

  const response = await fetch(`${targetUpstream}${targetPath}`, {
    method: req.method,
    headers,
    body: raw,
  });
  const responseBody = Buffer.from(await response.arrayBuffer());
  res.writeHead(response.status, {
    "content-type": response.headers.get("content-type") || "application/json; charset=utf-8",
    "content-length": responseBody.length,
    ...CORS_HEADERS,
  });
  res.end(responseBody);
}

function replaceBufferOnce(buffer, search, replacement) {
  const searchBuffer = Buffer.from(search, "utf8");
  const replacementBuffer = Buffer.from(replacement, "utf8");
  const index = buffer.indexOf(searchBuffer);
  if (index < 0) return buffer;
  return Buffer.concat([
    buffer.subarray(0, index),
    replacementBuffer,
    buffer.subarray(index + searchBuffer.length),
  ]);
}

function normalizeAudioMultipartModel(buffer) {
  let next = buffer;
  for (const modelId of audioPublicModels) {
    if (modelId === audioModel) continue;
    next = replaceBufferOnce(next, `name="model"\r\n\r\n${modelId}\r\n`, `name="model"\r\n\r\n${audioModel}\r\n`);
    next = replaceBufferOnce(next, `name="model"\n\n${modelId}\n`, `name="model"\n\n${audioModel}\n`);
  }
  return next;
}

async function proxy(req, res, targetPath) {
  const body = withSamplingDefaults(await readBody(req));
  const policy = targetPath.includes("chat") ? await getHarnessPolicyForModel(body.model) : null;
  if (body.stream === true) {
    return upstreamStream(targetPath, body, res);
  }
  if (policy && targetPath.includes("chat")) {
    const mod = await getHarnessModule();
    const result = await mod.runChatCompletionHarness({
      upstreamJson,
      requestPayload: body,
      policy,
      logJsonl: harnessLogJsonl,
      path: targetPath,
    });
    return json(res, 200, withResponseModel(result, body.model));
  }
  const result = await upstreamJson(targetPath, body);
  json(res, 200, withResponseModel(result, body.model));
}

function normalizeInput(input) {
  if (typeof input === "string") return [{ role: "user", content: input }];
  if (!Array.isArray(input)) return [{ role: "user", content: String(input ?? "") }];

  const looksLikeMessages = input.every((item) => item && typeof item === "object" && item.role);
  if (looksLikeMessages) return input;

  const content = [];
  for (const item of input) {
    if (typeof item === "string") {
      content.push({ type: "text", text: item });
    } else if (item?.type === "input_text") {
      content.push({ type: "text", text: item.text || "" });
    } else if (item?.type === "input_image") {
      content.push({ type: "image_url", image_url: { url: item.image_url || item.file_id || "" } });
    } else if (item?.type === "message") {
      return input.map((message) => ({
        role: message.role || "user",
        content: normalizeResponseContent(message.content),
      }));
    }
  }
  return [{ role: "user", content: content.length ? content : "" }];
}

function normalizeUpstreamModel(body) {
  if (!body || typeof body !== "object" || !body.model) return body;
  if (publicModels.includes(body.model)) return { ...body, model: defaultModel };
  return body;
}

function withResponseModel(result, requestedModel) {
  if (!requestedModel || requestedModel === defaultModel || !publicModels.includes(requestedModel)) return result;
  return { ...result, model: requestedModel };
}

function filterInvalidModelEntries(modelsResponse) {
  if (!modelsResponse || typeof modelsResponse !== "object") return modelsResponse;
  const response = { ...modelsResponse };
  if (Array.isArray(response.data)) {
    response.data = response.data
      .filter((item) => isUsableModelId(item?.id))
      .map((item) => ({
        ...item,
        aliases: Array.isArray(item.aliases) ? uniqueModelIds(item.aliases) : item.aliases,
      }));
  }
  if (Array.isArray(response.models)) {
    response.models = response.models.filter((item) => {
      const ids = [item?.name, item?.model].filter((value) => value != null && value !== "");
      return ids.length > 0 && ids.every(isUsableModelId);
    });
  }
  return response;
}

function addPublicModelAliases(modelsResponse) {
  const response = { ...modelsResponse };
  if (Array.isArray(response.data)) {
    const existingIds = new Set(response.data.map((item) => item.id));
    const base = response.data.find((item) => item.id === defaultModel) || response.data[0];
    for (const modelId of publicModels) {
      if (!existingIds.has(modelId) && base) {
        response.data.push({ ...base, id: modelId, aliases: [modelId] });
      }
    }
  }
  if (Array.isArray(response.models)) {
    const existingNames = new Set(response.models.flatMap((item) => [item.name, item.model].filter(Boolean)));
    const base = response.models.find((item) => item.model === defaultModel || item.name === defaultModel) || response.models[0];
    for (const modelId of publicModels) {
      if (!existingNames.has(modelId) && base) {
        response.models.push({ ...base, name: modelId, model: modelId });
      }
    }
  }
  return response;
}

function metadataForModelId(modelId) {
  if (audioPublicModels.includes(modelId)) return audioModelMetadata;
  const metadata = { ...mainModelMetadata };
  if (!modelUsesHarness(modelId)) delete metadata.harness;
  return metadata;
}

function modelOwnerFromSource(source, fallback = "local") {
  if (!source || typeof source !== "string") return fallback;
  const owner = source.split("/")[0]?.trim();
  return owner || fallback;
}

function detailsFromMetadata(existingDetails, metadata) {
  const details = existingDetails && typeof existingDetails === "object" ? existingDetails : {};
  const parameterSize = inferParameterSize(metadata.name, metadata.file, metadata.source, metadata.id);
  return compactObject({
    ...details,
    family: details.family || metadata.family,
    families: Array.from(new Set([...(Array.isArray(details.families) ? details.families : []), metadata.family].filter(Boolean))),
    format: details.format || "gguf",
    parameter_size: details.parameter_size || parameterSize,
    quantization_level: details.quantization_level || metadata.quantization,
    source: details.source || metadata.source,
    file: details.file || metadata.file,
    model_file: details.model_file || metadata.model_file,
    model_path: details.model_path || metadata.path,
    context_length: details.context_length || metadata.context_length,
    max_tokens: details.max_tokens || metadata.max_tokens,
    sampler: details.sampler || metadata.sampler,
    reasoning: details.reasoning || metadata.reasoning,
    cache: details.cache || metadata.cache,
    kv_cache_quantization: details.kv_cache_quantization || metadata.kv_cache_quantization,
    mtp: details.mtp || metadata.mtp,
    speculative_decoding: details.speculative_decoding || metadata.speculative_decoding,
    vision: details.vision ?? metadata.vision,
    multimodal: details.multimodal ?? metadata.multimodal,
    mmproj: details.mmproj || metadata.mmproj,
    mmproj_quantization: details.mmproj_quantization || metadata.mmproj_quantization,
    image_min_tokens: details.image_min_tokens || metadata.image_min_tokens,
    backend: details.backend || metadata.backend,
    upstream: details.upstream || metadata.upstream,
    server: details.server || metadata.server,
    adapter: details.adapter || metadata.adapter,
    harness: details.harness || metadata.harness,
    gpu_layers: details.gpu_layers || metadata.gpu_layers,
    parallel: details.parallel || metadata.parallel,
    asr: details.asr || metadata.asr,
    readme_file_label: details.readme_file_label || metadata.readme_file_label,
  });
}

function enrichOpenAIModelEntry(item) {
  const modelId = item.id || defaultModel;
  const metadata = { ...metadataForModelId(modelId), id: modelId };
  const aliases = uniqueModelIds([...(Array.isArray(item.aliases) ? item.aliases : []), modelId, ...(metadata.aliases || [])]);
  return compactObject({
    ...item,
    id: modelId,
    object: item.object || "model",
    owned_by: item.owned_by || modelOwnerFromSource(metadata.source),
    aliases,
    source: item.source || metadata.source,
    family: item.family || metadata.family,
    quantization: item.quantization || metadata.quantization,
    model_quantization: item.model_quantization || metadata.model_quantization,
    context_length: item.context_length || metadata.context_length,
    max_tokens: item.max_tokens || metadata.max_tokens,
    sampler: item.sampler || metadata.sampler,
    reasoning: item.reasoning || metadata.reasoning,
    cache: item.cache || metadata.cache,
    kv_cache_quantization: item.kv_cache_quantization || metadata.kv_cache_quantization,
    mtp: item.mtp || metadata.mtp,
    speculative_decoding: item.speculative_decoding || metadata.speculative_decoding,
    harness: item.harness || metadata.harness,
    details: detailsFromMetadata(item.details, metadata),
    metadata: compactObject({ ...(item.metadata || {}), ...metadata, aliases }),
  });
}

function enrichFastFlowModelEntry(item) {
  const modelId = item.model || item.name || defaultModel;
  const metadata = { ...metadataForModelId(modelId), id: modelId };
  const aliases = uniqueModelIds([...(Array.isArray(item.aliases) ? item.aliases : []), modelId, ...(metadata.aliases || [])]);
  return compactObject({
    ...item,
    name: item.name || modelId,
    model: item.model || modelId,
    aliases,
    source: item.source || metadata.source,
    family: item.family || metadata.family,
    quantization: item.quantization || metadata.quantization,
    context_length: item.context_length || metadata.context_length,
    max_tokens: item.max_tokens || metadata.max_tokens,
    sampler: item.sampler || metadata.sampler,
    harness: item.harness || metadata.harness,
    capabilities: Array.from(new Set([...(Array.isArray(item.capabilities) ? item.capabilities : []), ...(metadata.capabilities || ["completion", "chat"])])),
    details: detailsFromMetadata(item.details, metadata),
    metadata: compactObject({ ...(item.metadata || {}), ...metadata, aliases }),
  });
}

function enrichModelsResponse(modelsResponse) {
  if (!modelsResponse || typeof modelsResponse !== "object") return modelsResponse;
  const response = { ...modelsResponse };
  if (Array.isArray(response.data)) {
    response.data = response.data.map(enrichOpenAIModelEntry);
  }
  if (Array.isArray(response.models)) {
    response.models = response.models.map(enrichFastFlowModelEntry);
  }
  response.metadata = compactObject({
    default_model: defaultModel,
    public_models: publicModels,
    harness_models: harnessModelAliases,
    audio_models: audioPublicModels,
    model: metadataForModelId(defaultModel),
    audio: audioModelMetadata,
  });
  return response;
}

function addModelToOpenAIData(response, modelId, base, ownedBy = "local") {
  if (!isUsableModelId(modelId)) return;
  if (!Array.isArray(response.data)) response.data = [];
  if (response.data.some((item) => item.id === modelId)) return;
  response.data.push({
    ...(base || {}),
    id: modelId,
    object: base?.object || "model",
    created: base?.created || 0,
    owned_by: base?.owned_by || ownedBy,
    aliases: Array.from(new Set([...(base?.aliases || []), modelId])),
  });
}

function addModelToFastFlowModels(response, modelId, base) {
  if (!isUsableModelId(modelId)) return;
  if (!Array.isArray(response.models)) response.models = [];
  if (response.models.some((item) => item.name === modelId || item.model === modelId)) return;
  response.models.push({
    ...(base || {}),
    name: modelId,
    model: modelId,
  });
}

function addAudioModelAliases(modelsResponse, audioModelsResponse = null) {
  const response = { ...modelsResponse };
  const audioData = Array.isArray(audioModelsResponse?.data) ? audioModelsResponse.data : [];
  const audioModels = Array.isArray(audioModelsResponse?.models) ? audioModelsResponse.models : [];
  const openAIBase = audioData.find((item) => audioPublicModels.includes(item.id) || item.id === audioModel) ||
    { object: "model", created: 0, owned_by: "fastflowlm", type: "audio.transcription" };
  const fastFlowBase = audioModels.find((item) => audioPublicModels.includes(item.name) || audioPublicModels.includes(item.model) || item.name === audioModel || item.model === audioModel) ||
    { details: { family: "whisper-v3" }, label: ["audio", "transcription"], asr: true };

  for (const modelId of audioPublicModels) {
    addModelToOpenAIData(response, modelId, openAIBase, "fastflowlm");
    addModelToFastFlowModels(response, modelId, fastFlowBase);
  }
  return response;
}

function normalizeResponseContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content ?? "");
  return content.map((part) => {
    if (part.type === "input_text" || part.type === "output_text") {
      return { type: "text", text: part.text || "" };
    }
    if (part.type === "input_image") {
      return { type: "image_url", image_url: { url: part.image_url || part.file_id || "" } };
    }
    return part;
  });
}

function anthropicContentToOpenAI(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content ?? "");
  return content.map((part) => {
    if (part.type === "text") return { type: "text", text: part.text || "" };
    if (part.type === "image" && part.source?.type === "base64") {
      const mediaType = part.source.media_type || "image/png";
      return { type: "image_url", image_url: { url: `data:${mediaType};base64,${part.source.data || ""}` } };
    }
    if (part.type === "image_url") return part;
    return { type: "text", text: JSON.stringify(part) };
  });
}

function textFromAnthropicContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content ?? "");
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part.type === "text") return part.text || "";
      if (part.type === "tool_result") {
        if (typeof part.content === "string") return part.content;
        return JSON.stringify(part.content ?? "");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function normalizeAnthropicMessages(anthropicMessages = []) {
  const messages = [];

  for (const message of anthropicMessages) {
    const content = message.content;
    if (message.role === "assistant" && Array.isArray(content)) {
      const textParts = content.filter((part) => part.type === "text").map((part) => part.text || "").filter(Boolean);
      const toolCalls = content.filter((part) => part.type === "tool_use").map((part) => ({
        id: part.id || `call_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
        type: "function",
        function: {
          name: part.name,
          arguments: JSON.stringify(part.input || {}),
        },
      }));
      messages.push({
        role: "assistant",
        content: textParts.join("\n") || null,
        ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
      });
      continue;
    }

    if (message.role === "user" && Array.isArray(content) && content.some((part) => part.type === "tool_result")) {
      const regularParts = content.filter((part) => part.type !== "tool_result");
      if (regularParts.length) {
        messages.push({ role: "user", content: anthropicContentToOpenAI(regularParts) });
      }
      for (const part of content.filter((item) => item.type === "tool_result")) {
        messages.push({
          role: "tool",
          tool_call_id: part.tool_use_id || part.id || "",
          content: textFromAnthropicContent([part]),
        });
      }
      continue;
    }

    messages.push({
      role: message.role === "assistant" ? "assistant" : "user",
      content: anthropicContentToOpenAI(content),
    });
  }

  return messages;
}

function anthropicToolsToOpenAI(tools) {
  if (!Array.isArray(tools)) return undefined;
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description || "",
      parameters: tool.input_schema || tool.parameters || { type: "object", properties: {} },
    },
  }));
}

function anthropicToolChoiceToOpenAI(toolChoice) {
  if (!toolChoice) return undefined;
  if (typeof toolChoice === "string") return toolChoice;
  if (toolChoice.type === "auto") return "auto";
  if (toolChoice.type === "none") return "none";
  if (toolChoice.type === "any") return "required";
  if (toolChoice.type === "tool" && toolChoice.name) {
    return { type: "function", function: { name: toolChoice.name } };
  }
  return undefined;
}

function withSamplingDefaults(body) {
  const next = { ...body };
  if (next.model == null) next.model = defaultModel;
  if (next.temperature == null) next.temperature = defaultTemperature;
  if (next.top_p == null) next.top_p = defaultTopP;
  if (next.top_k == null) next.top_k = defaultTopK;
  if (next.min_p == null) next.min_p = defaultMinP;
  if (next.presence_penalty == null) next.presence_penalty = defaultPresencePenalty;
  if (next.repeat_penalty == null) next.repeat_penalty = defaultRepeatPenalty;
  if (next.max_tokens == null && next.max_output_tokens == null) next.max_tokens = defaultMaxTokens;

  return next;
}

async function handleResponses(req, res) {
  const body = await readBody(req);
  const messages = normalizeInput(body.input);
  if (body.instructions) messages.unshift({ role: "system", content: body.instructions });

  const chatPayload = withSamplingDefaults({
    model: body.model || defaultModel,
    messages,
    temperature: body.temperature,
    top_p: body.top_p,
    top_k: body.top_k,
    min_p: body.min_p,
    presence_penalty: body.presence_penalty,
    repeat_penalty: body.repeat_penalty ?? body.repetition_penalty,
    max_tokens: body.max_output_tokens ?? body.max_tokens,
    stream: false,
  });

  let completion;
  const policy = await getHarnessPolicyForModel(chatPayload.model);
  if (policy) {
    const mod = await getHarnessModule();
    completion = await mod.runChatCompletionHarness({
      upstreamJson,
      requestPayload: chatPayload,
      policy,
      logJsonl: harnessLogJsonl,
      path: "/v1/chat/completions",
    });
  } else {
    completion = await upstreamJson("/v1/chat/completions", chatPayload);
  }

  const choice = completion.choices?.[0] || {};
  const text = choice.message?.content || "";
  const reasoning = choice.message?.reasoning_content;
  const id = `resp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const response = {
    id,
    object: "response",
    created_at: Math.floor(Date.now() / 1000),
    status: "completed",
    model: body.model || completion.model || defaultModel,
    output: [{
      id: `msg_${id.slice(5)}`,
      type: "message",
      status: "completed",
      role: "assistant",
      content: [{ type: "output_text", text, annotations: [] }],
    }],
    output_text: text,
    reasoning: reasoning ? { summary: [{ type: "summary_text", text: reasoning }] } : undefined,
    usage: completion.usage || null,
  };
  responses.set(id, response);
  if (responses.size > MAX_STORED_RESPONSES) {
    responses.delete(responses.keys().next().value);
  }
  json(res, 200, response);
}

async function handleAnthropicMessages(req, res) {
  const body = await readBody(req);
  const messages = [];

  if (body.system) {
    const systemText = Array.isArray(body.system)
      ? body.system.map((part) => part.text || "").join("\n")
      : String(body.system);
    messages.push({ role: "system", content: systemText });
  }

  messages.push(...normalizeAnthropicMessages(body.messages || []));

  const chatPayload = withSamplingDefaults({
    model: body.model || defaultModel,
    messages,
    temperature: body.temperature,
    top_p: body.top_p,
    top_k: body.top_k,
    min_p: body.min_p,
    presence_penalty: body.presence_penalty,
    repeat_penalty: body.repeat_penalty ?? body.repetition_penalty,
    max_tokens: body.max_tokens,
    tools: anthropicToolsToOpenAI(body.tools),
    tool_choice: anthropicToolChoiceToOpenAI(body.tool_choice),
    stream: false,
  });

  let completion;
  const policy = await getHarnessPolicyForModel(chatPayload.model);
  if (policy) {
    const mod = await getHarnessModule();
    completion = await mod.runChatCompletionHarness({
      upstreamJson,
      requestPayload: chatPayload,
      policy,
      logJsonl: harnessLogJsonl,
      path: "/v1/chat/completions",
    });
  } else {
    completion = await upstreamJson("/v1/chat/completions", chatPayload);
  }

  const choice = completion.choices?.[0] || {};
  const message = choice.message || {};
  const text = message.content || "";
  const reasoning = choice.message?.reasoning_content || "";
  const content = [];
  const toolCalls = message.tool_calls || [];
  if (reasoning) content.push({ type: "thinking", thinking: reasoning, signature: "" });
  if (text) content.push({ type: "text", text });
  for (const call of toolCalls) {
    let input = {};
    try {
      input = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
    } catch {
      input = { raw_arguments: call.function?.arguments || "" };
    }
    content.push({
      type: "tool_use",
      id: call.id,
      name: call.function?.name || "",
      input,
    });
  }
  if (!content.length) content.push({ type: "text", text: "" });
  json(res, 200, {
    id: `msg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    type: "message",
    role: "assistant",
    model: body.model || completion.model || defaultModel,
    content,
    stop_reason: toolCalls.length ? "tool_use" : choice.finish_reason === "length" ? "max_tokens" : "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: completion.usage?.prompt_tokens || 0,
      output_tokens: completion.usage?.completion_tokens || 0,
    },
  });
}

function formatRemoteAddress(req) {
  const raw = req.socket?.remoteAddress || "";
  return raw.startsWith("::ffff:") ? raw.slice(7) : raw || "unknown";
}

function logRequest(req, url) {
  const port = req.socket?.localPort || "";
  console.log(`[access] ${req.method} ${url.pathname} from ${formatRemoteAddress(req)}:${req.socket?.remotePort || ""} to ${port}`);
}

const requestHandler = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    logRequest(req, url);
    if (req.method === "OPTIONS") return json(res, 200, {});
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      const policy = await getHarnessPolicy();
      return json(res, 200, {
        status: "ok",
        upstream,
        model: defaultModel,
        harness: policy ? {
          name: policy.name,
          version: policy.version,
          policy: harnessPolicyPath,
          mode: hasHarnessModelGate ? "selected_models" : "all_models",
          model_aliases: harnessModelAliases,
        } : null,
      });
    }
    if (req.method === "GET" && url.pathname === "/v1/models") {
      const upstreamResponse = await fetch(`${upstream}/v1/models`);
      let audioModelsResponse = null;
      if (audioUpstream !== upstream) {
        try {
          const audioResponse = await fetch(`${audioUpstream}/v1/models`);
          if (audioResponse.ok) audioModelsResponse = filterInvalidModelEntries(await audioResponse.json());
        } catch {}
      }
      const upstreamModelsResponse = filterInvalidModelEntries(await upstreamResponse.json());
      const modelsResponse = filterInvalidModelEntries(addAudioModelAliases(addPublicModelAliases(upstreamModelsResponse), audioModelsResponse));
      return json(res, upstreamResponse.status, enrichModelsResponse(modelsResponse));
    }
    if (req.method === "GET" && url.pathname.startsWith("/v1/responses/")) {
      const id = url.pathname.split("/").pop();
      return responses.has(id) ? json(res, 200, responses.get(id)) : json(res, 404, { error: { message: "response not found" } });
    }
    if (req.method === "POST" && url.pathname === "/v1/chat/completions") return await proxy(req, res, "/v1/chat/completions");
    if (req.method === "POST" && url.pathname === "/v1/completions") return await proxy(req, res, "/v1/completions");
    if (req.method === "POST" && url.pathname === "/completion") return await proxy(req, res, "/completion");
    if (req.method === "POST" && url.pathname === "/v1/audio/transcriptions") return await proxyRaw(req, res, "/v1/audio/transcriptions", audioUpstream);
    if (req.method === "POST" && url.pathname === "/v1/responses") return await handleResponses(req, res);
    if (req.method === "POST" && (url.pathname === "/v1/messages" || url.pathname === "/anthropic/v1/messages")) return await handleAnthropicMessages(req, res);
    json(res, 404, { error: { message: `No route for ${req.method} ${url.pathname}` } });
  } catch (err) {
    json(res, err.statusCode || 500, { error: { message: err.message || String(err) } });
  }
};

export function startServers() {
  return listenPorts.map((listenPort) => {
    const server = http.createServer(requestHandler);
    server.listen(listenPort, host, () => {
      console.log(`LAN adapter listening on http://${host}:${listenPort}`);
      console.log(`Upstream ${upstreamKind}: ${upstream}`);
      console.log(`Audio upstream: ${audioUpstream}`);
      console.log(`Model alias: ${defaultModel}`);
      console.log(`Public model aliases: ${publicModels.join(", ")}`);
      console.log("Endpoints: /v1/chat/completions, /v1/responses, /v1/messages, /v1/audio/transcriptions");
    });
    return server;
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServers();
}
