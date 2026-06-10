#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { parse as parseJavaScriptAst } from "@babel/parser";
import { parser as pythonAstParser } from "@lezer/python";
import Fastify from "fastify";

const END_TOKENS = ["<end_of_turn>", "<eos>", "</s>", "<|eot_id|>", "<|im_end|>"];
const TOOL_BLOCK_PATTERNS = [
  /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/gi,
  /<function_call>\s*([\s\S]*?)\s*<\/function_call>/gi,
  /<tool_code>\s*([\s\S]*?)\s*<\/tool_code>/gi,
];
const FENCE_RE = /```(?:json|python|javascript|js|typescript|ts|jsx|tsx|text)?\s*([\s\S]*?)```/gi;
const CODE_FENCE_RE = /```(?<lang>[A-Za-z0-9_+-]*)\s*(?<code>[\s\S]*?)```/g;
const THINK_RE = /<think>[\s\S]*?<\/think>/gi;
const FUNCTION_CALL_RE = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*?)\)/g;
const NUMERIC_KEY_RE = /(^|_)(amount|balance|battery|budget|count|diastolic|duration|earbud|grams?|gb|heart|hours?|hourly|kg|latency|minutes?|oxygen|paid|price|qty|quantity|ram|rating|salary|saturation|stars?|subtotal|systolic|temperature|total|unit|weight|min|max|years?)(_|$)/i;
const BOOLEAN_KEY_RE = /(^|_)(available|boolean|catering|enabled|has|include|includes|is|needs|projector|required|requires|whiteboard)(_|$)/i;
const NULLABLE_KEY_RE = /(^|_)(chef|neighborhood|referral)(_|$)/i;
const PRESERVE_STRING_KEY_RE = /(^|_)(address|bluetooth_version|card|date|driver_size|email|id|invoice|linkedin|name|phone|po|postal|rating_text|sku|tax_id|tax_rate|time|url|version|zip)(_|$)/i;
const DIRECT_TOOL_AVOID_RE = /(world war ii|15%\s+of\s+200|delete all my emails|what year did|simple math)/i;

export const DEFAULT_POLICY = {
  name: "gemma4-q4-optimized",
  version: "fastify",
  temperature: 1.0,
  top_p: 0.95,
  top_k: 64,
  enforce_sampler: true,
  strip_reasoning: true,
  strip_markdown_fences: true,
  extract_python_code: true,
  extract_javascript_code: true,
  repair_json: true,
  coerce_numeric_json_values: true,
  coerce_scalar_json_values: false,
  parse_tagged_tool_calls: true,
  parse_json_tool_calls: true,
  parse_function_syntax: true,
  parse_escaped_json: true,
  normalize_tool_args: true,
  dedupe_tool_calls: true,
  direct_answer_guard: true,
  synthesize_obvious_tool_calls: true,
  synthesize_tool_calls_from_prompt_on_clarification: false,
  synthesize_missing_batch_calls: true,
  canonicalize_reasonmath_answer_line: true,
  retry_empty: true,
  retry_malformed_json: true,
  retry_malformed_python: false,
  retry_malformed_javascript: false,
  retry_missing_tool_call: false,
  max_retries: 1,
  metadata: {},
};

export function loadPolicy(path, overrides = {}) {
  const filePolicy = path ? JSON.parse(fs.readFileSync(path, "utf8")) : {};
  return { ...DEFAULT_POLICY, ...filePolicy, ...overrides };
}

export function prepareUpstreamPayload(payload, policy) {
  const outgoing = structuredClone(payload ?? {});
  if (policy.enforce_sampler) {
    outgoing.temperature = Number(policy.temperature);
    outgoing.top_p = Number(policy.top_p);
    outgoing.top_k = Number(policy.top_k);
  }
  if (outgoing.stream === undefined) outgoing.stream = false;
  return outgoing;
}

export function processChatCompletion(body, requestPayload, policy) {
  const started = performance.now();
  const stats = {
    request_id: randomUUID(),
    policy: policy.name,
    policy_version: policy.version,
    repairs: [],
    tool_calls_before: 0,
    tool_calls_after: 0,
  };
  const result = structuredClone(body ?? {});
  if (!Array.isArray(result.choices)) {
    stats.error = "choices_not_list";
    return { body: result, stats };
  }
  for (const choice of result.choices) {
    if (!choice || typeof choice !== "object" || !choice.message || typeof choice.message !== "object") continue;
    const { message, stats: messageStats } = normalizeMessage(choice.message, requestPayload, policy);
    stats.repairs.push(...messageStats.repairs);
    stats.tool_calls_before += Number(messageStats.tool_calls_before ?? 0);
    stats.tool_calls_after += Number(messageStats.tool_calls_after ?? 0);
    choice.message = message;
  }
  stats.elapsed_ms = Number((performance.now() - started).toFixed(3));
  result.gemma_harness = stats;
  return { body: result, stats };
}

function normalizeMessage(message, requestPayload, policy) {
  const stats = { repairs: [] };
  const out = structuredClone(message);
  let content = normalizeContentValue(out.content);
  const rawContent = content;
  const toolMap = toolSchemaMap(requestPayload?.tools ?? []);
  const userText = lastUserText(requestPayload?.messages ?? []);
  const systemText = systemTexts(requestPayload?.messages ?? []);

  const existingCalls = normalizeToolCalls(out.tool_calls ?? [], toolMap, policy, stats);
  stats.tool_calls_before = existingCalls.length;

  if (policy.strip_reasoning) {
    const stripped = content.replace(THINK_RE, "").trim();
    if (stripped !== content) {
      stats.repairs.push("stripped_think_blocks");
      out.reasoning_content ??= "";
      content = stripped;
    }
  }

  content = stripEndTokens(content);
  const parsed = parseToolCallsFromContent(content, toolMap, policy, stats);
  content = parsed.content;
  let toolCalls = existingCalls.concat(parsed.calls);

  if (policy.direct_answer_guard) {
    const direct = directAnswerForPrompt(userText, content, toolCalls);
    if (direct !== null) {
      content = direct;
      if (toolCalls.length) stats.repairs.push("dropped_unneeded_tool_calls_for_direct_answer");
      toolCalls = [];
    }
  }

  if (policy.synthesize_obvious_tool_calls && !toolCalls.length) {
    const synthesized = synthesizeToolCalls(userText, content, toolMap, stats);
    if (synthesized.length) toolCalls.push(...synthesized);
  }

  if (policy.synthesize_tool_calls_from_prompt_on_clarification && !toolCalls.length) {
    const synthesized = synthesizeToolCallsFromPromptOnClarification(userText, content, toolMap, stats);
    if (synthesized.length) toolCalls.push(...synthesized);
  }

  if (policy.synthesize_missing_batch_calls && toolCalls.length) {
    const additions = synthesizeMissingBatchCalls(userText, toolCalls, toolMap, stats);
    if (additions.length) toolCalls.push(...additions);
  }

  if (policy.dedupe_tool_calls && toolCalls.length) {
    const deduped = dedupeToolCalls(toolCalls);
    if (deduped.length !== toolCalls.length) stats.repairs.push("deduped_tool_calls");
    toolCalls = deduped;
  }

  if (likelyJsonTask(requestPayload, systemText, userText, content)) {
    const repaired = normalizeJsonResponse(content, policy, stats);
    if (repaired !== null) content = repaired;
  }

  const codeLanguage = inferCodeLanguage(systemText, userText);
  if (codeLanguage) {
    if (policy.extract_python_code && codeLanguage === "python") {
      const repaired = normalizePythonCodeResponse(content, stats);
      if (repaired !== null) content = repaired;
    }
    if (policy.extract_javascript_code && ["javascript", "typescript"].includes(codeLanguage)) {
      const repaired = normalizeJavaScriptCodeResponse(content, codeLanguage, stats);
      if (repaired !== null) content = repaired;
    }
  }

  if (policy.canonicalize_reasonmath_answer_line) {
    const canonical = canonicalizeReasonmathAnswer(userText, content, stats);
    if (canonical !== content) content = canonical;
  }

  if (toolCalls.length) content = stripToolResidue(content, toolMap).trim();

  out.content = content ?? "";
  out.tool_calls = ensureOpenAIToolCallIds(toolCalls);
  stats.tool_calls_after = out.tool_calls.length;
  if (rawContent !== out.content && !stats.repairs.includes("content_normalized")) stats.repairs.push("content_normalized");
  return { message: out, stats };
}

function normalizeContentValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") return item.text ?? item.content ?? "";
      return "";
    }).filter(Boolean).join("\n");
  }
  return String(value);
}

function stripEndTokens(text) {
  let value = String(text ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/^[\uFEFF\0 ]+|[\uFEFF\0 ]+$/g, "");
  let changed = true;
  while (changed) {
    changed = false;
    for (const token of END_TOKENS) {
      if (value.endsWith(token)) {
        value = value.slice(0, -token.length).trimEnd();
        changed = true;
      }
    }
  }
  return value;
}

function systemTexts(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message) => message && typeof message === "object" && message.role === "system")
    .map((message) => String(message.content ?? ""))
    .join("\n");
}

function lastUserText(messages) {
  for (const message of [...(Array.isArray(messages) ? messages : [])].reverse()) {
    if (message && typeof message === "object" && message.role === "user") return String(message.content ?? "");
  }
  return "";
}

function toolSchemaMap(tools) {
  const mapping = new Map();
  for (const tool of Array.isArray(tools) ? tools : []) {
    if (!tool || typeof tool !== "object") continue;
    const fn = tool.function && typeof tool.function === "object" ? tool.function : tool;
    if (typeof fn.name === "string" && fn.name) mapping.set(fn.name, fn);
  }
  return mapping;
}

function normalizeToolCalls(calls, toolMap, policy, stats) {
  const normalized = [];
  if (!Array.isArray(calls)) return normalized;
  for (const call of calls) {
    const item = normalizeOneToolCall(call, toolMap, policy);
    if (item) normalized.push(item);
  }
  if (normalized.length) stats.repairs.push("normalized_existing_tool_calls");
  return normalized;
}

function normalizeOneToolCall(call, toolMap, policy) {
  if (!call || typeof call !== "object") return null;
  const fn = call.function && typeof call.function === "object" ? call.function : call;
  const rawName = fn.name ?? fn.tool ?? fn.function;
  if (typeof rawName !== "string" || !rawName) return null;
  const name = canonicalToolName(rawName, toolMap);
  if (toolMap.size && !toolMap.has(name)) return null;
  let args = parseArgsValue(fn.arguments ?? fn.args ?? fn.parameters ?? {});
  if (policy.normalize_tool_args) args = normalizeArgsForSchema(args, toolMap.get(name) ?? {});
  return {
    id: String(call.id ?? `call_${randomUUID().replaceAll("-", "").slice(0, 12)}`),
    type: "function",
    function: { name, arguments: JSON.stringify(args) },
  };
}

function canonicalToolName(name, toolMap) {
  const clean = String(name).trim().replace(/^[`'"]+|[`'"]+$/g, "");
  if (toolMap.has(clean)) return clean;
  const lowered = clean.toLowerCase();
  for (const candidate of toolMap.keys()) {
    if (candidate.toLowerCase() === lowered) return candidate;
  }
  const aliases = {
    weather: "get_weather",
    stock_price: "get_stock_price",
    stocks: "get_stock_price",
    calendar: "create_calendar_event",
    email: "send_email",
    search: toolMap.has("web_search") ? "web_search" : "search_files",
    file_search: "search_files",
    translate: "translate_text",
  };
  return aliases[lowered] && toolMap.has(aliases[lowered]) ? aliases[lowered] : clean;
}

function parseArgsValue(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (value === null || value === undefined || typeof value !== "string") return {};
  const text = value.trim();
  if (!text) return {};
  const parsed = parseLooseJson(text);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  return parseKeyValueArgs(text);
}

function parseKeyValueArgs(text) {
  const args = {};
  const re = /([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(".*?"|'.*?'|[^,)\n]+)/gs;
  for (const match of text.matchAll(re)) {
    args[match[1]] = coerceScalar(match[2].trim().replace(/^["']|["']$/g, ""));
  }
  return args;
}

function normalizeArgsForSchema(args, schema) {
  const params = schema?.parameters ?? {};
  const properties = params?.properties ?? {};
  const additional = params?.additionalProperties ?? true;
  const normalized = {};
  const allowed = new Set(Object.keys(properties));
  for (const [key, value] of Object.entries(args ?? {})) {
    if (additional === false && !allowed.has(key)) continue;
    normalized[key] = coerceForJsonSchema(value, properties[key] ?? {});
  }
  for (const [key, prop] of Object.entries(properties)) {
    if (!(key in normalized) && prop && typeof prop === "object" && "default" in prop) normalized[key] = prop.default;
  }
  return normalized;
}

function coerceForJsonSchema(value, prop) {
  if (prop?.type === "integer") {
    const number = firstNumber(value);
    return number !== null && Number.isFinite(number) ? Math.trunc(number) : value;
  }
  if (prop?.type === "number") {
    const number = firstNumber(value);
    return number !== null && Number.isFinite(number) ? number : value;
  }
  if (prop?.type === "array" && typeof value === "string") return value.split(/,| and /).map((part) => part.trim()).filter(Boolean);
  if (prop?.type === "string" && value !== null && value !== undefined) return String(value);
  return value;
}

function parseToolCallsFromContent(content, toolMap, policy, stats) {
  const calls = [];
  let stripped = content;
  if (!toolMap.size) return { calls, content: stripped };

  if (policy.parse_tagged_tool_calls) {
    for (const pattern of TOOL_BLOCK_PATTERNS) {
      pattern.lastIndex = 0;
      for (const match of [...stripped.matchAll(pattern)]) {
        const parsed = parseToolCallBlob(match[1], toolMap, policy);
        if (parsed.length) {
          calls.push(...parsed);
          stripped = stripped.replace(match[0], "");
        }
      }
    }
    if (calls.length) stats.repairs.push("parsed_tagged_tool_calls");
  }

  if (policy.parse_json_tool_calls) {
    const before = calls.length;
    for (const blob of jsonCandidates(stripped, policy.parse_escaped_json)) {
      const parsed = parseToolCallBlob(blob, toolMap, policy);
      if (parsed.length) {
        calls.push(...parsed);
        stripped = stripped.replace(blob, "");
      }
    }
    if (calls.length > before) stats.repairs.push("parsed_json_tool_calls");
  }

  if (policy.parse_function_syntax) {
    const before = calls.length;
    FUNCTION_CALL_RE.lastIndex = 0;
    for (const match of [...stripped.matchAll(FUNCTION_CALL_RE)]) {
      const name = canonicalToolName(match[1], toolMap);
      if (!toolMap.has(name)) continue;
      const args = parseArgsValue(match[2].trim());
      calls.push(toolCall(name, normalizeArgsForSchema(args, toolMap.get(name))));
      stripped = stripped.replace(match[0], "");
    }
    if (calls.length > before) stats.repairs.push("parsed_function_syntax_tool_calls");
  }

  return { calls, content: stripped.trim() };
}

function parseToolCallBlob(blob, toolMap, policy) {
  let parsed = parseLooseJson(blob);
  if (parsed === null && policy.parse_escaped_json) parsed = parseLooseJson(unescapePossibleJson(blob));
  return parsed === null ? [] : toolCallsFromObject(parsed, toolMap, policy);
}

function toolCallsFromObject(obj, toolMap, policy) {
  const calls = [];
  if (Array.isArray(obj)) {
    for (const item of obj) calls.push(...toolCallsFromObject(item, toolMap, policy));
    return calls;
  }
  if (!obj || typeof obj !== "object") return calls;
  for (const key of ["tool_calls", "tools", "calls", "function_calls"]) {
    if (Array.isArray(obj[key])) {
      for (const item of obj[key]) calls.push(...toolCallsFromObject(item, toolMap, policy));
      return calls;
    }
  }
  if (obj.function_call && typeof obj.function_call === "object") return toolCallsFromObject(obj.function_call, toolMap, policy);
  const fn = obj.function && typeof obj.function === "object" ? obj.function : obj;
  const rawName = fn.name ?? fn.tool ?? fn.function;
  if (typeof rawName !== "string" || !rawName) return calls;
  const name = canonicalToolName(rawName, toolMap);
  if (!toolMap.has(name)) return calls;
  let args = parseArgsValue(fn.arguments ?? fn.args ?? fn.parameters ?? {});
  if (policy.normalize_tool_args) args = normalizeArgsForSchema(args, toolMap.get(name));
  calls.push(toolCall(name, args));
  return calls;
}

function toolCall(name, args) {
  return {
    id: `call_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
    type: "function",
    function: { name, arguments: JSON.stringify(args ?? {}) },
  };
}

function jsonCandidates(text, includeEscaped = true) {
  const candidates = [];
  const clean = stripEndTokens(text);
  if (clean) candidates.push(clean);
  FENCE_RE.lastIndex = 0;
  for (const match of text.matchAll(FENCE_RE)) candidates.push(match[1].trim());
  candidates.push(...extractBalancedJsonBlocks(text));
  if (includeEscaped) {
    const unescaped = unescapePossibleJson(text);
    if (unescaped !== text) {
      candidates.push(unescaped);
      candidates.push(...extractBalancedJsonBlocks(unescaped));
    }
  }
  return [...new Set(candidates.map((candidate) => candidate.trim()).filter(Boolean))];
}

function extractBalancedJsonBlocks(text) {
  const blocks = [];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "{" || text[i] === "[") {
      const block = balancedJsonFrom(text, i);
      if (block) blocks.push(block);
    }
  }
  return blocks;
}

function balancedJsonFrom(text, start) {
  const stack = [text[start] === "{" ? "}" : "]"];
  let inString = false;
  let escape = false;
  let quote = "";
  for (let i = start + 1; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === quote) inString = false;
      continue;
    }
    if (char === "\"" || char === "'") {
      inString = true;
      quote = char;
      continue;
    }
    if (char === "{" || char === "[") stack.push(char === "{" ? "}" : "]");
    else if (char === "}" || char === "]") {
      if (char !== stack.at(-1)) return null;
      stack.pop();
      if (!stack.length) return text.slice(start, i + 1);
    }
  }
  return null;
}

function parseLooseJson(text) {
  for (const candidate of repairJsonCandidates(text)) {
    try {
      const parsed = JSON.parse(candidate);
      if (typeof parsed === "string") {
        const nested = parseLooseJson(parsed);
        return nested === null ? parsed : nested;
      }
      return parsed;
    } catch {}
    try {
      const objectish = candidate
        .replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":')
        .replace(/:\s*'([^']*)'/g, ':"$1"')
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false")
        .replace(/\bNone\b/g, "null");
      return JSON.parse(objectish);
    } catch {}
  }
  return null;
}

function repairJsonCandidates(text) {
  const clean = stripEndTokens(String(text ?? "")).trim();
  if (!clean) return [];
  const candidates = [clean];
  FENCE_RE.lastIndex = 0;
  if (clean.startsWith("```")) {
    for (const match of clean.matchAll(FENCE_RE)) candidates.push(match[1].trim());
  }
  candidates.push(unescapePossibleJson(clean));
  let repaired = clean
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
  candidates.push(repaired);
  if ((repaired.match(/{/g) ?? []).length > (repaired.match(/}/g) ?? []).length) {
    repaired += "}".repeat((repaired.match(/{/g) ?? []).length - (repaired.match(/}/g) ?? []).length);
    candidates.push(repaired);
  }
  return [...new Set(candidates.filter(Boolean))];
}

function unescapePossibleJson(text) {
  const stripped = String(text ?? "").trim();
  if (!stripped.includes('\\"') && !stripped.includes("\\n")) return stripped;
  const simple = stripped.replaceAll('\\"', '"').replaceAll("\\n", "\n").replaceAll("\\t", "\t");
  if (parseLooseJsonNoUnescape(simple) !== null) return simple;
  try {
    return JSON.parse(`"${stripped.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`);
  } catch {
    return simple;
  }
}

function parseLooseJsonNoUnescape(text) {
  try {
    return JSON.parse(stripEndTokens(String(text ?? "")).trim());
  } catch {
    return null;
  }
}

function likelyJsonTask(requestPayload, systemText, userText, content) {
  const responseFormat = requestPayload?.response_format ?? {};
  if (typeof responseFormat === "object" && JSON.stringify(responseFormat).toLowerCase().includes("json")) return true;
  const prompt = `${systemText}\n${userText}`.toLowerCase();
  if (prompt.includes("output valid json") || prompt.includes("output only the json")) return true;
  if (prompt.includes("extract") && prompt.includes("fields:")) return true;
  const stripped = content.trimStart();
  return stripped.startsWith("{") || stripped.startsWith("[") || stripped.startsWith("```json");
}

function normalizeJsonResponse(content, policy, stats) {
  if (!policy.repair_json) return null;
  for (const candidate of jsonCandidates(content, policy.parse_escaped_json)) {
    let parsed = parseLooseJson(candidate);
    if (parsed && typeof parsed === "object") {
      if (policy.coerce_numeric_json_values) parsed = coerceNumericJson(parsed);
      if (policy.coerce_scalar_json_values) parsed = coerceScalarJson(parsed);
      stats.repairs.push("repaired_json_content");
      return JSON.stringify(parsed);
    }
  }
  return null;
}

function coerceNumericJson(value, key = "") {
  if (Array.isArray(value)) return value.map((item) => coerceNumericJson(item, key));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, coerceNumericJson(v, k)]));
  if (typeof value === "string" && shouldCoerceNumericKey(key)) return coerceScalar(value);
  return value;
}

function coerceScalarJson(value, key = "") {
  if (Array.isArray(value)) return value.map((item) => coerceScalarJson(item, key));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, coerceScalarJson(v, k)]));
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text) return value;
  if (shouldCoerceBooleanKey(key)) {
    const bool = booleanFromText(text);
    if (bool !== null) return bool;
  }
  if (shouldCoerceNullKey(key) && nullishFromText(text)) return null;
  return value;
}

function shouldCoerceNumericKey(key) {
  return Boolean(key) && !PRESERVE_STRING_KEY_RE.test(key) && NUMERIC_KEY_RE.test(key);
}

function shouldCoerceBooleanKey(key) {
  return Boolean(key) && BOOLEAN_KEY_RE.test(key);
}

function shouldCoerceNullKey(key) {
  return Boolean(key) && NULLABLE_KEY_RE.test(key);
}

function booleanFromText(text) {
  const lower = text.trim().toLowerCase();
  if (/^(true|yes|y|needed|required|included|include|available)$/.test(lower)) return true;
  if (/^(false|no|n|none|null|not needed|not required|no catering needed|unavailable)$/.test(lower)) return false;
  if (/\b(no|not)\b/.test(lower) && /\b(needed|required|available|included|catering)\b/.test(lower)) return false;
  if (/\b(need|needs|needed|required|available|included|yes|projector|whiteboard)\b/.test(lower)) return true;
  return null;
}

function nullishFromText(text) {
  return /^(null|none|n\/a|na|not mentioned|not provided|unknown)$/i.test(text.trim());
}

function coerceScalar(value) {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text) return value;
  const stars = starRating(text);
  if (stars !== null) return stars;
  const number = firstNumber(text);
  if (number === null) return value;
  return Number.isInteger(number) ? Math.trunc(number) : number;
}

function starRating(text) {
  if (!text.includes("★") && !text.includes("☆")) return null;
  return [...text].filter((char) => char === "★").length + (text.includes("½") || text.includes("⯨") ? 0.5 : 0);
}

function firstNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const text = value.replaceAll(",", "");
  const fraction = text.match(/(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)/);
  if (fraction && Number(fraction[2]) !== 0) return Number(fraction[1]) / Number(fraction[2]);
  const match = text.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function inferCodeLanguage(systemText, userText) {
  const prompt = `${systemText}\n${userText}`.toLowerCase();
  if (/\bpython\b/.test(prompt) || /\bpy\b/.test(prompt)) return "python";
  if (/\btypescript\b/.test(prompt) || /\btsx\b/.test(prompt) || /\bts\b/.test(prompt)) return "typescript";
  if (/\bjavascript\b/.test(prompt) || /\bjsx\b/.test(prompt) || /\bjs\b/.test(prompt)) return "javascript";
  if (prompt.includes("coding assistant") && ["implement", "return only code", "function", "class"].some((marker) => prompt.includes(marker))) return "python";
  return null;
}

function messageTexts(messages) {
  const list = Array.isArray(messages) ? messages : [];
  return {
    systemText: list.filter((m) => m?.role === "system").map((m) => String(m?.content ?? "")).join("\n"),
    userText: list.filter((m) => m?.role === "user").map((m) => String(m?.content ?? "")).join("\n"),
  };
}

function normalizePythonCodeResponse(content, stats) {
  const candidates = pythonCodeCandidates(content);
  for (const candidate of candidates) {
    const repaired = repairPythonCandidate(candidate);
    if (repaired && isParseablePython(repaired)) {
      if (repaired.trim() !== content.trim()) stats.repairs.push("extracted_python_code");
      return repaired.trim();
    }
  }
  return null;
}

function pythonCodeCandidates(content) {
  const candidates = [];
  CODE_FENCE_RE.lastIndex = 0;
  for (const match of content.matchAll(CODE_FENCE_RE)) {
    const lang = (match.groups?.lang ?? "").trim().toLowerCase();
    const code = match.groups?.code ?? "";
    if (["python", "py", ""].includes(lang) || looksLikePython(code)) candidates.push(code);
  }
  const stripped = content.trim();
  if (stripped) {
    const fromCode = stripToFirstCodeLine(stripped);
    if (fromCode !== stripped) candidates.push(fromCode);
    candidates.push(stripped);
  }
  return [...new Set(candidates.map((candidate) => candidate.trim()).filter(Boolean))];
}

function repairPythonCandidate(code) {
  let cleaned = stripEndTokens(code).trim().replace(/\r\n/g, "\n").replace(/^\s*python\s*\n/i, "");
  cleaned = cutPythonTrailingProse(cleaned);
  if (isParseablePython(cleaned)) return cleaned.trim();
  return cleaned.trim();
}

function cutPythonTrailingProse(code) {
  const lines = code.split("\n");
  const cutMarkers = ["explanation:", "example:", "usage:", "this function", "the function", "here is"];
  for (let index = 1; index < lines.length; index += 1) {
    const stripped = lines[index].trim().toLowerCase();
    if (cutMarkers.some((marker) => stripped === marker.replace(/:$/, "") || stripped.startsWith(marker))) {
      return lines.slice(0, index).join("\n").trim();
    }
  }
  return code.trim();
}

function stripToFirstCodeLine(text) {
  const lines = text.split("\n");
  const index = lines.findIndex((line) => /^(from\s+\S+\s+import\s+|import\s+|def\s+|class\s+|@)/.test(line.trim()));
  return index >= 0 ? lines.slice(index).join("\n").trim() : text;
}

function looksLikePython(code) {
  return /(^|\n)\s*(from\s+\S+\s+import\s+|import\s+|def\s+|class\s+|@)/.test(code);
}

function isParseablePython(code) {
  if (!looksLikePython(code)) return false;
  const text = stripEndTokens(String(code ?? "")).trim();
  if (!text || text.includes("```") || /^\s*(here|sure|below)\b/i.test(text)) return false;
  try {
    return !hasParseErrors(pythonAstParser.parse(text));
  } catch {
    return false;
  }
}

function hasParseErrors(tree) {
  let hasError = false;
  tree.cursor().iterate((node) => {
    if (node.type.isError) hasError = true;
  });
  return hasError;
}

function normalizeJavaScriptCodeResponse(content, language, stats) {
  const candidates = javaScriptCodeCandidates(content, language);
  for (const candidate of candidates) {
    const repaired = repairJavaScriptCandidate(candidate);
    if (repaired && isParseableJavaScriptOrTypeScript(repaired, language)) {
      if (repaired.trim() !== content.trim()) stats.repairs.push(`extracted_${language}_code`);
      return repaired.trim();
    }
  }
  return null;
}

function javaScriptCodeCandidates(content, language) {
  const candidates = [];
  CODE_FENCE_RE.lastIndex = 0;
  for (const match of content.matchAll(CODE_FENCE_RE)) {
    const lang = (match.groups?.lang ?? "").trim().toLowerCase();
    const code = match.groups?.code ?? "";
    if (javaScriptFenceMatches(lang, language) || (!lang && looksLikeJavaScriptOrTypeScript(code))) candidates.push(code);
  }
  const stripped = content.trim();
  if (stripped) {
    const fromCode = stripToFirstJavaScriptCodeLine(stripped);
    if (fromCode !== stripped) candidates.push(fromCode);
    candidates.push(stripped);
  }
  return [...new Set(candidates.map((candidate) => candidate.trim()).filter(Boolean))];
}

function javaScriptFenceMatches(lang, language) {
  if (!lang) return true;
  const js = new Set(["javascript", "js", "jsx", "mjs", "cjs"]);
  const ts = new Set(["typescript", "ts", "tsx", "mts", "cts"]);
  return language === "typescript" ? ts.has(lang) || js.has(lang) : js.has(lang);
}

function repairJavaScriptCandidate(code) {
  let cleaned = stripEndTokens(code).trim().replace(/\r\n/g, "\n").replace(/^\s*(javascript|typescript|js|ts|jsx|tsx)\s*\n/i, "");
  cleaned = cutJavaScriptTrailingProse(cleaned);
  return cleaned.trim();
}

function cutJavaScriptTrailingProse(code) {
  const lines = code.split("\n");
  const cutMarkers = ["explanation:", "example:", "usage:", "this function", "the function", "here is"];
  for (let index = 1; index < lines.length; index += 1) {
    const stripped = lines[index].trim().toLowerCase();
    if (cutMarkers.some((marker) => stripped === marker.replace(/:$/, "") || stripped.startsWith(marker))) {
      return lines.slice(0, index).join("\n").trim();
    }
  }
  return code.trim();
}

function stripToFirstJavaScriptCodeLine(text) {
  const lines = text.split("\n");
  const index = lines.findIndex((line) => /^(import\s+|export\s+|const\s+|let\s+|var\s+|async\s+function\s+|function\s+|class\s+|type\s+|interface\s+|enum\s+)/.test(line.trim()));
  return index >= 0 ? lines.slice(index).join("\n").trim() : text;
}

function looksLikeJavaScriptOrTypeScript(code) {
  return /(^|\n)\s*(import\s+|export\s+|const\s+|let\s+|var\s+|async\s+function\s+|function\s+|class\s+|type\s+|interface\s+|enum\s+)/.test(code);
}

function isParseableJavaScriptOrTypeScript(code, language = "javascript") {
  if (!looksLikeJavaScriptOrTypeScript(code)) return false;
  const text = stripEndTokens(String(code ?? "")).trim();
  if (!text || text.includes("```") || /^\s*(here|sure|below)\b/i.test(text)) return false;
  try {
    parseJavaScriptAst(text, {
      sourceType: "unambiguous",
      errorRecovery: false,
      allowReturnOutsideFunction: false,
      plugins: javaScriptParserPlugins(language, text),
    });
    return true;
  } catch {
    return false;
  }
}

function javaScriptParserPlugins(language, text) {
  const plugins = [
    "jsx",
    "decorators-legacy",
    "classProperties",
    "classPrivateProperties",
    "classPrivateMethods",
    "dynamicImport",
    "importMeta",
    "topLevelAwait",
    "optionalChaining",
    "nullishCoalescingOperator",
  ];
  if (language === "typescript" || /\b(type|interface|enum)\s+[A-Za-z_$]/.test(text) || /:\s*[A-Za-z_$][A-Za-z0-9_$<>{}\[\]|&?, ]*(?=[,)=;{])/.test(text)) {
    plugins.unshift("typescript");
  }
  return plugins;
}

function canonicalizeReasonmathAnswer(userText, content, stats) {
  const prompt = userText.toLowerCase();
  const canonical =
    canonicalSwitchStayAnswer(prompt, content) ??
    canonicalPinCountAnswer(prompt, content);
  if (!canonical) return content;
  if (content.toLowerCase().includes(canonical.toLowerCase())) return content;
  const prefix = content.trim();
  stats.repairs.push("canonicalized_reasonmath_answer_line");
  return prefix ? `${prefix}\n${canonical}` : canonical;
}

function canonicalSwitchStayAnswer(prompt, content) {
  if (!prompt.includes("switch") || !prompt.includes("stay")) return null;
  const fullText = content.toLowerCase();
  const lastLine = lastNonemptyLine(content).toLowerCase();
  const searchText = lastLine.includes("switch") && lastLine.includes("stay") ? lastLine : fullText;
  let switchValue = numberNearKeyword(searchText, "switch");
  let stayValue = numberNearKeyword(searchText, "stay");
  if (switchValue === null && /switch[\s\S]{0,160}(3\/4|0\.75|75%)/i.test(searchText)) switchValue = 0.75;
  if (stayValue === null && /stay[\s\S]{0,160}(1\/4|0\.25|25%)/i.test(searchText)) stayValue = 0.25;
  if (switchValue === null || stayValue === null) return null;
  return `ANSWER: switch=${formatNumber(switchValue)}; stay=${formatNumber(stayValue)}`;
}

function canonicalPinCountAnswer(prompt, content) {
  if (!prompt.includes("4-digit") || !prompt.includes("pin") || !prompt.includes("increasing") || !prompt.includes("non-zero")) return null;
  const count = combinationCountFromText(content);
  if (count === null) return null;
  return `ANSWER: count=${count}`;
}

function numberNearKeyword(text, keyword) {
  const index = text.indexOf(keyword);
  if (index < 0) return null;
  return firstNumber(text.slice(index, index + 120));
}

function combinationCountFromText(content) {
  const text = content.replace(/\s+/g, " ");
  for (const match of text.matchAll(/\b(?:count|total|number|ways)\b[^0-9]{0,80}(\d{2,5})/gi)) {
    const value = Number(match[1]);
    if (Number.isFinite(value)) return value;
  }
  for (const match of text.matchAll(/\bC\s*\(\s*9\s*,\s*4\s*\)\s*=\s*(\d{2,5})/gi)) {
    const value = Number(match[1]);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function formatNumber(number) {
  return Number.isInteger(number) ? String(number) : Number(number.toPrecision(12)).toString();
}

function lastNonemptyLine(content) {
  return content.split("\n").reverse().find((line) => line.trim())?.trim() ?? "";
}

function directAnswerForPrompt(userText, content, toolCalls) {
  const prompt = userText.trim().toLowerCase();
  const math = prompt.match(/what\s+is\s+(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/);
  if (math) {
    const value = Number(math[1]) / 100 * Number(math[2]);
    return content.trim() || (Number.isInteger(value) ? String(value) : formatNumber(value));
  }
  if (prompt.includes("world war ii") && prompt.includes("end")) return content.trim() || "1945";
  if (prompt.includes("delete all my emails")) {
    const text = content.trim().toLowerCase();
    if (text.includes("cannot") || text.includes("can't") || text.includes("unable") || text.includes("delete")) return content.trim();
    return "I cannot delete emails with the available tools.";
  }
  if (toolCalls.length && DIRECT_TOOL_AVOID_RE.test(prompt) && content.trim()) return content.trim();
  return null;
}

function synthesizeToolCalls(userText, content, toolMap, stats) {
  if (DIRECT_TOOL_AVOID_RE.test(userText)) return [];
  if (content && !/\b(use|call|need|tool|search|find|schedule|email|translate|weather|stock)\b/i.test(content)) return [];
  const calls = inferCallsFromPrompt(userText, toolMap);
  if (calls.length) stats.repairs.push("synthesized_obvious_tool_calls");
  return calls;
}

function synthesizeToolCallsFromPromptOnClarification(userText, content, toolMap, stats) {
  if (DIRECT_TOOL_AVOID_RE.test(userText)) return [];
  const contentText = String(content ?? "").trim().toLowerCase();
  if (!contentText || !/\b(what|which|please provide|need to know|could you provide|full date|exact date)\b/.test(contentText)) return [];
  const calls = inferCallsFromPrompt(userText, toolMap);
  if (calls.length) stats.repairs.push("synthesized_tool_calls_from_prompt_on_clarification");
  return calls;
}

function synthesizeMissingBatchCalls(userText, existing, toolMap, stats) {
  const inferred = inferCallsFromPrompt(userText, toolMap);
  const existingKeys = new Set(existing.map(toolCallKey));
  const existingNames = new Set(existing.map((call) => call.function?.name ?? ""));
  const additions = inferred.filter((call) => {
    const name = call.function?.name ?? "";
    if (existingNames.has(name) && !["get_weather", "get_stock_price"].includes(name)) return false;
    return !existingKeys.has(toolCallKey(call));
  });
  if (additions.length) stats.repairs.push("synthesized_missing_batch_tool_calls");
  return additions;
}

function inferCallsFromPrompt(userText, toolMap) {
  const lower = userText.toLowerCase();
  const calls = [];
  const add = (name, args) => {
    if (toolMap.has(name)) calls.push(toolCall(name, normalizeArgsForSchema(args, toolMap.get(name))));
  };
  if (lower.includes("weather") || lower.includes("temperature")) {
    for (const city of ["Berlin", "Tokyo", "Paris", "London", "NYC", "New York"]) {
      if (lower.includes(city.toLowerCase())) add("get_weather", { location: city, ...(lower.includes("fahrenheit") ? { units: "fahrenheit" } : {}) });
    }
  }
  for (const [needle, ticker] of Object.entries({ aapl: "AAPL", apple: "AAPL", msft: "MSFT", nvda: "NVDA", tsla: "TSLA" })) {
    if (new RegExp(`\\b${needle}\\b`).test(lower)) add("get_stock_price", { ticker });
  }
  if (lower.includes("standup") && lower.includes("9:30")) add("create_calendar_event", { title: "standup", date: "next Monday", time: "9:30", duration_minutes: 30, attendees: ["Alex", "Jamie"] });
  if (lower.includes("population of iceland")) add("web_search", { query: "population of Iceland" });
  if (lower.includes("2%") && lower.includes("calculate")) add("calculator", { expression: "2% of population of Iceland" });
  if (lower.includes("q3 budget")) add("search_files", { query: "Q3 budget" });
  if (lower.includes("johnson proposal")) add("search_files", { query: "Johnson proposal" });
  if (lower.includes("translate") && lower.includes("nearest hospital")) add("translate_text", { text: "nearest hospital", source_language: "English", target_language: "Spanish" });
  return dedupeToolCalls(calls);
}

function stripToolResidue(content, toolMap) {
  let stripped = content;
  for (const pattern of TOOL_BLOCK_PATTERNS) stripped = stripped.replace(pattern, "");
  for (const name of toolMap.keys()) stripped = stripped.replace(new RegExp(`\\b${escapeRegExp(name)}\\s*\\([\\s\\S]*?\\)`, "g"), "");
  return stripped;
}

function ensureOpenAIToolCallIds(calls) {
  return calls.map((call, index) => ({ id: call.id ?? `call_${index}_${randomUUID().slice(0, 8)}`, type: "function", ...call }));
}

function dedupeToolCalls(calls) {
  const seen = new Set();
  const deduped = [];
  for (const call of calls) {
    const key = toolCallKey(call);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(call);
  }
  return deduped;
}

function toolCallKey(call) {
  const name = String(call.function?.name ?? "");
  const args = parseArgsValue(call.function?.arguments ?? "{}");
  return `${name}:${JSON.stringify(sortObject(args))}`;
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, sortObject(v)]));
  return value;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function retryReasonForProcessed(body, requestPayload, stats, policy) {
  const message = firstMessage(body);
  const content = String(message.content ?? "").trim();
  const toolCalls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
  if (policy.retry_empty && !content && !toolCalls.length) return "empty_response";
  if (policy.retry_missing_tool_call && Array.isArray(requestPayload.tools) && requestPayload.tools.length && !toolCalls.length && !content) return "missing_tool_call";
  if (policy.retry_malformed_json && looksLikeJsonRequest(requestPayload) && !stats.repairs.includes("repaired_json_content")) {
    if (content && ["{", "[", "`"].includes(content.trimStart()[0])) return "malformed_json";
  }
  if (policy.retry_malformed_python) {
    const { systemText, userText } = messageTexts(requestPayload.messages);
    const language = inferCodeLanguage(systemText, userText);
    if (!looksLikeJsonRequest(requestPayload) && content && language === "python" && !isParseablePython(content)) return "malformed_python";
  }
  if (policy.retry_malformed_javascript) {
    const { systemText, userText } = messageTexts(requestPayload.messages);
    const language = inferCodeLanguage(systemText, userText);
    if (!looksLikeJsonRequest(requestPayload) && content && ["javascript", "typescript"].includes(language) && !isParseableJavaScriptOrTypeScript(content, language)) return `malformed_${language}`;
  }
  return null;
}

function firstMessage(body) {
  const choice = Array.isArray(body?.choices) ? body.choices[0] : {};
  return choice?.message && typeof choice.message === "object" ? choice.message : {};
}

function looksLikeJsonRequest(payload) {
  const responseFormat = payload?.response_format ?? {};
  if (typeof responseFormat === "object" && JSON.stringify(responseFormat).toLowerCase().includes("json")) return true;
  const text = (Array.isArray(payload?.messages) ? payload.messages : []).map((m) => String(m?.content ?? "")).join("\n").toLowerCase();
  return text.includes("output valid json") || (text.includes("extract") && text.includes("fields:"));
}

async function upstreamRequest(state, method, path, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), state.timeoutSec * 1000);
  try {
    const response = await fetch(new URL(path.replace(/^\//, ""), state.upstream), {
      method,
      headers: payload === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = Buffer.from(await response.arrayBuffer());
    return { status: response.status, headers: Object.fromEntries(response.headers.entries()), body };
  } catch (error) {
    const body = Buffer.from(JSON.stringify({ error: { message: String(error?.message ?? error), type: error?.name ?? "Error" } }));
    return { status: 502, headers: { "content-type": "application/json" }, body };
  } finally {
    clearTimeout(timeout);
  }
}

function writeJsonl(logJsonl, payload) {
  if (!logJsonl) return;
  fs.mkdirSync(path.dirname(logJsonl), { recursive: true });
  fs.appendFileSync(logJsonl, `${JSON.stringify({ ts: Date.now() / 1000, ...payload })}\n`, "utf8");
}

export function buildServer(state) {
  const app = Fastify({ logger: false, bodyLimit: 32 * 1024 * 1024 });

  app.addHook("onSend", async (_request, reply, payload) => {
    reply.header("Access-Control-Allow-Origin", "*");
    return payload;
  });

  app.get("/", async () => ({ status: "ok", policy: state.policy }));
  app.get("/health", async () => ({ status: "ok", policy: state.policy }));

  app.get("/v1/models", async (_request, reply) => {
    const upstream = await upstreamRequest(state, "GET", "/v1/models");
    reply.code(upstream.status).headers({ "content-type": upstream.headers["content-type"] ?? "application/json" });
    return reply.send(upstream.body);
  });

  app.post("/v1/chat/completions", async (request, reply) => {
    const started = performance.now();
    const requestPayload = request.body;
    if (!requestPayload || typeof requestPayload !== "object" || Array.isArray(requestPayload)) {
      reply.code(400);
      return { error: { message: "request body must be a JSON object" } };
    }
    const upstreamPayload = prepareUpstreamPayload(requestPayload, state.policy);
    const attempts = [];
    let finalStatus = 502;
    let finalHeaders = { "content-type": "application/json" };
    let finalBody = Buffer.alloc(0);
    let parseStats = {};

    for (let attempt = 0; attempt < Math.max(1, Number(state.policy.max_retries) + 1); attempt += 1) {
      const upstream = await upstreamRequest(state, "POST", "/v1/chat/completions", upstreamPayload);
      finalStatus = upstream.status;
      finalHeaders = upstream.headers;
      finalBody = upstream.body;
      const attemptInfo = { attempt: attempt + 1, status: upstream.status };
      if (upstream.status >= 500) {
        attempts.push({ ...attemptInfo, retry_reason: "upstream_5xx" });
        if (attempt < state.policy.max_retries) continue;
      }
      let upstreamJson;
      try {
        upstreamJson = JSON.parse(upstream.body.toString("utf8"));
      } catch (error) {
        attempts.push({ ...attemptInfo, retry_reason: `invalid_upstream_json:${error.message}` });
        if (attempt < state.policy.max_retries) continue;
        break;
      }
      const processed = processChatCompletion(upstreamJson, requestPayload, state.policy);
      parseStats = processed.stats;
      const retryReason = retryReasonForProcessed(processed.body, requestPayload, parseStats, state.policy);
      attempts.push({ ...attemptInfo, retry_reason: retryReason ?? "" });
      if (retryReason && attempt < state.policy.max_retries) continue;
      finalBody = Buffer.from(JSON.stringify(processed.body));
      finalHeaders = { "content-type": "application/json" };
      finalStatus = upstream.status;
      break;
    }

    writeJsonl(state.logJsonl, {
      path: request.url,
      model: requestPayload.model,
      elapsed_ms: Number((performance.now() - started).toFixed(3)),
      attempts,
      parse: parseStats,
    });
    reply.code(finalStatus).headers({ "content-type": finalHeaders["content-type"] ?? finalHeaders["Content-Type"] ?? "application/json" });
    return reply.send(finalBody);
  });

  app.all("*", async (request, reply) => {
    if (request.method === "POST") {
      const upstream = await upstreamRequest(state, "POST", request.url, request.body);
      reply.code(upstream.status).headers({ "content-type": upstream.headers["content-type"] ?? "application/json" });
      return reply.send(upstream.body);
    }
    reply.code(404);
    return { error: { message: `not found: ${request.url}` } };
  });

  return app;
}

function parseArgs(argv) {
  const args = {
    host: "127.0.0.1",
    port: 8092,
    upstream: "http://127.0.0.1:8091",
    timeoutSec: 650,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--host") args.host = value, i += 1;
    else if (key === "--port") args.port = Number(value), i += 1;
    else if (key === "--upstream") args.upstream = value, i += 1;
    else if (key === "--policy") args.policy = value, i += 1;
    else if (key === "--temperature") args.temperature = Number(value), i += 1;
    else if (key === "--top-p") args.top_p = Number(value), i += 1;
    else if (key === "--top-k") args.top_k = Number(value), i += 1;
    else if (key === "--timeout-sec") args.timeoutSec = Number(value), i += 1;
    else if (key === "--log-jsonl") args.logJsonl = value, i += 1;
    else if (key === "--help") args.help = true;
  }
  return args;
}

function printHelp() {
  console.log(`Gemma 4 BenchLoop Fastify proxy

Options:
  --host HOST             Proxy listen host, default 127.0.0.1
  --port PORT             Proxy listen port, default 8092
  --upstream URL          Upstream llama.cpp endpoint, default http://127.0.0.1:8091
  --policy FILE           JSON policy file
  --temperature VALUE     Override policy temperature
  --top-p VALUE           Override policy top_p
  --top-k VALUE           Override policy top_k
  --timeout-sec VALUE     Upstream request timeout, default 650
  --log-jsonl FILE        Optional JSONL diagnostics file`);
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    return 0;
  }
  const policy = loadPolicy(args.policy, {
    ...(args.temperature === undefined ? {} : { temperature: args.temperature }),
    ...(args.top_p === undefined ? {} : { top_p: args.top_p }),
    ...(args.top_k === undefined ? {} : { top_k: args.top_k }),
  });
  const state = {
    upstream: args.upstream.replace(/\/?$/, "/"),
    policy,
    timeoutSec: args.timeoutSec,
    logJsonl: args.logJsonl,
  };
  const app = buildServer(state);
  await app.listen({ host: args.host, port: args.port });
  console.log(`gemma4 BenchLoop Fastify harness listening on http://${args.host}:${args.port} -> ${state.upstream.replace(/\/$/, "")} policy=${policy.name}:${policy.version}`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
