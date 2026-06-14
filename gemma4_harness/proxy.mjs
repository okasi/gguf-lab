#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { isIP } from "node:net";
import { parse as parseJavaScriptAst } from "@babel/parser";
import { parser as pythonAstParser } from "@lezer/python";
import Fastify from "fastify";

// Harness contract:
// - Accept OpenAI-style client traffic and forward it to llama.cpp.
// - Repair only transport and serialization problems that are visible in the model output.
// - Keep the user's task semantics in the prompt/model, never in this adapter.
//
// That last point is the important audit line. The proxy may turn malformed JSON into JSON
// or a declared tool-call blob into OpenAI tool_calls, but it must not infer answers,
// manufacture missing actions from prompt text, or branch on benchmark/task-suite identity.
const END_TOKENS = ["<end_of_turn>", "<eos>", "</s>", "<|eot_id|>", "<|im_end|>"];
const TOOL_BLOCK_PATTERNS = [
  /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/gi,
  /<function_call>\s*([\s\S]*?)\s*<\/function_call>/gi,
  /<tool_code>\s*([\s\S]*?)\s*<\/tool_code>/gi,
];
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_RE = /^(\d{4}-\d{2}-\d{2})[Tt](\d{2}:\d{2}:\d{2}(?:\.\d+)?)([Zz]|[+-]\d{2}:\d{2})$/;
const TIME_RE = /^(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?([Zz]|[+-]\d{2}:\d{2})?$/;
const TIMEZONE_OFFSET_RE = /^([+-])(\d{2}):(\d{2})$/;
const HOSTNAME_LABEL_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const JSON_POINTER_RE = /(^|[^~])~([^01]|$)/;
const URI_TEMPLATE_OPERATOR_RE = /^[+#./;?&]/;
const URI_TEMPLATE_PART_RE = /^[A-Za-z0-9_][A-Za-z0-9_.%-]*(?::[1-9][0-9]{0,3}|\*)?$/;
const RELATIVE_JSON_POINTER_RE = /^(0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~[01])*)*)?$/;
const BASE64_RE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const BASE64URL_RE = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2}(?:==)?|[A-Za-z0-9_-]{3}=?)?$/;
const HEX_RE = /^[0-9a-f]*$/i;
const DURATION_RE = /^P(?:\d+W|(?=\d|T\d)(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?=\d)(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?)$/;
const WHITESPACE_RE = /\s/;
const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const LEADING_TRAILING_QUOTE_RE = /^["']|["']$/g;
const FRACTION_RE = /(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)/;
const NUMBER_RE = /-?\d+(?:\.\d+)?/;
const FENCE_RE = /(?<fence>```|~~~)(?:json|jsonc|json5|python|javascript|js|typescript|ts|jsx|tsx|text)?\s*(?<body>[\s\S]*?)\k<fence>/gi;
const CODE_FENCE_RE = /(?<fence>```|~~~)(?<lang>[A-Za-z0-9_+-]*)\s*(?<code>[\s\S]*?)\k<fence>/g;
const OPENING_FENCE_RE = /(?:```|~~~)(?<lang>[A-Za-z0-9_+-]*)/g;
const JSON_FENCE_RE = /(?:```|~~~)json(?:c|5)?\b/i;
const THINK_RE = /<think>[\s\S]*?<\/think>/gi;
const FUNCTION_CALL_RE = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*?)\)/g;
const PYTHON_FENCE_LANGS = new Set(["python", "py"]);
const JAVASCRIPT_FENCE_LANGS = new Set(["javascript", "js", "jsx", "mjs", "cjs"]);
const TYPESCRIPT_FENCE_LANGS = new Set(["typescript", "ts", "tsx", "mts", "cts"]);
const CHAT_ROLES = new Set(["system", "developer", "user", "assistant"]);
const JAVASCRIPT_PARSER_PLUGINS = ["jsx", "decorators-legacy", "classProperties", "classPrivateProperties", "classPrivateMethods", "dynamicImport", "importMeta", "topLevelAwait", "optionalChaining", "nullishCoalescingOperator"];
const JSON_SCHEMA_KEYS = [
  "$ref", "$defs", "definitions", "type", "properties", "patternProperties", "items", "prefixItems",
  "additionalProperties", "unevaluatedProperties", "unevaluatedItems", "anyOf", "oneOf", "allOf",
  "not", "if", "then", "else", "const", "enum", "contains", "dependentRequired", "dependentSchemas",
  "dependencies", "propertyNames", "required", "minProperties", "maxProperties", "minItems", "maxItems",
  "uniqueItems", "minContains", "maxContains", "minLength", "maxLength", "pattern", "format", "minimum",
  "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "contentEncoding", "contentMediaType",
  "contentSchema", "nullable", "default",
];
const ARRAY_VALIDATION_KEYS = ["minItems", "maxItems", "uniqueItems", "contains", "minContains", "maxContains", "unevaluatedItems"];
const NUMBER_VALIDATION_KEYS = ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "format"];
const STRING_VALIDATION_KEYS = ["minLength", "maxLength", "pattern", "format", "contentEncoding", "contentMediaType", "contentSchema"];
const OBJECT_VALIDATION_KEYS = ["properties", "patternProperties", "propertyNames", "required", "additionalProperties", "unevaluatedProperties", "dependentRequired", "dependentSchemas", "dependencies", "minProperties", "maxProperties"];
const OBJECT_COMPOSITION_KEYS = ["type", "properties", "patternProperties", "required", "additionalProperties", "unevaluatedProperties", "propertyNames", "dependentRequired", "dependentSchemas", "dependencies", "minProperties", "maxProperties", "$defs", "definitions", "title", "description"];
const RESPONSES_PASSTHROUGH_KEYS = ["temperature", "top_p", "stream", "stop", "metadata", "user", "parallel_tool_calls", "frequency_penalty", "presence_penalty", "seed", "logprobs", "top_logprobs", "service_tier", "modalities", "audio", "prediction", "store", "truncation", "include", "background", "safety_identifier"];
const RESPONSES_REASONING_KEYS = [["effort", "reasoning_effort"], ["summary", "reasoning_summary"], ["generate_summary", "reasoning_generate_summary"]];
const COMPLETIONS_PASSTHROUGH_KEYS = ["temperature", "top_p", "stop", "user", "n", "frequency_penalty", "presence_penalty", "seed", "logprobs", "top_logprobs", "response_format"];
const RESPONSES_MAX_TOKEN_KEYS = ["max_output_tokens", "max_completion_tokens", "max_tokens"];
const COMPLETIONS_MAX_TOKEN_KEYS = ["max_tokens", "max_completion_tokens", "max_output_tokens"];
const CONTENT_TEXT_KEYS = ["text", "input_text", "output_text", "output", "content"];
const MEDIA_REF_KEYS = ["file_id", "url", "audio_url", "video_url", "data"];
const TOOL_CALL_CONTAINER_KEYS = ["tool_calls", "toolCalls", "tool_uses", "tools", "calls", "function_calls", "functionCalls"];
const RESPONSE_FUNCTION_TOOL_KEYS = ["description", "parameters", "strict"];
const JSON_CONTENT_TYPE = "application/json";
const EVENT_STREAM_CONTENT_TYPE = "text/event-stream";
const DEFAULT_POLICY_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "configs/gemma4_qat_q4_optimized_policy.json",
);

// These defaults let the module run without a config file, but benchmarked behavior should
// come from the JSON policy. Keeping behavior in data makes sampler/retry changes easy to
// diff and ties each policy change to a fresh BenchLoop run.
export const DEFAULT_POLICY = {
  name: "gemma4-q4-optimized",
  version: "harness",
  temperature: 1.0,
  top_p: 0.95,
  top_k: 64,
  enforce_sampler: true,
  strip_reasoning: true,
  strip_markdown_fences: true,
  extract_python_code: true,
  extract_javascript_code: true,
  repair_json: true,
  parse_tagged_tool_calls: true,
  parse_json_tool_calls: true,
  parse_function_syntax: true,
  parse_escaped_json: true,
  normalize_tool_args: true,
  dedupe_tool_calls: true,
  retry_empty: true,
  retry_malformed_json: true,
  retry_malformed_python: false,
  retry_malformed_javascript: false,
  retry_missing_tool_call: false,
  max_retries: 1,
  metadata: {},
};

function uuidPart(length) { return randomUUID().replaceAll("-", "").slice(0, length); }
function shortId(prefix, length = 12) { return `${prefix}_${uuidPart(length)}`; }
function longId(prefix) { return shortId(prefix, 24); }
function elapsedMs(started) { return Number((performance.now() - started).toFixed(3)); }
function nowSeconds() { return Math.floor(Date.now() / 1000); }
function responseContentType(headers, fallback = JSON_CONTENT_TYPE) { return headers?.["content-type"] ?? headers?.["Content-Type"] ?? fallback; }
function badJsonBody(reply) { reply.code(400); return { error: { message: "request body must be a JSON object" } }; }
function maxAttempts(policy) { return Math.max(1, Number(policy.max_retries) + 1); }
function canRetry(attempt, policy) { return attempt < policy.max_retries; }
function unique(values) { return [...new Set(values)]; }
function uniqueTrimmed(values) { return unique(values.map((value) => value.trim()).filter(Boolean)); }
function isArray(value) { return Array.isArray(value); }
function arrayValues(value) { return isArray(value) ? value : []; }
function firstArrayValue(value, fallback = undefined) { return arrayValues(value)[0] ?? fallback; }
function mergeUniqueArray(left, right) { return unique([...arrayValues(left), ...arrayValues(right)]); }
function mergeAllOfValue(left, right) { return left ? { allOf: [left, right] } : right; }
function hasOwn(value, key) { return Object.prototype.hasOwnProperty.call(value, key); }
function hasAnyOwn(value, keys) { return keys.some((key) => hasOwn(value, key)); }
function objectKeys(value) { return isObjectLike(value) ? Object.keys(value) : []; }
function keyCount(value) { return objectKeys(value).length; }
function objectEntries(value) { return isObjectLike(value) ? Object.entries(value) : []; }
function objectValues(value) { return isObjectLike(value) ? Object.values(value) : []; }
function entriesObject(entries) { return Object.fromEntries(entries); }
function hasKeys(value) { return keyCount(value) > 0; }
function deleteIfEmpty(object, key) { if (!hasKeys(object[key])) delete object[key]; }
function isDefined(value) { return value !== undefined; }
function isNil(value) { return value === null || value === undefined; }
function isString(value) { return typeof value === "string"; }
function isObjectLike(value) { return Boolean(value) && typeof value === "object"; }
function isNumber(value) { return typeof value === "number"; }
function isBoolean(value) { return typeof value === "boolean"; }
function isFiniteNumber(value) { return typeof value === "number" && Number.isFinite(value); }
function isQuote(value) { return value === "\"" || value === "'"; }
function isArgOpen(value) { return value === "{" || value === "[" || value === "("; }
function isArgClose(value) { return value === "}" || value === "]" || value === ")"; }
function isJsonOpen(value) { return value === "{" || value === "["; }
function isJsonClose(value) { return value === "}" || value === "]"; }
function jsonCloseFor(value) { return value === "{" ? "}" : "]"; }
function hasWhitespace(value) { return WHITESPACE_RE.test(value); }
function schemaProperties(schema) { return schema?.properties ?? {}; }
function schemaPropertySet(schema) { return new Set(objectKeys(schemaProperties(schema))); }
function startsJson(value) { return value.startsWith("{") || value.startsWith("["); }
function schemaArrayLike(schema, root = schema) { return schemaTypeIncludes(schema, "array", root) || schema?.items || isArray(schema?.prefixItems); }
function schemaObjectLike(schema, root = schema) { return schemaTypeIncludes(schema, "object", root) || schema?.properties || schema?.patternProperties; }
function schemaUnion(schema) { return isArray(schema?.anyOf) ? schema.anyOf : isArray(schema?.oneOf) ? schema.oneOf : null; }
function schemaAnyOf(schema) { return isArray(schema?.anyOf) ? schema.anyOf : null; }
function schemaOneOf(schema) { return isArray(schema?.oneOf) ? schema.oneOf : null; }
function schemaAllOf(schema) { return isArray(schema?.allOf) ? schema.allOf : null; }
function schemaEnum(schema) { return isArray(schema?.enum) ? schema.enum : null; }
function firstDefined(value, keys) {
  for (const key of keys) if (isDefined(value[key])) return value[key];
  return undefined;
}
function firstPresent(value, keys) {
  for (const key of keys) if (!isNil(value[key])) return value[key];
  return undefined;
}
function copyDefined(from, to, keys) {
  for (const key of keys) if (isDefined(from[key])) to[key] = from[key];
}
function definedField(key, value) { return isDefined(value) ? { [key]: value } : {}; }
function jsonText(value) { return JSON.stringify(value); }
function jsonBuffer(value) { return Buffer.from(jsonText(value)); }
function serializedArgs(value) { return isString(value) ? value : jsonText(value ?? {}); }
function parseJsonBuffer(buffer) { return JSON.parse(buffer.toString("utf8")); }
function attemptInfo(attempt, status) { return { attempt: attempt + 1, status }; }
function singleAttempt(status) { return [{ attempt: 1, status, retry_reason: "" }]; }
function retryableUpstream5xx(attempts, info, status) {
  if (!isServerErrorStatus(status)) return false;
  attempts.push({ ...info, retry_reason: "upstream_5xx" });
  return true;
}
function recordInvalidJsonAttempt(attempts, info, error) {
  attempts.push({ ...info, retry_reason: `invalid_upstream_json:${error.message}` });
}
function recordProcessedAttempt(attempts, info, retryReason) {
  attempts.push({ ...info, retry_reason: retryReason ?? "" });
}
function responseStreamBody(upstream, payload) {
  return isErrorStatus(upstream.status) ? upstream.body : chatCompletionStreamToResponsesSse(upstream.body, payload);
}
function isServerErrorStatus(status) { return status >= 500; }
function isErrorStatus(status) { return status >= 400; }
function isStreamingRequest(payload) { return payload.stream === true; }

export function loadPolicy(path, overrides = {}) {
  const filePolicy = path ? JSON.parse(fs.readFileSync(path, "utf8")) : {};
  return { ...DEFAULT_POLICY, ...filePolicy, ...overrides };
}

// Prepare the request for llama.cpp without changing the task. This is limited to API-shape
// mismatches such as max_completion_tokens vs max_tokens, developer role vs system role, and
// sampler overrides that are explicitly owned by the policy file.
export function prepareUpstreamPayload(payload, policy) {
  const outgoing = structuredClone(payload ?? {});
  if (!isDefined(outgoing.max_tokens) && isDefined(outgoing.max_completion_tokens)) {
    outgoing.max_tokens = outgoing.max_completion_tokens;
    delete outgoing.max_completion_tokens;
  }
  if (isArray(outgoing.messages)) outgoing.messages = normalizeChatMessagesForUpstream(outgoing.messages);
  if (isDefined(outgoing.tool_choice)) outgoing.tool_choice = responsesToolChoiceToChatToolChoice(outgoing.tool_choice);
  if (policy.enforce_sampler) {
    outgoing.temperature = Number(policy.temperature);
    outgoing.top_p = Number(policy.top_p);
    outgoing.top_k = Number(policy.top_k);
  }
  if (!isDefined(outgoing.stream)) outgoing.stream = false;
  return outgoing;
}

function normalizeChatMessagesForUpstream(messages) {
  return messages.map((message) => {
    if (!isPlainObject(message)) return message;
    if (message.role !== "developer") return message;
    return { ...message, role: "system" };
  });
}

// Main non-streaming output pass. It normalizes the assistant message in-place, attaches
// a gemma_harness audit block, and records each repair so benchmark logs can show whether
// a score came from normal model output, structural repair, or a retry.
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
  if (!isArray(result.choices)) {
    stats.error = "choices_not_list";
    return { body: result, stats };
  }
  for (const choice of result.choices) {
    if (!isPlainObject(choice) || !isPlainObject(choice.message)) continue;
    const { message, stats: messageStats } = normalizeMessage(choice.message, requestPayload, policy);
    stats.repairs.push(...messageStats.repairs);
    stats.tool_calls_before += Number(messageStats.tool_calls_before ?? 0);
    stats.tool_calls_after += Number(messageStats.tool_calls_after ?? 0);
    choice.message = message;
  }
  stats.elapsed_ms = elapsedMs(started);
  result.gemma_harness = stats;
  return { body: result, stats };
}

function normalizeMessage(message, requestPayload, policy) {
  const stats = { repairs: [] };
  const out = structuredClone(message);
  let content = normalizeContentValue(out.content);
  const rawContent = content;
  const toolMap = toolSchemaMap(requestPayload?.tools ?? []);

  // Run normalizers from most explicit to most inferred:
  // 1. already-structured tool/function calls from the upstream response,
  // 2. reasoning/end-token cleanup,
  // 3. tool calls serialized inside text,
  // 4. JSON/code extraction only when the request or content makes that format obvious.
  // This order keeps structured data authoritative and avoids letting later text cleanup
  // erase tool calls that agents depend on.
  const legacyFunctionCalls = isPlainObject(out.function_call) ? [out.function_call] : [];
  const existingCalls = normalizeToolCalls([...arrayValues(out.tool_calls), ...legacyFunctionCalls], toolMap, policy, stats);
  if (legacyFunctionCalls.length) delete out.function_call;
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

  if (policy.dedupe_tool_calls && toolCalls.length) {
    const deduped = dedupeToolCalls(toolCalls);
    if (deduped.length !== toolCalls.length) stats.repairs.push("deduped_tool_calls");
    toolCalls = deduped;
  }

  if (likelyJsonTask(requestPayload, content)) {
    const repaired = normalizeJsonResponse(content, policy, stats, { requestPayload });
    if (repaired !== null) content = repaired;
  }

  if (policy.extract_python_code) {
    const repaired = normalizePythonCodeResponse(content, stats);
    if (repaired !== null) content = repaired;
  }
  const codeLanguage = inferJavaScriptLanguageFromContent(content);
  if (policy.extract_javascript_code && codeLanguage) {
    const repaired = normalizeJavaScriptCodeResponse(content, codeLanguage, stats);
    if (repaired !== null) content = repaired;
  }

  if (toolCalls.length) content = stripToolResidue(content, toolMap).trim();

  out.content = content ?? "";
  out.tool_calls = ensureOpenAIToolCallIds(toolCalls);
  stats.tool_calls_after = out.tool_calls.length;
  if (rawContent !== out.content && !stats.repairs.includes("content_normalized")) stats.repairs.push("content_normalized");
  return { message: out, stats };
}

function normalizeContentValue(value) {
  if (isNil(value)) return "";
  if (isString(value)) return value;
  if (isArray(value)) {
    return contentPartsText(value);
  }
  return contentPartText(value) || String(value);
}

function contentPartsText(parts) { return parts.map(contentPartText).filter(Boolean).join("\n"); }

function contentPartText(value) {
  if (isNil(value)) return "";
  if (isString(value)) return value;
  if (isArray(value)) return contentPartsText(value);
  if (!isPlainObject(value)) return "";
  for (const key of CONTENT_TEXT_KEYS) {
    if (isString(value[key])) return value[key];
    if (isArray(value[key])) return contentPartsText(value[key]);
  }
  const imageUrl = imageContentUrl(value);
  if (imageUrl) return `[image: ${imageUrl}]`;
  const mediaRef = mediaContentRef(value);
  if (mediaRef) return `[${mediaRef.kind}: ${mediaRef.ref}]`;
  const fileRef = fileContentRef(value);
  if (fileRef) return `[file: ${fileRef}]`;
  if (isString(value.refusal)) return value.refusal;
  return "";
}

function imageContentUrl(value) {
  if (isString(value.image_url)) return value.image_url;
  if (isPlainObject(value.image_url) && isString(value.image_url.url)) return value.image_url.url;
  if (isString(value.url) && (value.type === "input_image" || value.type === "output_image" || value.type === "image_url")) return value.url;
  if (isString(value.file_id) && value.type === "input_image") return value.file_id;
  if (isPlainObject(value.source)) {
    if (isString(value.source.url)) return value.source.url;
    if (isString(value.source.data)) return value.source.media_type ? `${value.source.media_type};base64,${value.source.data}` : value.source.data;
  }
  return "";
}

function fileContentRef(value) {
  if (isString(value.filename) && isString(value.file_id)) return `${value.filename} (${value.file_id})`;
  if (isString(value.file_id) && (value.type === "input_file" || value.type === "file")) return value.file_id;
  if (isString(value.file_data) && (value.type === "input_file" || value.type === "file")) return value.filename ? `${value.filename} (${value.file_data})` : value.file_data;
  if (isString(value.file_url) && (value.type === "input_file" || value.type === "file")) return value.filename ? `${value.filename} (${value.file_url})` : value.file_url;
  if (isString(value.filename) && (value.type === "input_file" || value.type === "file")) return value.filename;
  return "";
}

function mediaContentRef(value) {
  const kind = value.type === "input_audio" || value.type === "audio" ? "audio" : value.type === "input_video" || value.type === "video" ? "video" : "";
  if (!kind) return null;
  for (const key of MEDIA_REF_KEYS) {
    if (isString(value[key])) return { kind, ref: value[key] };
  }
  return null;
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

function toolSchemaMap(tools) {
  const mapping = new Map();
  for (const tool of arrayValues(tools)) {
    if (!isPlainObject(tool)) continue;
    const fn = isPlainObject(tool.function) ? tool.function : tool;
    if (isString(fn.name) && fn.name) mapping.set(fn.name, fn);
  }
  return mapping;
}

function normalizeToolCalls(calls, toolMap, policy, stats) {
  const normalized = [];
  for (const call of arrayValues(calls)) {
    const item = normalizeOneToolCall(call, toolMap, policy);
    if (item) normalized.push(item);
  }
  if (normalized.length) stats.repairs.push("normalized_existing_tool_calls");
  return normalized;
}

function normalizeOneToolCall(call, toolMap, policy) {
  if (!isPlainObject(call)) return null;
  const fn = isPlainObject(call.function) ? call.function : call;
  const rawName = fn.name ?? fn.tool_name ?? fn.recipient_name ?? fn.tool ?? fn.function;
  if (!isString(rawName) || !rawName) return null;
  const name = canonicalToolName(rawName, toolMap);
  if (toolMap.size && !toolMap.has(name)) return null;
  let args = parseArgsValue(fn.arguments ?? fn.arguments_json ?? fn.args ?? fn.tool_input ?? fn.input_json ?? fn.input ?? fn.parameters ?? fn.payload ?? {});
  if (policy.normalize_tool_args) args = normalizeArgsForSchema(args, toolMap.get(name) ?? {});
  return {
    id: String(call.id ?? call.call_id ?? shortId("call")),
    type: "function",
    function: { name, arguments: jsonText(args) },
  };
}

function canonicalToolName(name, toolMap) {
  const clean = String(name).trim().replace(/^[`'"]+|[`'"]+$/g, "");
  if (toolMap.has(clean)) return clean;
  const lowered = clean.toLowerCase();
  for (const candidate of toolMap.keys()) {
    if (candidate.toLowerCase() === lowered) return candidate;
  }
  return clean;
}

function parseArgsValue(value) {
  if (isPlainObject(value)) return value;
  if (isNil(value) || !isString(value)) return {};
  const text = value.trim();
  if (!text) return {};
  const parsed = parseLooseJson(text);
  if (isPlainObject(parsed)) return parsed;
  return parseKeyValueArgs(text);
}

function parseKeyValueArgs(text) {
  const args = {};
  for (const part of splitTopLevelArgs(text)) {
    const index = topLevelAssignmentIndex(part);
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (!IDENTIFIER_RE.test(key)) continue;
    args[key] = parseKeyValueArgValue(part.slice(index + 1));
  }
  return args;
}

function splitTopLevelArgs(text) {
  const parts = [];
  let start = 0;
  let depth = 0;
  let inString = false;
  let escape = false;
  let quote = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === quote) inString = false;
      continue;
    }
    if (isQuote(char)) {
      inString = true;
      quote = char;
      continue;
    }
    if (isArgOpen(char)) depth += 1;
    else if (isArgClose(char) && depth > 0) depth -= 1;
    else if (char === "," && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
}

function topLevelAssignmentIndex(text) {
  let depth = 0;
  let inString = false;
  let escape = false;
  let quote = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === quote) inString = false;
      continue;
    }
    if (isQuote(char)) {
      inString = true;
      quote = char;
      continue;
    }
    if (isArgOpen(char)) depth += 1;
    else if (isArgClose(char) && depth > 0) depth -= 1;
    else if ((char === "=" || char === ":") && depth === 0) return i;
  }
  return -1;
}

function parseKeyValueArgValue(value) {
  const trimmed = value.trim();
  const parsed = parseLooseJson(trimmed);
  if (parsed !== null) return parsed;
  return coerceScalar(trimmed.replace(LEADING_TRAILING_QUOTE_RE, ""));
}

function resolveJsonSchema(schema, root = schema, seen = new Set()) {
  if (!isPlainObject(schema) || !isString(schema.$ref)) return schema;
  const ref = schema.$ref;
  if (!ref.startsWith("#") || seen.has(ref)) return schema;
  const target = resolveJsonPointer(root, ref);
  if (!isPlainObject(target)) return schema;
  const nextSeen = new Set(seen);
  nextSeen.add(ref);
  const resolved = resolveJsonSchema(target, root, nextSeen);
  const siblings = { ...schema };
  delete siblings.$ref;
  return hasKeys(siblings) ? { ...resolved, ...siblings } : resolved;
}

function resolveJsonPointer(root, pointer) {
  if (pointer === "#") return root;
  if (pointer.startsWith("#") && !pointer.startsWith("#/")) return findJsonSchemaAnchor(root, decodeURIComponent(pointer.slice(1)));
  if (!pointer.startsWith("#/")) return null;
  let current = root;
  for (const rawToken of pointer.slice(2).split("/")) {
    const token = decodeURIComponent(rawToken).replace(/~1/g, "/").replace(/~0/g, "~");
    if (!isObjectLike(current) || !(token in current)) return null;
    current = current[token];
  }
  return current;
}

function findJsonSchemaAnchor(value, anchor, seen = new Set()) {
  if (!anchor || !isObjectLike(value) || seen.has(value)) return null;
  seen.add(value);
  if (!isArray(value)) {
    if (value.$anchor === anchor) return value;
    if (isString(value.$id) && value.$id.split("#").at(-1) === anchor) return value;
  }
  for (const child of objectValues(value)) {
    const found = findJsonSchemaAnchor(child, anchor, seen);
    if (found) return found;
  }
  return null;
}

function objectAllowsProperty(schema, key, allowed = schemaPropertySet(schema), root = schema) {
  if (!propertyNameAllowed(schema, key, root)) return false;
  const properties = schemaProperties(schema);
  if (hasOwn(properties, key) && properties[key] === false) return false;
  const patternSchemas = matchingPatternPropertySchemas(schema, key);
  if (patternSchemas.some((prop) => prop === false)) return false;
  if (allowed.has(key)) return true;
  if (patternSchemas.length) return true;
  return schema?.additionalProperties !== false && schema?.unevaluatedProperties !== false;
}

function objectPropertySchema(schema, key) {
  const schemas = objectPropertySchemas(schema, key);
  if (!schemas.length) return {};
  return schemas.length === 1 ? schemas[0] : { allOf: schemas };
}

function objectPropertySchemas(schema, key) {
  const schemas = [];
  const properties = schemaProperties(schema);
  if (hasOwn(properties, key)) schemas.push(properties[key]);
  schemas.push(...matchingPatternPropertySchemas(schema, key));
  if (!schemas.length) {
    const additional = schema?.additionalProperties;
    if (isPlainObject(additional)) schemas.push(additional);
    else if (additional !== true) {
      const unevaluated = schema?.unevaluatedProperties;
      if (isPlainObject(unevaluated)) schemas.push(unevaluated);
    }
  }
  return schemas;
}

function matchingPatternPropertySchemas(schema, key) {
  const patterns = schema?.patternProperties;
  if (!isPlainObject(patterns)) return [];
  const schemas = [];
  for (const [pattern, prop] of objectEntries(patterns)) {
    try {
      if (new RegExp(pattern).test(key)) schemas.push(prop);
    } catch {}
  }
  return schemas;
}

function propertyNameAllowed(schema, key, root = schema) {
  if (!schema || !hasOwn(schema, "propertyNames")) return true;
  return schemaValueMatches(key, schema.propertyNames, root);
}

function normalizeArgsForSchema(args, schema) {
  const params = schema?.parameters ?? schema?.input_schema ?? {};
  const normalized = coerceJsonForSchema(args ?? {}, params, params);
  return isPlainObject(normalized) ? normalized : {};
}

function coerceForJsonSchema(value, prop, root = prop) {
  prop = resolveJsonSchema(prop, root);
  const allOf = schemaAllOf(prop);
  if (isPlainObject(prop) && allOf) {
    return allOf.reduce((current, option) => coerceForJsonSchema(current, option, root), value);
  }
  const conditional = conditionalBranchForValue(prop, value, root);
  if (conditional !== null) {
    const coerced = coerceForJsonSchema(value, conditional, root);
    const branchValue = schemaValueMatches(coerced, conditional, root) ? coerced : value;
    const base = schemaWithoutConditionals(prop, root);
    return base ? coerceForJsonSchema(branchValue, base, root) : branchValue;
  }
  const union = isPlainObject(prop) && schemaUnion(prop);
  const isOneOf = isPlainObject(prop) && union === schemaOneOf(prop);
  if (union) {
    const discriminatorOption = discriminatorOptionForValue(prop, value, union, root);
    if (discriminatorOption) {
      const matched = coerceUnionOptionForSchema(value, discriminatorOption, prop, root, coerceForJsonSchema);
      if (matched.ok) return matched.value;
    }
    const oneOfMatches = [];
    for (const option of union) {
      const matched = coerceUnionOptionForSchema(value, option, prop, root, coerceForJsonSchema);
      if (!matched.ok) continue;
      if (!isOneOf) return matched.value;
      oneOfMatches.push(matched.value);
    }
    const exactMatches = oneOfMatches.filter((coerced) => countMatchingSchemasAfterCoercion(value, coerced, union, root) === 1);
    if (exactMatches.length) return exactMatches[0];
  }
  if (isPlainObject(prop) && "const" in prop) {
    const constValue = coerceConstForJsonSchema(value, prop.const);
    if (isDefined(constValue) && schemaValueMatches(constValue, prop, root)) return constValue;
  }
  const enumValue = coerceEnumForJsonSchema(value, prop);
  if (isDefined(enumValue) && schemaValueMatches(enumValue, prop, root)) return enumValue;
  if (schemaTypeIncludes(prop, "null", root) && isString(value) && nullishFromText(value)) return null;
  if (schemaTypeIncludes(prop, "integer", root)) {
    const number = firstNumber(value);
    if (!isFiniteNumber(number) || !Number.isInteger(number)) return value;
    return schemaValueMatches(number, prop, root) ? number : value;
  }
  if (schemaTypeIncludes(prop, "number", root)) {
    const number = firstNumber(value);
    if (!isFiniteNumber(number)) return value;
    return schemaValueMatches(number, prop, root) ? number : value;
  }
  if (schemaTypeIncludes(prop, "boolean", root) && isString(value)) {
    const bool = booleanFromText(value);
    return bool !== null && schemaValueMatches(bool, prop, root) ? bool : value;
  }
  if (schemaArrayLike(prop, root)) return coerceArrayForJsonSchema(value, prop, root);
  if (schemaTypeIncludes(prop, "string", root) && !isNil(value)) {
    const text = String(value);
    return schemaValueMatches(text, prop, root) ? text : value;
  }
  return value;
}

function coerceArrayForJsonSchema(value, prop, root = prop) {
  prop = resolveJsonSchema(prop, root);
  const parsed = isString(value) && schemaTypeIncludes(prop, "array", root) ? parseLooseJson(value) : null;
  const array = isArray(value)
    ? value
    : isArray(parsed)
      ? parsed
    : schemaTypeIncludes(prop, "array", root) && isString(value)
      ? value.split(/[,\n;]/).map((part) => part.trim()).filter(Boolean)
    : schemaTypeIncludes(prop, "array", root) && !isNil(value)
        ? [value]
        : null;
  if (!array) return value;
  const coerced = array.map((item, index) => coerceJsonArrayItemForSchema(item, prop, index, root));
  return schemaValueMatches(coerced, prop, root) ? coerced : value;
}

function arrayItemSchema(prop, index, root = prop) {
  prop = resolveJsonSchema(prop, root);
  if (isPlainObject(prop) && isArray(prop.prefixItems) && prop.prefixItems[index]) return prop.prefixItems[index];
  if (isPlainObject(prop) && isArray(prop.items) && prop.items[index]) return prop.items[index];
  if (isPlainObject(prop) && isArray(prop.items)) return prop.additionalItems ?? {};
  if (isPlainObject(prop) && prop.items === undefined && prop.unevaluatedItems !== undefined) return prop.unevaluatedItems;
  return prop?.items ?? {};
}

function containsItemSchema(prop) {
  prop = resolveJsonSchema(prop, prop);
  const contains = prop?.contains;
  return isPlainObject(contains) ? contains : null;
}

function isEmptyJsonSchema(schema) {
  return !schema || (isPlainObject(schema) && !hasKeys(schema));
}

function coerceConstForJsonSchema(value, expected) {
  if (Object.is(value, expected)) return value;
  if ((isPlainObject(expected) || isArray(expected)) && isString(value)) {
    const parsed = parseLooseJson(value);
    if (jsonValuesEqual(parsed, expected)) return expected;
  }
  if (isString(expected) && isString(value) && value.trim().toLowerCase() === expected.toLowerCase()) return expected;
  if (isNumber(expected)) {
    const number = firstNumber(value);
    if (isFiniteNumber(number) && Object.is(number, expected)) return expected;
  }
  if (isBoolean(expected) && isString(value)) {
    const bool = booleanFromText(value);
    if (bool === expected) return expected;
  }
  if (expected === null && isString(value) && nullishFromText(value)) return null;
  return undefined;
}

function coerceEnumForJsonSchema(value, prop) {
  const values = schemaEnum(prop);
  if (!isPlainObject(prop) || !values) return undefined;
  if (values.some((item) => jsonValuesEqual(item, value))) return value;
  for (const item of values) {
    const coerced = coerceConstForJsonSchema(value, item);
    if (isDefined(coerced)) return coerced;
  }
  if (!isString(value)) return undefined;
  const clean = value.trim().toLowerCase();
  const match = values.find((item) => isString(item) && item.toLowerCase() === clean);
  return isDefined(match) ? match : undefined;
}

function schemaTypeIncludes(prop, type, root = prop) {
  prop = resolveJsonSchema(prop, root);
  if (!isPlainObject(prop)) return false;
  if (type === "null" && prop.nullable === true) return true;
  return isArray(prop.type) ? prop.type.includes(type) : prop.type === type;
}

function parseToolCallsFromContent(content, toolMap, policy, stats) {
  const calls = [];
  let stripped = content;
  if (!toolMap.size) return { calls, content: stripped };

  // Text-to-tool parsing is allowed only when the model names a tool that the client
  // actually declared. The adapter may recover the wire format, but the model is still
  // responsible for choosing whether a tool should be called and with what arguments.
  if (policy.parse_tagged_tool_calls) {
    for (const pattern of TOOL_BLOCK_PATTERNS) {
      pattern.lastIndex = 0;
      for (const match of stripped.matchAll(pattern)) {
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
    for (const match of stripped.matchAll(FUNCTION_CALL_RE)) {
      const name = canonicalToolName(match[1], toolMap);
      // Plain "foo(...)" text is ambiguous in normal prose, so only exact declared tools
      // are accepted. This prevents accidental conversion of examples or explanations.
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
  if (isArray(obj)) {
    for (const item of obj) calls.push(...toolCallsFromObject(item, toolMap, policy));
    return calls;
  }
  if (!isPlainObject(obj)) return calls;
  for (const key of TOOL_CALL_CONTAINER_KEYS) {
    if (isArray(obj[key])) {
      for (const item of arrayValues(obj[key])) calls.push(...toolCallsFromObject(item, toolMap, policy));
      return calls;
    }
    if (isPlainObject(obj[key])) {
      calls.push(...toolCallsFromObject(obj[key], toolMap, policy));
      return calls;
    }
  }
  if (isPlainObject(obj.tool_call)) return toolCallsFromObject(obj.tool_call, toolMap, policy);
  if (isPlainObject(obj.tool_use)) return toolCallsFromObject(obj.tool_use, toolMap, policy);
  if (isPlainObject(obj.function_call)) return toolCallsFromObject(obj.function_call, toolMap, policy);
  const fn = isPlainObject(obj.function) ? obj.function : obj;
  const rawName = fn.name ?? fn.tool_name ?? fn.recipient_name ?? fn.tool ?? fn.function;
  if (!isString(rawName) || !rawName) return calls;
  const name = canonicalToolName(rawName, toolMap);
  if (!toolMap.has(name)) return calls;
  let args = parseArgsValue(fn.arguments ?? fn.arguments_json ?? fn.args ?? fn.tool_input ?? fn.input_json ?? fn.input ?? fn.parameters ?? fn.payload ?? {});
  if (policy.normalize_tool_args) args = normalizeArgsForSchema(args, toolMap.get(name));
  calls.push(toolCall(name, args, obj.id ?? obj.call_id));
  return calls;
}

function toolCall(name, args, id = null) {
  return {
    id: id ? String(id) : shortId("call"),
    type: "function",
    function: { name, arguments: jsonText(args ?? {}) },
  };
}

function jsonCandidates(text, includeEscaped = true) {
  const candidates = [];
  const clean = stripEndTokens(text);
  if (clean) candidates.push(clean);
  // Collect possible JSON views of the same model output. Later parsing decides whether
  // any candidate is valid; this helper only exposes common wrappers and balanced blocks.
  FENCE_RE.lastIndex = 0;
  for (const match of text.matchAll(FENCE_RE)) candidates.push(fenceBody(match).trim());
  candidates.push(...extractBalancedJsonBlocks(text));
  if (includeEscaped) {
    const unescaped = unescapePossibleJson(text);
    if (unescaped !== text) {
      candidates.push(unescaped);
      candidates.push(...extractBalancedJsonBlocks(unescaped));
    }
  }
  return uniqueTrimmed(candidates);
}

function extractBalancedJsonBlocks(text) {
  const blocks = [];
  for (let i = 0; i < text.length; i += 1) {
    if (isJsonOpen(text[i])) {
      const block = balancedJsonFrom(text, i);
      if (block) blocks.push(block);
    }
  }
  return blocks;
}

function balancedJsonFrom(text, start) {
  const stack = [jsonCloseFor(text[start])];
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
    if (isQuote(char)) {
      inString = true;
      quote = char;
      continue;
    }
    if (isJsonOpen(char)) stack.push(jsonCloseFor(char));
    else if (isJsonClose(char)) {
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
      if (isString(parsed)) {
        const nested = parseLooseJson(parsed);
        return nested === null ? parsed : nested;
      }
      return parsed;
    } catch {}
    try {
      const objectish = quoteBareJsonKeys(candidate)
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

function quoteBareJsonKeys(text) {
  let out = "";
  let inString = false;
  let escape = false;
  let quote = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      out += char;
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === quote) inString = false;
      continue;
    }
    if (isQuote(char)) {
      inString = true;
      quote = char;
      out += char;
      continue;
    }
    if (char === "{" || char === ",") {
      out += char;
      let j = i + 1;
      while (/\s/.test(text[j] ?? "")) {
        out += text[j];
        j += 1;
      }
      if (/[A-Za-z_$]/.test(text[j] ?? "")) {
        let k = j + 1;
        while (/[A-Za-z0-9_$]/.test(text[k] ?? "")) k += 1;
        let after = k;
        while (/\s/.test(text[after] ?? "")) after += 1;
        if (text[after] === ":") {
          out += `"${text.slice(j, k)}"`;
          i = k - 1;
          continue;
        }
      }
      i = j - 1;
      continue;
    }
    out += char;
  }
  return out;
}

function repairJsonCandidates(text) {
  const clean = stripEndTokens(String(text ?? "")).trim();
  if (!clean) return [];
  const candidates = [clean];
  // Generate structural JSON repair candidates for common model formatting slips:
  // fences, escaped JSON, trailing commas/comments, smart quotes, and missing closers.
  // The candidate list deliberately contains only transformed versions of the output,
  // never values supplied by prompts, tests, benchmarks, or client-specific knowledge.
  FENCE_RE.lastIndex = 0;
  if (clean.startsWith("```") || clean.startsWith("~~~")) {
    for (const match of clean.matchAll(FENCE_RE)) candidates.push(fenceBody(match).trim());
  }
  candidates.push(unescapePossibleJson(clean));
  if (/;\s*$/.test(clean)) candidates.push(clean.replace(/;\s*$/, ""));
  let repaired = clean
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
  candidates.push(repaired);
  const balanced = balanceJsonDelimiters(repaired);
  if (balanced && balanced !== repaired) candidates.push(balanced);
  const commentless = stripJsonComments(repaired);
  if (commentless !== repaired) {
    candidates.push(commentless);
    const commentlessNoTrailing = commentless.replace(/,\s*([}\]])/g, "$1");
    candidates.push(commentlessNoTrailing);
    const commentlessBalanced = balanceJsonDelimiters(commentlessNoTrailing);
    if (commentlessBalanced && commentlessBalanced !== commentlessNoTrailing) candidates.push(commentlessBalanced);
  }
  if ((repaired.match(/{/g) ?? []).length > (repaired.match(/}/g) ?? []).length) {
    repaired += "}".repeat((repaired.match(/{/g) ?? []).length - (repaired.match(/}/g) ?? []).length);
    candidates.push(repaired);
  }
  return unique(candidates.filter(Boolean));
}

function fenceBody(match) {
  return match.groups?.body ?? match[1] ?? "";
}

function balanceJsonDelimiters(text) {
  let out = "";
  const stack = [];
  let inString = false;
  let escape = false;
  let quote = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      out += char;
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === quote) inString = false;
      continue;
    }
    if (isQuote(char)) {
      inString = true;
      quote = char;
      out += char;
      continue;
    }
    if (isJsonOpen(char)) {
      stack.push(jsonCloseFor(char));
      out += char;
      continue;
    }
    if (isJsonClose(char)) {
      if (stack.at(-1) === char) {
        stack.pop();
        out += char;
        continue;
      }
      if (!stack.includes(char)) return null;
      while (stack.length && stack.at(-1) !== char) out += stack.pop();
      stack.pop();
      out += char;
      continue;
    }
    out += char;
  }
  if (inString) return null;
  while (stack.length) out += stack.pop();
  return out;
}

function stripJsonComments(text) {
  let out = "";
  let inString = false;
  let escape = false;
  let quote = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (inString) {
      out += char;
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === quote) inString = false;
      continue;
    }
    if (isQuote(char)) {
      inString = true;
      quote = char;
      out += char;
      continue;
    }
    if (char === "/" && next === "/") {
      while (i < text.length && text[i] !== "\n") i += 1;
      if (i < text.length) out += "\n";
      continue;
    }
    if (char === "/" && next === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i += 1;
      i += 1;
      continue;
    }
    out += char;
  }
  return out;
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

function likelyJsonTask(requestPayload, content) {
  if (explicitNonJsonFormatRequest(requestPayload)) return false;
  if (jsonFormatRequest(requestPayload)) return true;
  const stripped = content.trimStart();
  return startsJson(stripped) || JSON_FENCE_RE.test(stripped) || JSON_FENCE_RE.test(content);
}

function jsonFormatRequest(payload) {
  return formatMentionsJson(payload?.response_format) || formatMentionsJson(payload?.text?.format);
}

function formatMentionsJson(format) {
  if (!isPlainObject(format)) return false;
  return format.type === "json_object"
    || format.type === "json_schema"
    || hasOwn(format, "json_schema")
    || hasOwn(format, "schema");
}

function explicitNonJsonFormatRequest(payload) {
  const format = payload?.response_format ?? payload?.text?.format;
  return isPlainObject(format) && isString(format.type) && !formatMentionsJson(format);
}

function normalizeJsonResponse(content, policy, stats, context = {}) {
  if (!policy.repair_json) return null;
  for (const candidate of jsonCandidates(content, policy.parse_escaped_json)) {
    let parsed = parseLooseJson(candidate);
    const schema = jsonResponseSchema(context?.requestPayload);
    if (isObjectLike(parsed) || (schema && parsed !== null)) {
      if (schema) parsed = coerceJsonForSchema(parsed, schema);
      stats.repairs.push("repaired_json_content");
      return jsonText(parsed);
    }
  }
  return null;
}

function jsonResponseSchema(payload) {
  const format = payload?.response_format ?? payload?.text?.format;
  if (!isPlainObject(format)) return null;
  if (format.type !== "json_schema") return null;
  if (isPlainObject(format.json_schema)) {
    if (isPlainObject(format.json_schema.schema)) return format.json_schema.schema;
    if (isJsonSchemaObject(format.json_schema)) return format.json_schema;
  }
  if (isPlainObject(format.schema)) return format.schema;
  return null;
}

function isJsonSchemaObject(value) {
  if (!isPlainObject(value)) return false;
  return hasAnyOwn(value, JSON_SCHEMA_KEYS);
}

function coerceJsonForSchema(value, schema, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!isObjectLike(schema)) return value;
  const allOf = schemaAllOf(schema);
  if (allOf) {
    const merged = mergeAllOfObjectSchema(schema, root);
    if (merged && (isPlainObject(value) || isString(value))) return coerceJsonForSchema(value, merged, root);
    return allOf.reduce((current, option) => coerceJsonForSchema(current, option, root), value);
  }
  const union = schemaUnion(schema);
  const isOneOf = union === schemaOneOf(schema);
  if (union) {
    // For anyOf/oneOf, prefer discriminator-guided branches and otherwise keep the
    // original value unless a single branch can be validated after coercion. Guessing the
    // wrong branch is worse than returning slightly messy JSON.
    const discriminatorOption = discriminatorOptionForValue(schema, value, union, root);
    if (discriminatorOption) {
      const matched = coerceUnionOptionForSchema(value, discriminatorOption, schema, root, coerceJsonForSchema);
      if (matched.ok) return matched.value;
    }
    const oneOfMatches = [];
    for (const option of union) {
      const matched = coerceUnionOptionForSchema(value, option, schema, root, coerceJsonForSchema);
      if (!matched.ok) continue;
      if (!isOneOf) return matched.value;
      oneOfMatches.push(matched.value);
    }
    const exactMatches = oneOfMatches.filter((coerced) => countMatchingSchemasAfterCoercion(value, coerced, union, root) === 1);
    if (exactMatches.length) return exactMatches[0];
    return value;
  }
  const conditional = conditionalBranchForValue(schema, value, root);
  if (conditional !== null) {
    const withConditional = coerceJsonForSchema(value, conditional, root);
    if (schemaValueMatches(withConditional, conditional, root)) value = withConditional;
    const base = schemaWithoutConditionals(schema, root);
    return base ? coerceJsonForSchema(value, base, root) : value;
  }
  if (schemaObjectLike(schema, root)) {
    if (isString(value)) {
      const parsed = parseLooseJson(value);
      if (isPlainObject(parsed)) value = parsed;
    }
    if (!isPlainObject(value)) return value;
    // Schema coercion is intentionally schema-local. We drop keys the schema disallows,
    // recurse through declared properties, and materialize explicit defaults. Prompt text
    // and benchmark knowledge never participate in choosing or inventing values.
    const properties = schemaProperties(schema);
    const allowed = schemaPropertySet(schema);
    const entries = objectEntries(value).filter(([key]) => objectAllowsProperty(schema, key, allowed, root));
    let normalized = entriesObject(
      entries.map(([key, item]) => [key, coerceJsonForSchema(item, objectPropertySchema(schema, key), root)]),
    );
    for (const [key, prop] of objectEntries(properties)) {
      const resolvedProp = resolveJsonSchema(prop, root);
      if (!(key in normalized) && isObjectLike(resolvedProp) && "default" in resolvedProp) {
        normalized[key] = coerceJsonForSchema(resolvedProp.default, resolvedProp, root);
      }
    }
    for (const [key, dependent] of objectEntries(schema.dependentSchemas ?? {})) {
      if (key in normalized && isPlainObject(dependent)) {
        const withDependent = coerceJsonForSchema(normalized, dependent, root);
        if (isPlainObject(withDependent)) normalized = withDependent;
      }
    }
    for (const [key, dependent] of objectEntries(schema.dependencies ?? {})) {
      if (key in normalized && isPlainObject(dependent)) {
        const withDependent = coerceJsonForSchema(normalized, dependent, root);
        if (isPlainObject(withDependent)) normalized = withDependent;
      }
    }
    return normalized;
  }
  if (schemaArrayLike(schema, root)) {
    if (isArray(value)) {
      const coerced = value.map((item, index) => coerceJsonArrayItemForSchema(item, schema, index, root));
      return schemaValueMatches(coerced, schema, root) ? coerced : value;
    }
    if (schemaTypeIncludes(schema, "array", root)) {
      const coerced = coerceForJsonSchema(value, schema, root);
      if (isArray(coerced)) return coerced.map((item, index) => coerceJsonArrayItemForSchema(item, schema, index, root));
    }
    return value;
  }
  return coerceForJsonSchema(value, schema, root);
}

function coerceJsonArrayItemForSchema(item, schema, index, root = schema) {
  const itemSchema = arrayItemSchema(schema, index, root);
  if (isEmptyJsonSchema(itemSchema)) {
    const contains = containsItemSchema(schema);
    if (contains) {
      const coerced = coerceJsonForSchema(item, contains, root);
      if (schemaValueMatches(coerced, contains, root)) return coerced;
    }
  }
  return coerceJsonForSchema(item, itemSchema, root);
}

function schemaValueMatches(value, schema, root = schema) {
  if (schema === true) return true;
  if (schema === false) return false;
  schema = resolveJsonSchema(schema, root);
  if (schema === true) return true;
  if (schema === false) return false;
  if (!isObjectLike(schema)) return true;
  if (schema.not && schemaValueMatches(value, schema.not, root)) return false;
  const allOf = schemaAllOf(schema);
  if (allOf) {
    const merged = mergeAllOfObjectSchema(schema, root);
    if (merged && isPlainObject(value)) return schemaValueMatches(value, merged, root);
    return allOf.every((option) => schemaValueMatches(value, option, root));
  }
  const anyOf = schemaAnyOf(schema);
  if (anyOf) {
    const option = discriminatorOptionForValue(schema, value, anyOf, root);
    const unionMatches = option ? schemaValueMatches(value, option, root) : anyOf.some((candidate) => schemaValueMatches(value, candidate, root));
    if (!unionMatches) return false;
    const base = schemaWithoutUnion(schema, root);
    return base ? schemaValueMatches(value, base, root) : true;
  }
  const oneOf = schemaOneOf(schema);
  if (oneOf) {
    const option = discriminatorOptionForValue(schema, value, oneOf, root);
    const unionMatches = option ? schemaValueMatches(value, option, root) : countMatchingSchemas(value, oneOf, root) === 1;
    if (!unionMatches) return false;
    const base = schemaWithoutUnion(schema, root);
    return base ? schemaValueMatches(value, base, root) : true;
  }
  const conditional = conditionalBranchForValue(schema, value, root);
  if (conditional !== null && !schemaValueMatches(value, conditional, root)) return false;
  if ("const" in schema && !jsonValuesEqual(value, schema.const)) return false;
  const enumValues = schemaEnum(schema);
  if (enumValues && !enumValues.some((item) => jsonValuesEqual(item, value))) return false;
  if (schemaTypeIncludes(schema, "null", root) && value === null) return true;
  if (isArray(value) && hasArrayValidationKeywords(schema) && schemaValidationAppliesToKind(schema, "array", root)) return arraySchemaMatches(value, schema, root);
  if (isPlainObject(value) && hasObjectValidationKeywords(schema) && schemaValidationAppliesToKind(schema, "object", root)) return objectSchemaMatches(value, schema, root);
  if (isFiniteNumber(value) && hasNumberValidationKeywords(schema) && schemaValidationAppliesToKind(schema, "number", root)) return numberSchemaMatches(value, schema);
  if (isString(value) && hasStringValidationKeywords(schema) && schemaValidationAppliesToKind(schema, "string", root)) return stringSchemaMatches(value, schema);
  if (schemaArrayLike(schema, root) && isArray(value)) return arraySchemaMatches(value, schema, root);
  if (schemaObjectLike(schema, root) && isPlainObject(value)) return objectSchemaMatches(value, schema, root);
  if (schemaTypeIncludes(schema, "integer", root) && Number.isInteger(value)) return numberSchemaMatches(value, schema);
  if (schemaTypeIncludes(schema, "number", root) && isFiniteNumber(value)) return numberSchemaMatches(value, schema);
  if (schemaTypeIncludes(schema, "boolean", root) && isBoolean(value)) return true;
  if (schemaTypeIncludes(schema, "string", root) && isString(value)) return stringSchemaMatches(value, schema);
  return !schema.type;
}

function hasArrayValidationKeywords(schema) {
  return hasAnyOwn(schema, ARRAY_VALIDATION_KEYS);
}

function hasObjectValidationKeywords(schema) {
  return hasAnyOwn(schema, OBJECT_VALIDATION_KEYS);
}

function hasNumberValidationKeywords(schema) {
  return hasAnyOwn(schema, NUMBER_VALIDATION_KEYS);
}

function hasStringValidationKeywords(schema) {
  return hasAnyOwn(schema, STRING_VALIDATION_KEYS);
}

function schemaValidationAppliesToKind(schema, kind, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!isObjectLike(schema) || schema.type === undefined) return true;
  if (kind === "number") return schemaTypeIncludes(schema, "number", root) || schemaTypeIncludes(schema, "integer", root);
  return schemaTypeIncludes(schema, kind, root);
}

function conditionalBranchForValue(schema, value, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!isPlainObject(schema) || !hasOwn(schema, "if")) return null;
  const branch = schemaValueMatches(value, schema.if, root) ? schema.then : schema.else;
  if (branch === true || branch === false) return branch;
  return isPlainObject(branch) ? branch : null;
}

function schemaWithoutConditionals(schema, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!isPlainObject(schema)) return null;
  const base = { ...schema };
  delete base.if;
  delete base.then;
  delete base.else;
  return hasKeys(base) ? base : null;
}

function schemaWithoutUnion(schema, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!isPlainObject(schema)) return null;
  const base = { ...schema };
  delete base.anyOf;
  delete base.oneOf;
  delete base.discriminator;
  return hasKeys(base) ? base : null;
}

function coerceUnionOptionForSchema(value, option, schema, root, coerceFn) {
  let coerced = coerceFn(value, option, root);
  if (!schemaValueMatchesAfterCoercion(value, coerced, option, root)) return { ok: false, value };
  const base = schemaWithoutUnion(schema, root);
  if (base) coerced = coerceFn(coerced, base, root);
  return schemaValueMatchesAfterCoercion(value, coerced, schema, root)
    ? { ok: true, value: coerced }
    : { ok: false, value };
}

function schemaValueMatchesAfterCoercion(original, coerced, schema, root = schema) {
  if (schema === true) return true;
  if (schema === false) return false;
  schema = resolveJsonSchema(schema, root);
  if (schema === true) return true;
  if (schema === false) return false;
  if (!isObjectLike(schema)) return true;
  if (schema.not && schemaValueMatchesAfterCoercion(original, coerced, schema.not, root)) return false;
  const allOf = schemaAllOf(schema);
  if (allOf) return allOf.every((option) => schemaValueMatchesAfterCoercion(original, coerced, option, root));
  const anyOf = schemaAnyOf(schema);
  if (anyOf) {
    const option = discriminatorOptionForValue(schema, original, anyOf, root);
    const unionMatches = option ? schemaValueMatchesAfterCoercion(original, coerced, option, root) : anyOf.some((candidate) => schemaValueMatchesAfterCoercion(original, coerced, candidate, root));
    if (!unionMatches) return false;
    const base = schemaWithoutUnion(schema, root);
    return base ? schemaValueMatchesAfterCoercion(original, coerced, base, root) : true;
  }
  const oneOf = schemaOneOf(schema);
  if (oneOf) {
    const option = discriminatorOptionForValue(schema, original, oneOf, root);
    const unionMatches = option ? schemaValueMatchesAfterCoercion(original, coerced, option, root) : countMatchingSchemasAfterCoercion(original, coerced, oneOf, root) === 1;
    if (!unionMatches) return false;
    const base = schemaWithoutUnion(schema, root);
    return base ? schemaValueMatchesAfterCoercion(original, coerced, base, root) : true;
  }
  const conditional = conditionalBranchForValue(schema, original, root);
  if (conditional !== null) {
    if (!schemaValueMatchesAfterCoercion(original, coerced, conditional, root)) return false;
    const base = schemaWithoutConditionals(schema, root);
    return base ? schemaValueMatchesAfterCoercion(original, coerced, base, root) : true;
  }
  if (schemaArrayLike(schema, root) && isArray(coerced)) {
    return arraySchemaMatchesAfterCoercion(original, coerced, schema, root);
  }
  if (schemaObjectLike(schema, root) && isPlainObject(coerced)) {
    return objectSchemaMatchesAfterCoercion(original, coerced, schema, root);
  }
  return schemaValueMatches(coerced, schema, root);
}

function countMatchingSchemas(value, schemas, root = schemas) {
  return schemas.filter((option) => schemaValueMatches(value, option, root)).length;
}

function countMatchingSchemasAfterCoercion(original, coerced, schemas, root = schemas) {
  return schemas.filter((option) => schemaValueMatchesAfterCoercion(original, coerced, option, root)).length;
}

function objectSchemaMatchesAfterCoercion(original, value, schema, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!isPlainObject(value)) return false;
  if (!propertyCountMatches(value, schema)) return false;
  if (!requiredPropertiesMatch(value, schema)) return false;
  const originalObject = isPlainObject(original) ? original : {};
  const allowed = schemaPropertySet(schema);
  for (const [key, item] of objectEntries(value)) {
    if (!objectAllowsProperty(schema, key, allowed, root)) return false;
    const originalItem = hasOwn(originalObject, key) ? originalObject[key] : item;
    for (const propSchema of objectPropertySchemas(schema, key)) {
      if (!schemaValueMatchesAfterCoercion(originalItem, item, propSchema, root)) return false;
    }
  }
  if (!dependentRequiredMatches(value, schema)) return false;
  if (!dependentSchemasMatch(value, schema, (dependent) => schemaValueMatchesAfterCoercion(original, value, dependent, root))) return false;
  if (!dependenciesMatch(value, schema, (dependent) => schemaValueMatchesAfterCoercion(original, value, dependent, root))) return false;
  return true;
}

function dependentRequiredMatches(value, schema) {
  for (const [key, requiredKeys] of objectEntries(schema.dependentRequired ?? {})) {
    if (key in value && arrayValues(requiredKeys).some((requiredKey) => !(requiredKey in value))) return false;
  }
  return true;
}

function requiredPropertiesMatch(value, schema) {
  return arrayValues(schema.required).every((key) => key in value);
}

function propertyCountMatches(value, schema) {
  const count = keyCount(value);
  if (isNumber(schema.minProperties) && count < schema.minProperties) return false;
  if (isNumber(schema.maxProperties) && count > schema.maxProperties) return false;
  return true;
}

function dependentSchemasMatch(value, schema, matches) {
  for (const [key, dependent] of objectEntries(schema.dependentSchemas ?? {})) {
    if (!(key in value)) continue;
    if (dependent === false) return false;
    if (isPlainObject(dependent) && !matches(dependent)) return false;
  }
  return true;
}

function dependenciesMatch(value, schema, matches) {
  for (const [key, dependent] of objectEntries(schema.dependencies ?? {})) {
    if (!(key in value)) continue;
    if (arrayValues(dependent).some((requiredKey) => !(requiredKey in value))) return false;
    if (dependent === false) return false;
    if (isPlainObject(dependent) && !matches(dependent)) return false;
  }
  return true;
}

function arraySchemaMatchesAfterCoercion(original, value, schema, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!isArray(value)) return false;
  if (!arrayLengthMatches(value, schema)) return false;
  if (schema.uniqueItems === true && !arrayItemsAreUnique(value)) return false;
  const originalArray = arrayValues(original);
  if (!arrayContainsMatches(value, schema, (item, index) => schemaValueMatchesAfterCoercion(originalArray[index], item, schema.contains, root))) return false;
  return value.every((item, index) => schemaValueMatchesAfterCoercion(originalArray[index], item, arrayItemSchema(schema, index, root), root));
}

function arrayLengthMatches(value, schema) {
  if (isNumber(schema.minItems) && value.length < schema.minItems) return false;
  if (isNumber(schema.maxItems) && value.length > schema.maxItems) return false;
  return true;
}

function arrayContainsMatches(value, schema, matchesItem) {
  if (!hasOwn(schema, "contains") || (!isBoolean(schema.contains) && !isPlainObject(schema.contains))) return true;
  const matches = value.filter(matchesItem).length;
  const minContains = isNumber(schema.minContains) ? schema.minContains : 1;
  if (matches < minContains) return false;
  if (isNumber(schema.maxContains) && matches > schema.maxContains) return false;
  return true;
}

function mergeAllOfObjectSchema(schema, root = schema) {
  const allOf = schemaAllOf(schema);
  if (!isPlainObject(schema) || !allOf) return null;
  const base = { ...schema };
  delete base.allOf;
  const parts = [base, ...allOf.map((option) => resolveJsonSchema(option, root))].filter((part) => isPlainObject(part) && hasKeys(part));
  if (!parts.length || parts.some((part) => !isObjectCompositionSchema(part, root))) return null;
  const merged = { type: "object", properties: {}, patternProperties: {} };
  const required = new Set();
  for (const part of parts) {
    if (isPlainObject(part.properties)) {
      for (const [key, value] of objectEntries(part.properties)) {
        merged.properties[key] = intersectJsonSchemas(merged.properties[key], value);
      }
    }
    if (isPlainObject(part.patternProperties)) {
      for (const [key, value] of objectEntries(part.patternProperties)) {
        merged.patternProperties[key] = intersectJsonSchemas(merged.patternProperties[key], value);
      }
    }
    for (const key of arrayValues(part.required)) required.add(key);
    if (isDefined(part.additionalProperties)) merged.additionalProperties = intersectJsonSchemas(merged.additionalProperties, part.additionalProperties);
    if (isDefined(part.unevaluatedProperties)) merged.unevaluatedProperties = intersectJsonSchemas(merged.unevaluatedProperties, part.unevaluatedProperties);
    if (isDefined(part.propertyNames)) merged.propertyNames = mergeAllOfValue(merged.propertyNames, part.propertyNames);
    if (isNumber(part.minProperties)) merged.minProperties = Math.max(merged.minProperties ?? 0, part.minProperties);
    if (isNumber(part.maxProperties)) merged.maxProperties = Math.min(merged.maxProperties ?? Infinity, part.maxProperties);
    if (isPlainObject(part.dependentRequired)) {
      merged.dependentRequired ??= {};
      for (const [key, values] of objectEntries(part.dependentRequired)) {
        merged.dependentRequired[key] = mergeUniqueArray(merged.dependentRequired[key], values);
      }
    }
    if (isPlainObject(part.dependentSchemas)) {
      merged.dependentSchemas ??= {};
      for (const [key, value] of objectEntries(part.dependentSchemas)) {
        merged.dependentSchemas[key] = mergeAllOfValue(merged.dependentSchemas[key], value);
      }
    }
    if (isPlainObject(part.dependencies)) {
      for (const [key, value] of objectEntries(part.dependencies)) {
        if (isArray(value)) {
          merged.dependentRequired ??= {};
          merged.dependentRequired[key] = mergeUniqueArray(merged.dependentRequired[key], value);
        } else if (value === false || value === true || isPlainObject(value)) {
          merged.dependentSchemas ??= {};
          merged.dependentSchemas[key] = mergeAllOfValue(merged.dependentSchemas[key], value);
        }
      }
    }
  }
  if (required.size) merged.required = [...required];
  deleteIfEmpty(merged, "properties");
  deleteIfEmpty(merged, "patternProperties");
  if (merged.maxProperties === Infinity) delete merged.maxProperties;
  return merged;
}

function intersectJsonSchemas(left, right) {
  if (!isDefined(left)) return right;
  if (!isDefined(right)) return left;
  if (left === false || right === false) return false;
  if (left === true) return right;
  if (right === true) return left;
  if (jsonValuesEqual(left, right)) return left;
  return { allOf: [...schemaIntersectionParts(left), ...schemaIntersectionParts(right)] };
}

function schemaIntersectionParts(schema) {
  const allOf = schemaAllOf(schema);
  return isPlainObject(schema) && allOf && keyCount(schema) === 1
    ? allOf
    : [schema];
}

function isObjectCompositionSchema(schema, root = schema) {
  const resolved = resolveJsonSchema(schema, root);
  if (!isPlainObject(resolved)) return false;
  if (isDefined(resolved.type) && !schemaTypeIncludes(resolved, "object", root)) return false;
  return hasAnyOwn(resolved, OBJECT_COMPOSITION_KEYS);
}

function numberSchemaMatches(value, schema) {
  if (isNumber(schema.minimum) && value < schema.minimum) return false;
  if (isNumber(schema.maximum) && value > schema.maximum) return false;
  if (isNumber(schema.exclusiveMinimum) && value <= schema.exclusiveMinimum) return false;
  if (schema.exclusiveMinimum === true && isNumber(schema.minimum) && value <= schema.minimum) return false;
  if (isNumber(schema.exclusiveMaximum) && value >= schema.exclusiveMaximum) return false;
  if (schema.exclusiveMaximum === true && isNumber(schema.maximum) && value >= schema.maximum) return false;
  if (isNumber(schema.multipleOf) && schema.multipleOf > 0) {
    const quotient = value / schema.multipleOf;
    if (Math.abs(quotient - Math.round(quotient)) > 1e-9) return false;
  }
  if (isString(schema.format) && !numberFormatMatches(value, schema.format)) return false;
  return true;
}

function numberFormatMatches(value, format) {
  if (format === "int32") return Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;
  if (format === "int64") return Number.isInteger(value) && Number.isSafeInteger(value);
  if (format === "float" || format === "double") return Number.isFinite(value);
  return true;
}

function stringSchemaMatches(value, schema) {
  const length = [...value].length;
  if (isNumber(schema.minLength) && length < schema.minLength) return false;
  if (isNumber(schema.maxLength) && length > schema.maxLength) return false;
  if (isString(schema.pattern)) {
    try {
      if (!new RegExp(schema.pattern).test(value)) return false;
    } catch {}
  }
  if (isString(schema.format) && !stringFormatMatches(value, schema.format)) return false;
  if (isString(schema.contentEncoding) && !contentEncodingMatches(value, schema.contentEncoding)) return false;
  if (isString(schema.contentMediaType) && !contentMediaTypeMatches(value, schema)) return false;
  if (isDefined(schema.contentSchema) && !contentSchemaMatches(value, schema)) return false;
  return true;
}

function stringFormatMatches(value, format) {
  if (format === "email") return validEmail(value, validHostname);
  if (format === "uri" || format === "url") return validAbsoluteUrl(value);
  if (format === "uuid") return UUID_RE.test(value);
  if (format === "date") return validDateString(value);
  if (format === "date-time") return validDateTimeString(value);
  if (format === "time") return validTimeString(value);
  if (format === "hostname") return validHostname(value);
  if (format === "idn-hostname") return validIdnHostname(value);
  if (format === "ipv4") return isIP(value) === 4;
  if (format === "ipv6") return isIP(value) === 6;
  if (format === "idn-email") return validEmail(value, validIdnHostname);
  if (format === "regex") return validRegexString(value);
  if (format === "json-pointer") return validJsonPointer(value);
  if (format === "uri-reference") return validUriReference(value);
  if (format === "iri") return validAbsoluteUrl(value);
  if (format === "iri-reference") return validUriReference(value);
  if (format === "uri-template") return validUriTemplate(value);
  if (format === "relative-json-pointer") return validRelativeJsonPointer(value);
  if (format === "byte") return validBase64String(value);
  if (format === "duration") return validDurationString(value);
  return true;
}

function validDateString(value) {
  const match = DATE_RE.exec(value);
  if (!match) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() + 1 === Number(match[2]) && date.getUTCDate() === Number(match[3]);
}

function validDateTimeString(value) {
  const match = DATE_TIME_RE.exec(value);
  if (!match || !validDateString(match[1]) || !validTimeString(match[2]) || !validTimezoneOffset(match[3])) return false;
  return Number.isFinite(Date.parse(value));
}

function validTimeString(value) {
  const match = TIME_RE.exec(value);
  if (!match) return false;
  return Number(match[1]) <= 23 && Number(match[2]) <= 59 && Number(match[3]) <= 59 && validTimezoneOffset(match[4] ?? "");
}

function validTimezoneOffset(value) {
  if (!value || value.toUpperCase() === "Z") return true;
  const match = TIMEZONE_OFFSET_RE.exec(value);
  return Boolean(match && Number(match[2]) <= 23 && Number(match[3]) <= 59);
}

function validEmail(value, validHost) {
  const host = emailHost(value);
  return Boolean(host && validHost(host));
}

function emailHost(value) {
  if (!isString(value) || hasWhitespace(value)) return "";
  const at = value.lastIndexOf("@");
  if (at <= 0 || at !== value.indexOf("@") || at === value.length - 1) return "";
  const local = value.slice(0, at);
  return local.startsWith(".") || local.endsWith(".") || local.includes("..") ? "" : value.slice(at + 1);
}

function validHostname(value) {
  if (!isString(value) || value.length > 253) return false;
  const hostname = value.endsWith(".") ? value.slice(0, -1) : value;
  if (!hostname) return false;
  return hostname.split(".").every((label) => HOSTNAME_LABEL_RE.test(label));
}

function validIdnHostname(value) {
  if (!isString(value) || hasWhitespace(value)) return false;
  try {
    const ascii = new URL(`http://${value}`).hostname;
    return validHostname(ascii);
  } catch {
    return false;
  }
}

function validRegexString(value) {
  try {
    new RegExp(value);
    return true;
  } catch {
    return false;
  }
}

function validJsonPointer(value) {
  return value === "" || (value.startsWith("/") && !JSON_POINTER_RE.test(value));
}

function validUriReference(value) {
  if (!isString(value) || hasWhitespace(value)) return false;
  try {
    new URL(value, "http://example.invalid/base");
    return true;
  } catch {
    return false;
  }
}

function validAbsoluteUrl(value) {
  if (!isString(value) || hasWhitespace(value)) return false;
  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol);
  } catch {
    return false;
  }
}

function validUriTemplate(value) {
  if (!isString(value) || hasWhitespace(value)) return false;
  let ok = true;
  const expanded = value.replace(/\{([^{}]+)\}/g, (_match, expression) => {
    if (!validUriTemplateExpression(expression)) ok = false;
    return "x";
  });
  if (!ok || expanded.includes("{") || expanded.includes("}")) return false;
  return validUriReference(expanded);
}

function validUriTemplateExpression(expression) {
  const text = String(expression ?? "");
  const body = URI_TEMPLATE_OPERATOR_RE.test(text) ? text.slice(1) : text;
  if (!body) return false;
  return body.split(",").every((part) => URI_TEMPLATE_PART_RE.test(part));
}

function validRelativeJsonPointer(value) {
  if (!isString(value)) return false;
  return RELATIVE_JSON_POINTER_RE.test(value);
}

function validBase64String(value) {
  if (!isString(value) || !BASE64_RE.test(value)) return false;
  try {
    return Buffer.from(value, "base64").toString("base64").replace(/=+$/, "") === value.replace(/=+$/, "");
  } catch {
    return false;
  }
}

function contentEncodingMatches(value, encoding) {
  const normalized = encoding.toLowerCase();
  if (normalized === "base64") return validBase64String(value);
  if (normalized === "base64url") return validBase64UrlString(value);
  if (normalized === "base16" || normalized === "hex") return isString(value) && value.length % 2 === 0 && HEX_RE.test(value);
  return true;
}

function validBase64UrlString(value) {
  return isString(value)
    && value.length % 4 !== 1
    && BASE64URL_RE.test(value);
}

function contentMediaTypeMatches(value, schema) {
  const mediaType = schema.contentMediaType.toLowerCase().split(";")[0].trim();
  if (mediaType === "application/json" || mediaType.endsWith("+json")) return parseContentJson(value, schema) !== null;
  return true;
}

function contentSchemaMatches(value, schema) {
  const parsed = parseContentJson(value, schema);
  return parsed !== null && schemaValueMatches(parsed, schema.contentSchema, schema);
}

function parseContentJson(value, schema) {
  const text = decodedContentText(value, schema);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function decodedContentText(value, schema) {
  if (!isString(value)) return null;
  const encoding = isString(schema.contentEncoding) ? schema.contentEncoding.toLowerCase() : "";
  try {
    if (encoding === "base64") return Buffer.from(value, "base64").toString("utf8");
    if (encoding === "base64url") return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    if (encoding === "base16" || encoding === "hex") return Buffer.from(value, "hex").toString("utf8");
  } catch {
    return null;
  }
  return value;
}

function validDurationString(value) {
  return DURATION_RE.test(value);
}

function discriminatorOptionForValue(schema, value, union, root = schema) {
  if (!schema?.discriminator || !isPlainObject(value) || !isArray(union)) return null;
  const propertyName = schema.discriminator.propertyName;
  if (!isString(propertyName) || !propertyName || !isString(value[propertyName])) return null;
  const tag = value[propertyName];
  const mapping = schema.discriminator.mapping;
  if (isPlainObject(mapping) && isString(mapping[tag])) {
    const mappedRef = mapping[tag];
    const mapped = union.find((option) => schemaOptionMatchesRef(option, mappedRef, root));
    if (mapped) return mapped;
  }
  return union.find((option) => discriminatorPropertyMatches(option, propertyName, tag, root)) ?? null;
}

function schemaOptionMatchesRef(option, ref, root) {
  if (isPlainObject(option) && option.$ref === ref) return true;
  const target = resolveJsonPointer(root, ref);
  const resolved = resolveJsonSchema(option, root);
  return Boolean(target && resolved === target);
}

function discriminatorPropertyMatches(option, propertyName, tag, root) {
  const resolved = resolveJsonSchema(option, root);
  const prop = resolved?.properties?.[propertyName];
  if (!isPlainObject(prop)) return false;
  if ("const" in prop && jsonValuesEqual(prop.const, tag)) return true;
  return schemaEnum(prop)?.some((item) => jsonValuesEqual(item, tag)) ?? false;
}

function objectSchemaMatches(value, schema, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!propertyCountMatches(value, schema)) return false;
  if (!requiredPropertiesMatch(value, schema)) return false;
  const allowed = schemaPropertySet(schema);
  for (const [key, item] of objectEntries(value)) {
    if (!objectAllowsProperty(schema, key, allowed, root)) return false;
    for (const propSchema of objectPropertySchemas(schema, key)) {
      if (!schemaValueMatches(item, propSchema, root)) return false;
    }
  }
  if (!dependentRequiredMatches(value, schema)) return false;
  if (!dependentSchemasMatch(value, schema, (dependent) => schemaValueMatches(value, dependent, root))) return false;
  if (!dependenciesMatch(value, schema, (dependent) => schemaValueMatches(value, dependent, root))) return false;
  return true;
}

function arraySchemaMatches(value, schema, root = schema) {
  if (!arrayLengthMatches(value, schema)) return false;
  if (schema.uniqueItems === true && !arrayItemsAreUnique(value)) return false;
  if (!arrayContainsMatches(value, schema, (item) => schemaValueMatches(item, schema.contains, root))) return false;
  return value.every((item, index) => schemaValueMatches(item, arrayItemSchema(schema, index, root), root));
}

function arrayItemsAreUnique(value) {
  for (let i = 0; i < value.length; i += 1) {
    for (let j = i + 1; j < value.length; j += 1) {
      if (jsonValuesEqual(value[i], value[j])) return false;
    }
  }
  return true;
}

function jsonValuesEqual(left, right) {
  if (Object.is(left, right)) return true;
  if (isArray(left) || isArray(right)) {
    return isArray(left) && isArray(right) && left.length === right.length && left.every((item, index) => jsonValuesEqual(item, right[index]));
  }
  if (isPlainObject(left) || isPlainObject(right)) {
    if (!isPlainObject(left) || !isPlainObject(right)) return false;
    const leftKeys = objectKeys(left).sort();
    const rightKeys = objectKeys(right).sort();
    return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index] && jsonValuesEqual(left[key], right[key]));
  }
  return false;
}

function isPlainObject(value) {
  return isObjectLike(value) && !isArray(value);
}

function booleanFromText(text) {
  const lower = text.trim().toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  return null;
}

function nullishFromText(text) {
  return text.trim().toLowerCase() === "null";
}

function coerceScalar(value) {
  if (!isString(value)) return value;
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
  if (isFiniteNumber(value)) return value;
  if (!isString(value)) return null;
  const text = value.replaceAll(",", "");
  const fraction = text.match(FRACTION_RE);
  if (fraction && Number(fraction[2]) !== 0) return Number(fraction[1]) / Number(fraction[2]);
  const match = text.match(NUMBER_RE);
  return match ? Number(match[0]) : null;
}

function inferCodeLanguageFromContent(content) {
  const languages = codeFenceLanguages(content);
  if (languages.some((language) => PYTHON_FENCE_LANGS.has(language))) return "python";
  return inferJavaScriptLanguageFromContent(content);
}

function inferJavaScriptLanguageFromContent(content) {
  const languages = codeFenceLanguages(content);
  if (languages.some((language) => TYPESCRIPT_FENCE_LANGS.has(language))) return "typescript";
  if (languages.some((language) => JAVASCRIPT_FENCE_LANGS.has(language))) return "javascript";
  return null;
}

function codeFenceLanguages(content) {
  const languages = [];
  OPENING_FENCE_RE.lastIndex = 0;
  for (const match of String(content ?? "").matchAll(OPENING_FENCE_RE)) {
    const language = fenceLanguage(match);
    if (language) languages.push(language);
  }
  CODE_FENCE_RE.lastIndex = 0;
  for (const match of String(content ?? "").matchAll(CODE_FENCE_RE)) {
    const language = fenceLanguage(match);
    if (language) languages.push(language);
  }
  return languages;
}

function fenceLanguage(match) { return (match.groups?.lang ?? "").trim().toLowerCase(); }

function normalizePythonCodeResponse(content, stats) {
  return normalizeCodeResponse(content, stats, pythonCodeCandidates(content), repairPythonCandidate, isParseablePython, "extracted_python_code");
}

function normalizeCodeResponse(content, stats, candidates, repair, isParseable, repairName) {
  for (const candidate of candidates) {
    const repaired = repair(candidate);
    if (repaired && isParseable(repaired)) {
      if (repaired.trim() !== content.trim()) stats.repairs.push(repairName);
      return repaired.trim();
    }
  }
  return null;
}

function pythonCodeCandidates(content) {
  return codeCandidates(content, (lang) => PYTHON_FENCE_LANGS.has(lang));
}

function codeCandidates(content, matchesLanguage) {
  const candidates = [];
  CODE_FENCE_RE.lastIndex = 0;
  for (const match of content.matchAll(CODE_FENCE_RE)) {
    const code = match.groups?.code ?? "";
    if (matchesLanguage(fenceLanguage(match))) candidates.push(code);
  }
  return uniqueTrimmed(candidates);
}

function repairPythonCandidate(code) { return trimToParseablePrefix(cleanCodeCandidate(code), isParseablePython).trim(); }

function trimToParseablePrefix(code, isParseable) {
  if (isParseable(code)) return code;
  const lines = code.split("\n");
  for (let end = lines.length - 1; end > 0; end -= 1) {
    const candidate = lines.slice(0, end).join("\n").trimEnd();
    if (isParseable(candidate)) return candidate;
  }
  return code;
}

function isParseablePython(code) {
  const text = stripEndTokens(String(code ?? "")).trim();
  if (!text || text.includes("```")) return false;
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
  return normalizeCodeResponse(
    content,
    stats,
    javaScriptCodeCandidates(content, language),
    (candidate) => repairJavaScriptCandidate(candidate, language),
    (candidate) => isParseableJavaScriptOrTypeScript(candidate, language),
    `extracted_${language}_code`,
  );
}

function javaScriptCodeCandidates(content, language) {
  return codeCandidates(content, (lang) => javaScriptFenceMatches(lang, language));
}

function javaScriptFenceMatches(lang, language) {
  if (!lang) return false;
  return language === "typescript" ? TYPESCRIPT_FENCE_LANGS.has(lang) || JAVASCRIPT_FENCE_LANGS.has(lang) : JAVASCRIPT_FENCE_LANGS.has(lang);
}

function repairJavaScriptCandidate(code, language) {
  return trimToParseablePrefix(cleanCodeCandidate(code), (candidate) => isParseableJavaScriptOrTypeScript(candidate, language)).trim();
}

function cleanCodeCandidate(code) { return stripEndTokens(code).trim(); }

function isParseableJavaScriptOrTypeScript(code, language = "javascript") {
  const text = stripEndTokens(String(code ?? "")).trim();
  if (!text || text.includes("```")) return false;
  try {
    parseJavaScriptAst(text, {
      sourceType: "unambiguous",
      errorRecovery: false,
      allowReturnOutsideFunction: false,
      plugins: javaScriptParserPlugins(language),
    });
    return true;
  } catch {
    return false;
  }
}

function javaScriptParserPlugins(language) {
  return language === "typescript" ? ["typescript", ...JAVASCRIPT_PARSER_PLUGINS] : JAVASCRIPT_PARSER_PLUGINS;
}

function stripToolResidue(content, toolMap) {
  let stripped = content;
  for (const pattern of TOOL_BLOCK_PATTERNS) stripped = stripped.replace(pattern, "");
  for (const name of toolMap.keys()) stripped = stripped.replace(new RegExp(`\\b${escapeRegExp(name)}\\s*\\([\\s\\S]*?\\)`, "g"), "");
  return stripped;
}

function ensureOpenAIToolCallIds(calls) {
  return calls.map((call, index) => ({ id: call.id ?? `call_${index}_${uuidPart(8)}`, type: "function", ...call }));
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
  return `${name}:${jsonText(sortObject(args))}`;
}

function sortObject(value) {
  if (isArray(value)) return value.map(sortObject);
  if (isObjectLike(value)) return entriesObject(objectEntries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, sortObject(v)]));
  return value;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function retryReasonForProcessed(body, requestPayload, stats, policy) {
  const message = firstMessage(body);
  const content = String(message.content ?? "").trim();
  const toolCalls = arrayValues(message.tool_calls);
  // Retries spend extra samples only on format failures where the current body cannot
  // satisfy the requested protocol: empty output, unrepaired JSON, or unparsable code.
  // They are not quality retries; this function does not look at rubrics, task answers,
  // benchmark names, or task content beyond detecting the requested response type.
  if (policy.retry_empty && !content && !toolCalls.length) return "empty_response";
  if (policy.retry_missing_tool_call && arrayValues(requestPayload.tools).length && !toolCalls.length && !content) return "missing_tool_call";
  if (policy.retry_malformed_json && !explicitNonJsonFormatRequest(requestPayload) && !stats.repairs.includes("repaired_json_content")) {
    const wantsJson = jsonFormatRequest(requestPayload);
    const jsonishContent = jsonLikeResponseContent(content);
    if ((wantsJson && content) || jsonishContent) return "malformed_json";
  }
  if (policy.retry_malformed_python) {
    const language = inferCodeLanguageFromContent(content);
    if (!jsonFormatRequest(requestPayload) && content && language === "python" && !isParseablePython(content)) return "malformed_python";
  }
  if (policy.retry_malformed_javascript) {
    const language = inferCodeLanguageFromContent(content);
    if (!jsonFormatRequest(requestPayload) && content && (language === "javascript" || language === "typescript") && !isParseableJavaScriptOrTypeScript(content, language)) return `malformed_${language}`;
  }
  return null;
}

function jsonLikeResponseContent(content) {
  const text = String(content ?? "");
  const trimmed = text.trimStart();
  if (!trimmed) return false;
  return startsJson(trimmed) || JSON_FENCE_RE.test(text);
}

function firstMessage(body) {
  const choice = firstArrayValue(body?.choices, {});
  return isPlainObject(choice?.message) ? choice.message : {};
}

async function upstreamRequest(state, method, path, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), state.timeoutSec * 1000);
  try {
    const hasPayload = isDefined(payload);
    const response = await fetch(new URL(path.replace(/^\//, ""), state.upstream), {
      method,
      headers: hasPayload ? { Accept: JSON_CONTENT_TYPE, "Content-Type": JSON_CONTENT_TYPE } : { Accept: JSON_CONTENT_TYPE },
      body: hasPayload ? jsonText(payload) : undefined,
      signal: controller.signal,
    });
    const body = Buffer.from(await response.arrayBuffer());
    return { status: response.status, headers: entriesObject(response.headers.entries()), body };
  } catch (error) {
    const body = jsonBuffer({ error: { message: String(error?.message ?? error), type: error?.name ?? "Error" } });
    return { status: 502, headers: { "content-type": JSON_CONTENT_TYPE }, body };
  } finally {
    clearTimeout(timeout);
  }
}

function writeJsonl(logJsonl, payload) {
  if (!logJsonl) return;
  fs.mkdirSync(path.dirname(logJsonl), { recursive: true });
  fs.appendFileSync(logJsonl, `${jsonText({ ts: Date.now() / 1000, ...payload })}\n`, "utf8");
}

function applyCors(reply) {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept,OpenAI-Beta,OpenAI-Organization,OpenAI-Project");
  reply.header("Access-Control-Max-Age", "86400");
}

function chatRole(role) {
  if (!CHAT_ROLES.has(role)) return "user";
  return role === "developer" ? "system" : role;
}

function responseInputCallId(item) { return String(item.call_id ?? item.id ?? shortId("call")); }
function responseInputTypeEnds(item, suffix) { return isString(item.type) && item.type.endsWith(suffix); }
function isFunctionType(value) { return value?.type === "function"; }

// Responses input is a richer event log than Chat Completions: user text, assistant tool
// calls, and tool outputs can all appear in the same input array. Preserve call IDs while
// projecting it to chat messages so agents can still match observations to actions.
function responseInputToMessages(payload) {
  const messages = [];
  if (isString(payload?.instructions) && payload.instructions.trim()) {
    messages.push({ role: "system", content: payload.instructions });
  }
  const addMessage = (role, content) => {
    const text = normalizeContentValue(content);
    if (text) messages.push({ role, content: text });
  };
  const input = payload?.input;
  if (isString(input)) addMessage("user", input);
  else if (isArray(input)) {
    for (const item of input) {
      if (isString(item)) addMessage("user", item);
      else if (isObjectLike(item)) {
        if (item.type === "reasoning") continue;
        if (item.type === "function_call" && isString(item.name)) {
          messages.push(responseFunctionCallMessage(item));
          continue;
        }
        if (item.type === "function_call_output") {
          messages.push(responseFunctionOutputMessage(item));
          continue;
        }
        if (responseInputTypeEnds(item, "_call_output")) {
          addMessage("user", responseToolOutputContent(firstPresent(item, ["output", "content", "result"]) ?? item));
          continue;
        }
        if (responseInputTypeEnds(item, "_call")) {
          addMessage("assistant", responseToolOutputContent(firstPresent(item, ["action", "input", "arguments"]) ?? item));
          continue;
        }
        addMessage(chatRole(item.role), item.content ?? item.text ?? item);
      }
    }
  } else if (isPlainObject(input)) {
    addMessage(chatRole(input.role), input.content ?? input.text ?? input);
  }
  if (!messages.length) messages.push({ role: "user", content: "" });
  return messages;
}

function responseFunctionCallMessage(item) {
  return {
    role: "assistant",
    content: "",
    tool_calls: [{
      id: responseInputCallId(item),
      type: "function",
      function: { name: item.name, arguments: serializedArgs(item.arguments) },
    }],
  };
}

function responseFunctionOutputMessage(item) {
  return {
    role: "tool",
    tool_call_id: responseInputCallId(item),
    content: responseToolOutputContent(firstPresent(item, ["output", "content"]) ?? ""),
  };
}

function responseToolOutputContent(value) {
  if (isNil(value)) return "";
  if (isString(value)) return value;
  if (isArray(value)) {
    const text = normalizeContentValue(value);
    return text || jsonText(value);
  }
  if (isPlainObject(value)) {
    const text = normalizeContentValue(value);
    return text && text !== "[object Object]" ? text : jsonText(value);
  }
  return String(value);
}

function responsesToolsToChatTools(tools) {
  if (!isArray(tools)) return tools;
  const converted = [];
  for (const tool of tools) {
    if (!isObjectLike(tool)) continue;
    if (isFunctionType(tool) && isPlainObject(tool.function)) {
      converted.push(tool);
      continue;
    }
    if (isFunctionType(tool) && isString(tool.name) && tool.name) {
      const fn = { name: tool.name };
      for (const key of RESPONSE_FUNCTION_TOOL_KEYS) {
        if (isDefined(tool[key])) fn[key] = tool[key];
      }
      if (!isDefined(fn.parameters) && isDefined(tool.input_schema)) fn.parameters = tool.input_schema;
      converted.push({ type: "function", function: fn });
      continue;
    }
    converted.push(tool);
  }
  return converted;
}

function responsesToolChoiceToChatToolChoice(toolChoice) {
  if (!isPlainObject(toolChoice)) return toolChoice;
  const functionName = toolChoice.name ?? toolChoice.function?.name;
  if (isFunctionType(toolChoice) && isString(functionName)) {
    return { type: "function", function: { name: functionName } };
  }
  if (["auto", "none", "required"].includes(toolChoice.type)) return toolChoice.type;
  return toolChoice;
}

function responsesTextFormatToChatResponseFormat(format) {
  if (!isPlainObject(format)) return undefined;
  if (format.type === "json_object") return { type: "json_object" };
  if (format.type === "json_schema") {
    if (isPlainObject(format.json_schema)) {
      return { type: "json_schema", json_schema: format.json_schema };
    }
    return {
      type: "json_schema",
      json_schema: {
        ...definedField("name", format.name),
        ...definedField("schema", format.schema),
        ...definedField("strict", format.strict),
      },
    };
  }
  return undefined;
}

function responsesPayloadToChatPayload(payload) {
  const chat = {
    model: payload.model,
    messages: responseInputToMessages(payload),
  };
  copyDefined(payload, chat, RESPONSES_PASSTHROUGH_KEYS);
  for (const [from, to] of RESPONSES_REASONING_KEYS) {
    if (isDefined(payload.reasoning?.[from])) chat[to] = payload.reasoning[from];
  }
  if (isDefined(payload.text?.verbosity)) chat.verbosity = payload.text.verbosity;
  if (isDefined(payload.top_k)) chat.top_k = payload.top_k;
  if (isDefined(payload.tools)) chat.tools = responsesToolsToChatTools(payload.tools);
  if (isDefined(payload.tool_choice)) chat.tool_choice = responsesToolChoiceToChatToolChoice(payload.tool_choice);
  if (isDefined(payload.response_format)) chat.response_format = payload.response_format;
  else {
    const responseFormat = responsesTextFormatToChatResponseFormat(payload.text?.format);
    if (isDefined(responseFormat)) chat.response_format = responseFormat;
  }
  const maxTokens = firstDefined(payload, RESPONSES_MAX_TOKEN_KEYS);
  if (isDefined(maxTokens)) chat.max_tokens = maxTokens;
  return chat;
}

function chatCompletionToResponsesBody(chatBody, responsePayload) {
  const choice = firstArrayValue(chatBody?.choices, {});
  const incompleteReason = incompleteReasonForFinish(choice.finish_reason);
  const status = responseStatus(incompleteReason);
  const message = firstMessage(chatBody);
  const text = normalizeContentValue(message.content);
  const refusal = normalizeContentValue(message.refusal);
  const output = [];
  if (text) {
    output.push(responseMessageOutput(status, outputTextContent(text)));
  }
  if (refusal) {
    output.push(responseMessageOutput(status, refusalContent(refusal)));
  }
  for (const call of arrayValues(message.tool_calls)) {
    if (!call?.function?.name) continue;
    output.push(responseFunctionCallItem({
      id: call.id ?? longId("fc"),
      status,
      callId: call.id ?? shortId("call"),
      name: call.function.name,
      arguments: serializedArgs(call.function.arguments),
    }));
  }
  if (!output.length) {
    output.push(responseMessageOutput(status, outputTextContent("")));
  }
  const created = isNumber(chatBody?.created) ? chatBody.created : nowSeconds();
  const id = chatBody?.id ?? longId("resp");
  const usage = responsesUsageFromChatUsage(chatBody?.usage);
  return {
    id,
    object: "response",
    created_at: created,
    status,
    ...incompleteDetails(incompleteReason),
    model: chatModelName(chatBody, responsePayload),
    ...responsesMetadata(responsePayload, chatBody),
    output,
    output_text: text,
    usage,
    gemma_harness: chatBody?.gemma_harness,
  };
}

function responseMessageOutput(status, content, id = longId("msg")) {
  return { id, type: "message", status, role: "assistant", content };
}

function responseFunctionCallItem({ id, status, callId, name, arguments: args }) {
  return { id, type: "function_call", status, call_id: callId, name, arguments: args };
}

function emptyStreamToolCall() { return { id: "", name: "", arguments: "" }; }
function mergeStreamToolCall(current, call) {
  if (call.id) current.id = call.id;
  if (call.function?.name) current.name = call.function.name;
  if (call.function?.arguments) current.arguments += call.function.arguments;
  return current;
}
function streamToolCallIndex(call, toolCalls) { return Number.isInteger(call.index) ? call.index : toolCalls.size; }
function streamDeltaText(choice, key) { return normalizeContentValue(choice?.delta?.[key]); }
function chatModelName(chatBody, payload) { return chatBody?.model ?? payload?.model; }
function outputTextContent(text) { return [{ type: "output_text", text, annotations: [] }]; }
function refusalContent(refusal) { return [{ type: "refusal", refusal, annotations: [] }]; }
function incompleteReasonForFinish(reason) { return reason === "length" ? "max_output_tokens" : reason === "content_filter" ? "content_filter" : null; }
function responseStatus(incompleteReason) { return incompleteReason ? "incomplete" : "completed"; }
function incompleteDetails(reason) { return reason ? { incomplete_details: { reason } } : {}; }

function chatCompletionStreamToResponsesSse(body, responsePayload) {
  const id = longId("resp");
  const messageId = longId("msg");
  const created = nowSeconds();
  let model = responsePayload?.model;
  let outputText = "";
  let refusalText = "";
  let usage;
  let systemFingerprint;
  let incompleteReason = null;
  const toolCalls = new Map();
  const events = [
    typedSseEvent("response.created", {
      response: { id, object: "response", created_at: created, status: "in_progress", model, output: [], output_text: "" },
    }),
  ];
  for (const event of parseChatCompletionSse(body)) {
    if (event.model) model = event.model;
    if (event.usage) usage = responsesUsageFromChatUsage(event.usage);
    if (event.system_fingerprint) systemFingerprint = event.system_fingerprint;
    const choice = firstArrayValue(event.choices, null);
    const delta = streamDeltaText(choice, "content");
    if (delta) {
      outputText += delta;
      events.push(typedSseEvent("response.output_text.delta", {
        item_id: messageId,
        output_index: 0,
        content_index: 0,
        delta,
      }));
    }
    const refusal = streamDeltaText(choice, "refusal");
    if (refusal) {
      refusalText += refusal;
      events.push(typedSseEvent("response.refusal.delta", {
        item_id: messageId,
        output_index: 0,
        content_index: 0,
        delta: refusal,
      }));
    }
    for (const call of arrayValues(choice?.delta?.tool_calls)) {
      const index = streamToolCallIndex(call, toolCalls);
      const current = toolCalls.get(index) ?? emptyStreamToolCall();
      toolCalls.set(index, mergeStreamToolCall(current, call));
    }
    incompleteReason = incompleteReasonForFinish(choice?.finish_reason) ?? incompleteReason;
  }
  const status = responseStatus(incompleteReason);
  const output = [];
  if (outputText || refusalText || !toolCalls.size) {
    output.push(responseMessageOutput(
      status,
      refusalText ? refusalContent(refusalText) : outputTextContent(outputText),
      messageId,
    ));
  }
  for (const call of [...toolCalls.values()]) {
    if (!call.name) continue;
    const callId = call.id || shortId("call");
    const item = responseFunctionCallItem({
      id: callId,
      status,
      callId,
      name: call.name,
      arguments: call.arguments || "{}",
    });
    output.push(item);
    events.push(typedSseEvent("response.output_item.added", {
      output_index: output.length - 1,
      item,
    }));
  }
  const response = {
    id,
    object: "response",
    created_at: created,
    status,
    ...incompleteDetails(incompleteReason),
    model,
    ...responsesMetadata(responsePayload, systemFingerprint ? { system_fingerprint: systemFingerprint } : {}),
    output,
    output_text: outputText,
    ...(usage ? { usage } : {}),
  };
  if (outputText) {
    events.push(typedSseEvent("response.output_text.done", {
      item_id: messageId,
      output_index: 0,
      content_index: 0,
      text: outputText,
    }));
  }
  if (refusalText) {
    events.push(typedSseEvent("response.refusal.done", {
      item_id: messageId,
      output_index: 0,
      content_index: 0,
      refusal: refusalText,
    }));
  }
  events.push(typedSseEvent(status === "completed" ? "response.completed" : "response.incomplete", {
    response,
  }));
  events.push(typedSseEvent("response.done", { response }));
  return Buffer.from(events.join(""), "utf8");
}

function parseChatCompletionSse(body) {
  const events = [];
  let dataLines = [];
  const flush = () => {
    if (!dataLines.length) return;
    const data = dataLines.join("\n").trim();
    dataLines = [];
    if (!data || data === "[DONE]") return;
    try {
      events.push(JSON.parse(data));
    } catch {}
  };
  for (const line of body.toString("utf8").split(/\r?\n/)) {
    if (!line.trim()) {
      flush();
      continue;
    }
    if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
  }
  flush();
  return events;
}

function sseEvent(event, data) {
  return `event: ${event}\ndata: ${jsonText(data)}\n\n`;
}
function typedSseEvent(type, data) { return sseEvent(type, { type, ...data }); }

function responsesMetadata(responsePayload, chatBody = {}) {
  return {
    ...definedField("parallel_tool_calls", responsePayload?.parallel_tool_calls),
    ...definedField("previous_response_id", responsePayload?.previous_response_id),
    ...definedField("truncation", responsePayload?.truncation),
    ...definedField("max_output_tokens", responsePayload?.max_output_tokens),
    ...definedField("store", responsePayload?.store),
    ...definedField("tool_choice", responsePayload?.tool_choice),
    ...definedField("service_tier", chatBody?.service_tier),
    ...definedField("system_fingerprint", chatBody?.system_fingerprint),
  };
}

function responsesUsageFromChatUsage(usage) {
  if (!isObjectLike(usage)) return undefined;
  return {
    input_tokens: usage.prompt_tokens ?? usage.input_tokens ?? 0,
    output_tokens: usage.completion_tokens ?? usage.output_tokens ?? 0,
    total_tokens: usage.total_tokens ?? 0,
    ...(usage.prompt_tokens_details ? { input_tokens_details: usage.prompt_tokens_details } : {}),
    ...(usage.completion_tokens_details ? { output_tokens_details: usage.completion_tokens_details } : {}),
  };
}

function completionPromptText(prompt) {
  if (isString(prompt)) return prompt;
  if (isArray(prompt)) {
    if (prompt.every(isString)) return prompt.join("\n");
    if (prompt.every(isNumber)) return prompt.join(" ");
    return prompt.map(completionPromptText).filter(Boolean).join("\n");
  }
  return normalizeContentValue(prompt);
}

function completionsPayloadToChatPayload(payload) {
  const chat = {
    model: payload.model,
    messages: [{ role: "user", content: completionPromptText(payload.prompt ?? "") }],
  };
  copyDefined(payload, chat, COMPLETIONS_PASSTHROUGH_KEYS);
  const maxTokens = firstDefined(payload, COMPLETIONS_MAX_TOKEN_KEYS);
  if (isDefined(maxTokens)) chat.max_tokens = maxTokens;
  return chat;
}

function chatCompletionToCompletionsBody(chatBody, completionPayload) {
  const created = chatBody?.created ?? nowSeconds();
  return {
    id: chatBody?.id ?? longId("cmpl"),
    object: "text_completion",
    created,
    model: chatModelName(chatBody, completionPayload),
    choices: arrayValues(chatBody?.choices).map((choice, index) => ({
      text: normalizeContentValue(choice?.message?.content),
      index: choice?.index ?? index,
      logprobs: choice?.logprobs ?? null,
      finish_reason: choice?.finish_reason ?? null,
    })),
    usage: chatBody?.usage,
    gemma_harness: chatBody?.gemma_harness,
  };
}

function sendBody(reply, status, body, contentType = JSON_CONTENT_TYPE) {
  reply.code(status).headers({ "content-type": contentType });
  return reply.send(body);
}

function sendUpstream(reply, upstream, contentType = responseContentType(upstream.headers)) {
  return sendBody(reply, upstream.status, upstream.body, contentType);
}

function writeRequestLog(state, request, payload, started, attempts, parse) {
  writeJsonl(state.logJsonl, {
    path: request.url,
    model: payload.model,
    elapsed_ms: elapsedMs(started),
    attempts,
    parse,
  });
}
function adapterParse(parseStats, adapter) { return { ...parseStats, adapter }; }
function skippedParse(reason) { return { skipped: reason }; }

// Non-streaming routes all use llama.cpp's chat endpoint under the hood. The shared retry
// loop keeps protocol repair consistent; each route only supplies its input projection and
// final envelope conversion. If upstream returns an error or malformed JSON after retries,
// the last upstream body is preserved for observability.
async function retryChatCompletions(state, upstreamPayload, processPayload, bodyFromProcessed) {
  const attempts = [];
  let finalStatus = 502;
  let finalHeaders = { "content-type": JSON_CONTENT_TYPE };
  let finalBody = Buffer.alloc(0);
  let parseStats = {};

  for (let attempt = 0; attempt < maxAttempts(state.policy); attempt += 1) {
    const upstream = await upstreamRequest(state, "POST", "/v1/chat/completions", upstreamPayload);
    finalStatus = upstream.status;
    finalHeaders = upstream.headers;
    finalBody = upstream.body;
    const info = attemptInfo(attempt, upstream.status);
    if (retryableUpstream5xx(attempts, info, upstream.status)) {
      if (canRetry(attempt, state.policy)) continue;
    }
    let upstreamJson;
    try {
      upstreamJson = parseJsonBuffer(upstream.body);
    } catch (error) {
      recordInvalidJsonAttempt(attempts, info, error);
      if (canRetry(attempt, state.policy)) continue;
      break;
    }
    const processed = processChatCompletion(upstreamJson, processPayload, state.policy);
    parseStats = processed.stats;
    const retryReason = retryReasonForProcessed(processed.body, processPayload, parseStats, state.policy);
    recordProcessedAttempt(attempts, info, retryReason);
    if (retryReason && canRetry(attempt, state.policy)) continue;
    finalBody = jsonBuffer(bodyFromProcessed(processed.body));
    finalHeaders = { "content-type": JSON_CONTENT_TYPE };
    finalStatus = upstream.status;
    break;
  }

  return { attempts, body: finalBody, headers: finalHeaders, parseStats, status: finalStatus };
}

export function buildServer(state) {
  const app = Fastify({ logger: false, bodyLimit: 32 * 1024 * 1024 });

  app.addHook("onSend", async (_request, reply, payload) => {
    applyCors(reply);
    return payload;
  });

  app.get("/", async () => ({ status: "ok", policy: state.policy }));
  app.get("/health", async () => ({ status: "ok", policy: state.policy }));

  app.get("/v1/models", async (_request, reply) => {
    const upstream = await upstreamRequest(state, "GET", "/v1/models");
    return sendUpstream(reply, upstream);
  });

  app.post("/v1/chat/completions", async (request, reply) => {
    const started = performance.now();
    const requestPayload = request.body;
    if (!isPlainObject(requestPayload)) return badJsonBody(reply);
    const upstreamPayload = prepareUpstreamPayload(requestPayload, state.policy);
    if (isStreamingRequest(requestPayload)) {
      // Streaming chunks are passed through. Rewriting them safely would require a stateful
      // SSE transformer that preserves token timing and partial tool-call deltas.
      const upstream = await upstreamRequest(state, "POST", "/v1/chat/completions", upstreamPayload);
      writeRequestLog(state, request, requestPayload, started, singleAttempt(upstream.status), skippedParse("streaming_passthrough"));
      return sendUpstream(reply, upstream);
    }
    const result = await retryChatCompletions(state, upstreamPayload, requestPayload, (body) => body);
    writeRequestLog(state, request, requestPayload, started, result.attempts, result.parseStats);
    return sendBody(reply, result.status, result.body, responseContentType(result.headers));
  });

  app.post("/v1/responses", async (request, reply) => {
    const started = performance.now();
    const requestPayload = request.body;
    if (!isPlainObject(requestPayload)) return badJsonBody(reply);
    const chatPayload = responsesPayloadToChatPayload(requestPayload);
    const upstreamPayload = prepareUpstreamPayload(chatPayload, state.policy);
    if (isStreamingRequest(requestPayload)) {
      // Responses streaming has a different event vocabulary, so it gets a narrow SSE
      // adapter instead of the non-streaming repair pipeline.
      const upstream = await upstreamRequest(state, "POST", "/v1/chat/completions", upstreamPayload);
      writeRequestLog(state, request, requestPayload, started, singleAttempt(upstream.status), { adapter: "responses_stream_to_chat_completions" });
      const contentType = isErrorStatus(upstream.status) ? responseContentType(upstream.headers) : EVENT_STREAM_CONTENT_TYPE;
      return sendBody(reply, upstream.status, responseStreamBody(upstream, requestPayload), contentType);
    }
    const result = await retryChatCompletions(
      state,
      upstreamPayload,
      chatPayload,
      (body) => chatCompletionToResponsesBody(body, requestPayload),
    );
    writeRequestLog(state, request, requestPayload, started, result.attempts, adapterParse(result.parseStats, "responses_to_chat_completions"));
    return sendBody(reply, result.status, result.body);
  });

  app.post("/v1/completions", async (request, reply) => {
    const started = performance.now();
    const requestPayload = request.body;
    if (!isPlainObject(requestPayload)) return badJsonBody(reply);
    if (isStreamingRequest(requestPayload)) {
      const upstream = await upstreamRequest(state, "POST", "/v1/completions", prepareUpstreamPayload(requestPayload, state.policy));
      writeRequestLog(state, request, requestPayload, started, singleAttempt(upstream.status), skippedParse("legacy_completions_streaming_passthrough"));
      return sendUpstream(reply, upstream);
    }
    const chatPayload = completionsPayloadToChatPayload(requestPayload);
    const upstreamPayload = prepareUpstreamPayload(chatPayload, state.policy);
    const result = await retryChatCompletions(
      state,
      upstreamPayload,
      chatPayload,
      (body) => chatCompletionToCompletionsBody(body, requestPayload),
    );
    writeRequestLog(state, request, requestPayload, started, result.attempts, adapterParse(result.parseStats, "completions_to_chat_completions"));
    return sendBody(reply, result.status, result.body);
  });

  app.all("*", async (request, reply) => {
    if (request.method === "OPTIONS") {
      applyCors(reply);
      reply.code(204);
      return "";
    }
    if (request.method === "POST") {
      const upstream = await upstreamRequest(state, "POST", request.url, request.body);
      return sendUpstream(reply, upstream);
    }
    reply.code(404);
    return { error: { message: `not found: ${request.url}` } };
  });

  return app;
}

const STRING_CLI_OPTIONS = { "--host": "host", "--upstream": "upstream", "--policy": "policy", "--log-jsonl": "logJsonl" };
const NUMBER_CLI_OPTIONS = { "--port": "port", "--temperature": "temperature", "--top-p": "top_p", "--top-k": "top_k", "--timeout-sec": "timeoutSec" };

function parseArgs(argv) {
  const args = {
    host: "127.0.0.1",
    port: 8092,
    upstream: "http://127.0.0.1:8091",
    policy: DEFAULT_POLICY_PATH,
    timeoutSec: 650,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === "--help") {
      args.help = true;
      continue;
    }
    const name = STRING_CLI_OPTIONS[key] ?? NUMBER_CLI_OPTIONS[key];
    if (!name) continue;
    args[name] = hasOwn(NUMBER_CLI_OPTIONS, key) ? Number(argv[i + 1]) : argv[i + 1];
    i += 1;
  }
  return args;
}

function printHelp() {
  console.log(`Gemma 4 harness

Options:
  --host HOST             Proxy listen host, default 127.0.0.1
  --port PORT             Proxy listen port, default 8092
  --upstream URL          Upstream llama.cpp endpoint, default http://127.0.0.1:8091
  --policy FILE           JSON policy file, default configs/gemma4_qat_q4_optimized_policy.json
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
    ...(!isDefined(args.temperature) ? {} : { temperature: args.temperature }),
    ...(!isDefined(args.top_p) ? {} : { top_p: args.top_p }),
    ...(!isDefined(args.top_k) ? {} : { top_k: args.top_k }),
  });
  const state = {
    upstream: args.upstream.replace(/\/?$/, "/"),
    policy,
    timeoutSec: args.timeoutSec,
    logJsonl: args.logJsonl,
  };
  const app = buildServer(state);
  await app.listen({ host: args.host, port: args.port });
  console.log(`gemma4 harness listening on http://${args.host}:${args.port} -> ${state.upstream.replace(/\/$/, "")} policy=${policy.name}:${policy.version}`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
