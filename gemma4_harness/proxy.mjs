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

const END_TOKENS = ["<end_of_turn>", "<eos>", "</s>", "<|eot_id|>", "<|im_end|>"];
const TOOL_BLOCK_PATTERNS = [
  /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/gi,
  /<function_call>\s*([\s\S]*?)\s*<\/function_call>/gi,
  /<tool_code>\s*([\s\S]*?)\s*<\/tool_code>/gi,
];
const FENCE_RE = /(?<fence>```|~~~)(?:json|jsonc|json5|python|javascript|js|typescript|ts|jsx|tsx|text)?\s*(?<body>[\s\S]*?)\k<fence>/gi;
const CODE_FENCE_RE = /(?<fence>```|~~~)(?<lang>[A-Za-z0-9_+-]*)\s*(?<code>[\s\S]*?)\k<fence>/g;
const JSON_FENCE_RE = /(?:```|~~~)json(?:c|5)?\b/i;
const THINK_RE = /<think>[\s\S]*?<\/think>/gi;
const FUNCTION_CALL_RE = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*?)\)/g;
const DEFAULT_POLICY_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "configs/gemma4_qat_q4_optimized_policy.json",
);

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

export function loadPolicy(path, overrides = {}) {
  const filePolicy = path ? JSON.parse(fs.readFileSync(path, "utf8")) : {};
  return { ...DEFAULT_POLICY, ...filePolicy, ...overrides };
}

export function prepareUpstreamPayload(payload, policy) {
  const outgoing = structuredClone(payload ?? {});
  if (outgoing.max_tokens === undefined && outgoing.max_completion_tokens !== undefined) {
    outgoing.max_tokens = outgoing.max_completion_tokens;
    delete outgoing.max_completion_tokens;
  }
  if (Array.isArray(outgoing.messages)) outgoing.messages = normalizeChatMessagesForUpstream(outgoing.messages);
  if (outgoing.tool_choice !== undefined) outgoing.tool_choice = responsesToolChoiceToChatToolChoice(outgoing.tool_choice);
  if (policy.enforce_sampler) {
    outgoing.temperature = Number(policy.temperature);
    outgoing.top_p = Number(policy.top_p);
    outgoing.top_k = Number(policy.top_k);
  }
  if (outgoing.stream === undefined) outgoing.stream = false;
  return outgoing;
}

function normalizeChatMessagesForUpstream(messages) {
  return messages.map((message) => {
    if (!message || typeof message !== "object" || Array.isArray(message)) return message;
    if (message.role !== "developer") return message;
    return { ...message, role: "system" };
  });
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

  const legacyFunctionCalls = out.function_call && typeof out.function_call === "object" ? [out.function_call] : [];
  const existingCalls = normalizeToolCalls([...(Array.isArray(out.tool_calls) ? out.tool_calls : []), ...legacyFunctionCalls], toolMap, policy, stats);
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
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(contentPartText).filter(Boolean).join("\n");
  }
  return contentPartText(value) || String(value);
}

function contentPartText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(contentPartText).filter(Boolean).join("\n");
  if (!value || typeof value !== "object") return "";
  for (const key of ["text", "input_text", "output_text", "output", "content"]) {
    if (typeof value[key] === "string") return value[key];
    if (Array.isArray(value[key])) return value[key].map(contentPartText).filter(Boolean).join("\n");
  }
  const imageUrl = imageContentUrl(value);
  if (imageUrl) return `[image: ${imageUrl}]`;
  const mediaRef = mediaContentRef(value);
  if (mediaRef) return `[${mediaRef.kind}: ${mediaRef.ref}]`;
  const fileRef = fileContentRef(value);
  if (fileRef) return `[file: ${fileRef}]`;
  if (typeof value.refusal === "string") return value.refusal;
  return "";
}

function imageContentUrl(value) {
  if (typeof value.image_url === "string") return value.image_url;
  if (value.image_url && typeof value.image_url === "object" && typeof value.image_url.url === "string") return value.image_url.url;
  if (typeof value.url === "string" && (value.type === "input_image" || value.type === "output_image" || value.type === "image_url")) return value.url;
  if (typeof value.file_id === "string" && value.type === "input_image") return value.file_id;
  if (value.source && typeof value.source === "object") {
    if (typeof value.source.url === "string") return value.source.url;
    if (typeof value.source.data === "string") return value.source.media_type ? `${value.source.media_type};base64,${value.source.data}` : value.source.data;
  }
  return "";
}

function fileContentRef(value) {
  if (typeof value.filename === "string" && typeof value.file_id === "string") return `${value.filename} (${value.file_id})`;
  if (typeof value.file_id === "string" && (value.type === "input_file" || value.type === "file")) return value.file_id;
  if (typeof value.file_data === "string" && (value.type === "input_file" || value.type === "file")) return value.filename ? `${value.filename} (${value.file_data})` : value.file_data;
  if (typeof value.file_url === "string" && (value.type === "input_file" || value.type === "file")) return value.filename ? `${value.filename} (${value.file_url})` : value.file_url;
  if (typeof value.filename === "string" && (value.type === "input_file" || value.type === "file")) return value.filename;
  return "";
}

function mediaContentRef(value) {
  const kind = value.type === "input_audio" || value.type === "audio" ? "audio" : value.type === "input_video" || value.type === "video" ? "video" : "";
  if (!kind) return null;
  for (const key of ["file_id", "url", "audio_url", "video_url", "data"]) {
    if (typeof value[key] === "string") return { kind, ref: value[key] };
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
  const rawName = fn.name ?? fn.tool_name ?? fn.recipient_name ?? fn.tool ?? fn.function;
  if (typeof rawName !== "string" || !rawName) return null;
  const name = canonicalToolName(rawName, toolMap);
  if (toolMap.size && !toolMap.has(name)) return null;
  let args = parseArgsValue(fn.arguments ?? fn.arguments_json ?? fn.args ?? fn.tool_input ?? fn.input_json ?? fn.input ?? fn.parameters ?? fn.payload ?? {});
  if (policy.normalize_tool_args) args = normalizeArgsForSchema(args, toolMap.get(name) ?? {});
  return {
    id: String(call.id ?? call.call_id ?? `call_${randomUUID().replaceAll("-", "").slice(0, 12)}`),
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
  return clean;
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
  for (const part of splitTopLevelArgs(text)) {
    const index = topLevelAssignmentIndex(part);
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
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
    if (char === "\"" || char === "'") {
      inString = true;
      quote = char;
      continue;
    }
    if (char === "{" || char === "[" || char === "(") depth += 1;
    else if ((char === "}" || char === "]" || char === ")") && depth > 0) depth -= 1;
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
    if (char === "\"" || char === "'") {
      inString = true;
      quote = char;
      continue;
    }
    if (char === "{" || char === "[" || char === "(") depth += 1;
    else if ((char === "}" || char === "]" || char === ")") && depth > 0) depth -= 1;
    else if ((char === "=" || char === ":") && depth === 0) return i;
  }
  return -1;
}

function parseKeyValueArgValue(value) {
  const trimmed = value.trim();
  const parsed = parseLooseJson(trimmed);
  if (parsed !== null) return parsed;
  return coerceScalar(trimmed.replace(/^["']|["']$/g, ""));
}

function resolveJsonSchema(schema, root = schema, seen = new Set()) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema) || typeof schema.$ref !== "string") return schema;
  const ref = schema.$ref;
  if (!ref.startsWith("#") || seen.has(ref)) return schema;
  const target = resolveJsonPointer(root, ref);
  if (!target || typeof target !== "object" || Array.isArray(target)) return schema;
  const nextSeen = new Set(seen);
  nextSeen.add(ref);
  const resolved = resolveJsonSchema(target, root, nextSeen);
  const siblings = { ...schema };
  delete siblings.$ref;
  return Object.keys(siblings).length ? { ...resolved, ...siblings } : resolved;
}

function resolveJsonPointer(root, pointer) {
  if (pointer === "#") return root;
  if (pointer.startsWith("#") && !pointer.startsWith("#/")) return findJsonSchemaAnchor(root, decodeURIComponent(pointer.slice(1)));
  if (!pointer.startsWith("#/")) return null;
  let current = root;
  for (const rawToken of pointer.slice(2).split("/")) {
    const token = decodeURIComponent(rawToken).replace(/~1/g, "/").replace(/~0/g, "~");
    if (!current || typeof current !== "object" || !(token in current)) return null;
    current = current[token];
  }
  return current;
}

function findJsonSchemaAnchor(value, anchor, seen = new Set()) {
  if (!anchor || !value || typeof value !== "object" || seen.has(value)) return null;
  seen.add(value);
  if (!Array.isArray(value)) {
    if (value.$anchor === anchor) return value;
    if (typeof value.$id === "string" && value.$id.split("#").at(-1) === anchor) return value;
  }
  for (const child of Object.values(value)) {
    const found = findJsonSchemaAnchor(child, anchor, seen);
    if (found) return found;
  }
  return null;
}

function objectAllowsProperty(schema, key, allowed = new Set(Object.keys(schema?.properties ?? {})), root = schema) {
  if (!propertyNameAllowed(schema, key, root)) return false;
  const properties = schema?.properties ?? {};
  if (Object.prototype.hasOwnProperty.call(properties, key) && properties[key] === false) return false;
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
  const properties = schema?.properties ?? {};
  if (Object.prototype.hasOwnProperty.call(properties, key)) schemas.push(properties[key]);
  schemas.push(...matchingPatternPropertySchemas(schema, key));
  if (!schemas.length) {
    const additional = schema?.additionalProperties;
    if (additional && typeof additional === "object" && !Array.isArray(additional)) schemas.push(additional);
    else if (additional !== true) {
      const unevaluated = schema?.unevaluatedProperties;
      if (unevaluated && typeof unevaluated === "object" && !Array.isArray(unevaluated)) schemas.push(unevaluated);
    }
  }
  return schemas;
}

function patternPropertySchema(schema, key) {
  return matchingPatternPropertySchemas(schema, key)[0] ?? null;
}

function matchingPatternPropertySchemas(schema, key) {
  const patterns = schema?.patternProperties;
  if (!patterns || typeof patterns !== "object" || Array.isArray(patterns)) return [];
  const schemas = [];
  for (const [pattern, prop] of Object.entries(patterns)) {
    try {
      if (new RegExp(pattern).test(key)) schemas.push(prop);
    } catch {}
  }
  return schemas;
}

function propertyNameAllowed(schema, key, root = schema) {
  if (!schema || !Object.prototype.hasOwnProperty.call(schema, "propertyNames")) return true;
  return schemaValueMatches(key, schema.propertyNames, root);
}

function normalizeArgsForSchema(args, schema) {
  const params = schema?.parameters ?? schema?.input_schema ?? {};
  const normalized = coerceJsonForSchema(args ?? {}, params, params);
  return isPlainObject(normalized) ? normalized : {};
}

function coerceForJsonSchema(value, prop, root = prop) {
  prop = resolveJsonSchema(prop, root);
  if (prop && typeof prop === "object" && Array.isArray(prop.allOf)) {
    return prop.allOf.reduce((current, option) => coerceForJsonSchema(current, option, root), value);
  }
  const conditional = conditionalBranchForValue(prop, value, root);
  if (conditional !== null) {
    const coerced = coerceForJsonSchema(value, conditional, root);
    const branchValue = schemaValueMatches(coerced, conditional, root) ? coerced : value;
    const base = schemaWithoutConditionals(prop, root);
    return base ? coerceForJsonSchema(branchValue, base, root) : branchValue;
  }
  const union = prop && typeof prop === "object" && (Array.isArray(prop.anyOf) ? prop.anyOf : Array.isArray(prop.oneOf) ? prop.oneOf : null);
  const isOneOf = prop && typeof prop === "object" && Array.isArray(prop.oneOf) && union === prop.oneOf;
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
  if (prop && typeof prop === "object" && "const" in prop) {
    const constValue = coerceConstForJsonSchema(value, prop.const);
    if (constValue !== undefined && schemaValueMatches(constValue, prop, root)) return constValue;
  }
  const enumValue = coerceEnumForJsonSchema(value, prop);
  if (enumValue !== undefined && schemaValueMatches(enumValue, prop, root)) return enumValue;
  if (schemaTypeIncludes(prop, "null", root) && typeof value === "string" && nullishFromText(value)) return null;
  if (schemaTypeIncludes(prop, "integer", root)) {
    const number = firstNumber(value);
    if (number === null || !Number.isFinite(number) || !Number.isInteger(number)) return value;
    return schemaValueMatches(number, prop, root) ? number : value;
  }
  if (schemaTypeIncludes(prop, "number", root)) {
    const number = firstNumber(value);
    if (number === null || !Number.isFinite(number)) return value;
    return schemaValueMatches(number, prop, root) ? number : value;
  }
  if (schemaTypeIncludes(prop, "boolean", root) && typeof value === "string") {
    const bool = booleanFromText(value);
    return bool !== null && schemaValueMatches(bool, prop, root) ? bool : value;
  }
  if (schemaTypeIncludes(prop, "array", root) || Array.isArray(prop?.prefixItems) || prop?.items) return coerceArrayForJsonSchema(value, prop, root);
  if (schemaTypeIncludes(prop, "string", root) && value !== null && value !== undefined) {
    const text = String(value);
    return schemaValueMatches(text, prop, root) ? text : value;
  }
  return value;
}

function coerceArrayForJsonSchema(value, prop, root = prop) {
  prop = resolveJsonSchema(prop, root);
  const parsed = typeof value === "string" && schemaTypeIncludes(prop, "array", root) ? parseLooseJson(value) : null;
  const array = Array.isArray(value)
    ? value
    : Array.isArray(parsed)
      ? parsed
    : schemaTypeIncludes(prop, "array", root) && typeof value === "string"
      ? value.split(/[,\n;]/).map((part) => part.trim()).filter(Boolean)
      : schemaTypeIncludes(prop, "array", root) && value !== null && value !== undefined
        ? [value]
        : null;
  if (!array) return value;
  const coerced = array.map((item, index) => coerceJsonArrayItemForSchema(item, prop, index, root));
  return schemaValueMatches(coerced, prop, root) ? coerced : value;
}

function arrayItemSchema(prop, index, root = prop) {
  prop = resolveJsonSchema(prop, root);
  if (prop && typeof prop === "object" && Array.isArray(prop.prefixItems) && prop.prefixItems[index]) return prop.prefixItems[index];
  if (prop && typeof prop === "object" && Array.isArray(prop.items) && prop.items[index]) return prop.items[index];
  if (prop && typeof prop === "object" && Array.isArray(prop.items)) return prop.additionalItems ?? {};
  if (prop && typeof prop === "object" && prop.items === undefined && prop.unevaluatedItems !== undefined) return prop.unevaluatedItems;
  return prop?.items ?? {};
}

function coerceArrayItemForJsonSchema(item, prop, index, root = prop) {
  const itemSchema = arrayItemSchema(prop, index, root);
  if (isEmptyJsonSchema(itemSchema)) {
    const contains = containsItemSchema(prop);
    if (contains) {
      const coerced = coerceForJsonSchema(item, contains, root);
      if (schemaValueMatches(coerced, contains, root)) return coerced;
    }
  }
  return coerceForJsonSchema(item, itemSchema, root);
}

function containsItemSchema(prop) {
  prop = resolveJsonSchema(prop, prop);
  const contains = prop?.contains;
  return contains && typeof contains === "object" && !Array.isArray(contains) ? contains : null;
}

function isEmptyJsonSchema(schema) {
  return !schema || (typeof schema === "object" && !Array.isArray(schema) && Object.keys(schema).length === 0);
}

function coerceConstForJsonSchema(value, expected) {
  if (Object.is(value, expected)) return value;
  if ((isPlainObject(expected) || Array.isArray(expected)) && typeof value === "string") {
    const parsed = parseLooseJson(value);
    if (jsonValuesEqual(parsed, expected)) return expected;
  }
  if (typeof expected === "string" && typeof value === "string" && value.trim().toLowerCase() === expected.toLowerCase()) return expected;
  if (typeof expected === "number") {
    const number = firstNumber(value);
    if (number !== null && Number.isFinite(number) && Object.is(number, expected)) return expected;
  }
  if (typeof expected === "boolean" && typeof value === "string") {
    const bool = booleanFromText(value);
    if (bool === expected) return expected;
  }
  if (expected === null && typeof value === "string" && nullishFromText(value)) return null;
  return undefined;
}

function coerceEnumForJsonSchema(value, prop) {
  if (!prop || typeof prop !== "object" || !Array.isArray(prop.enum)) return undefined;
  if (prop.enum.some((item) => jsonValuesEqual(item, value))) return value;
  for (const item of prop.enum) {
    const coerced = coerceConstForJsonSchema(value, item);
    if (coerced !== undefined) return coerced;
  }
  if (typeof value !== "string") return undefined;
  const clean = value.trim().toLowerCase();
  const match = prop.enum.find((item) => typeof item === "string" && item.toLowerCase() === clean);
  return match === undefined ? undefined : match;
}

function schemaTypeIncludes(prop, type, root = prop) {
  prop = resolveJsonSchema(prop, root);
  if (!prop || typeof prop !== "object") return false;
  if (type === "null" && prop.nullable === true) return true;
  return Array.isArray(prop.type) ? prop.type.includes(type) : prop.type === type;
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
  for (const key of ["tool_calls", "toolCalls", "tool_uses", "tools", "calls", "function_calls", "functionCalls"]) {
    if (Array.isArray(obj[key])) {
      for (const item of obj[key]) calls.push(...toolCallsFromObject(item, toolMap, policy));
      return calls;
    }
    if (obj[key] && typeof obj[key] === "object") {
      calls.push(...toolCallsFromObject(obj[key], toolMap, policy));
      return calls;
    }
  }
  if (obj.tool_call && typeof obj.tool_call === "object") return toolCallsFromObject(obj.tool_call, toolMap, policy);
  if (obj.tool_use && typeof obj.tool_use === "object") return toolCallsFromObject(obj.tool_use, toolMap, policy);
  if (obj.function_call && typeof obj.function_call === "object") return toolCallsFromObject(obj.function_call, toolMap, policy);
  const fn = obj.function && typeof obj.function === "object" ? obj.function : obj;
  const rawName = fn.name ?? fn.tool_name ?? fn.recipient_name ?? fn.tool ?? fn.function;
  if (typeof rawName !== "string" || !rawName) return calls;
  const name = canonicalToolName(rawName, toolMap);
  if (!toolMap.has(name)) return calls;
  let args = parseArgsValue(fn.arguments ?? fn.arguments_json ?? fn.args ?? fn.tool_input ?? fn.input_json ?? fn.input ?? fn.parameters ?? fn.payload ?? {});
  if (policy.normalize_tool_args) args = normalizeArgsForSchema(args, toolMap.get(name));
  calls.push(toolCall(name, args, obj.id ?? obj.call_id));
  return calls;
}

function toolCall(name, args, id = null) {
  return {
    id: id ? String(id) : `call_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
    type: "function",
    function: { name, arguments: JSON.stringify(args ?? {}) },
  };
}

function jsonCandidates(text, includeEscaped = true) {
  const candidates = [];
  const clean = stripEndTokens(text);
  if (clean) candidates.push(clean);
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
    if (char === "\"" || char === "'") {
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
  return [...new Set(candidates.filter(Boolean))];
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
    if (char === "\"" || char === "'") {
      inString = true;
      quote = char;
      out += char;
      continue;
    }
    if (char === "{" || char === "[") {
      stack.push(char === "{" ? "}" : "]");
      out += char;
      continue;
    }
    if (char === "}" || char === "]") {
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
    if (char === "\"" || char === "'") {
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
  return stripped.startsWith("{") || stripped.startsWith("[") || JSON_FENCE_RE.test(stripped) || JSON_FENCE_RE.test(content);
}

function jsonFormatRequest(payload) {
  return formatMentionsJson(payload?.response_format) || formatMentionsJson(payload?.text?.format);
}

function formatMentionsJson(format) {
  if (!format || typeof format !== "object" || Array.isArray(format)) return false;
  return format.type === "json_object"
    || format.type === "json_schema"
    || Object.prototype.hasOwnProperty.call(format, "json_schema")
    || Object.prototype.hasOwnProperty.call(format, "schema");
}

function explicitNonJsonFormatRequest(payload) {
  const format = payload?.response_format ?? payload?.text?.format;
  return !!format && typeof format === "object" && !Array.isArray(format) && typeof format.type === "string" && !formatMentionsJson(format);
}

function normalizeJsonResponse(content, policy, stats, context = {}) {
  if (!policy.repair_json) return null;
  for (const candidate of jsonCandidates(content, policy.parse_escaped_json)) {
    let parsed = parseLooseJson(candidate);
    const schema = jsonResponseSchema(context?.requestPayload);
    if ((parsed && typeof parsed === "object") || (schema && parsed !== null)) {
      if (schema) parsed = coerceJsonForSchema(parsed, schema);
      stats.repairs.push("repaired_json_content");
      return JSON.stringify(parsed);
    }
  }
  return null;
}

function jsonResponseSchema(payload) {
  const format = payload?.response_format ?? payload?.text?.format;
  if (!format || typeof format !== "object" || Array.isArray(format)) return null;
  if (format.type !== "json_schema") return null;
  if (format.json_schema && typeof format.json_schema === "object") {
    if (format.json_schema.schema && typeof format.json_schema.schema === "object") return format.json_schema.schema;
    if (isJsonSchemaObject(format.json_schema)) return format.json_schema;
  }
  if (format.schema && typeof format.schema === "object") return format.schema;
  return null;
}

function isJsonSchemaObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return [
    "$ref",
    "$defs",
    "definitions",
    "type",
    "properties",
    "patternProperties",
    "items",
    "prefixItems",
    "additionalProperties",
    "unevaluatedProperties",
    "unevaluatedItems",
    "anyOf",
    "oneOf",
    "allOf",
    "not",
    "if",
    "then",
    "else",
    "const",
    "enum",
    "contains",
    "dependentRequired",
    "dependentSchemas",
    "dependencies",
    "propertyNames",
    "required",
    "minProperties",
    "maxProperties",
    "minItems",
    "maxItems",
    "uniqueItems",
    "minContains",
    "maxContains",
    "minLength",
    "maxLength",
    "pattern",
    "format",
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    "contentEncoding",
    "contentMediaType",
    "contentSchema",
    "nullable",
    "default",
  ].some((key) => Object.prototype.hasOwnProperty.call(value, key));
}

function coerceJsonForSchema(value, schema, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!schema || typeof schema !== "object") return value;
  if (Array.isArray(schema.allOf)) {
    const merged = mergeAllOfObjectSchema(schema, root);
    if (merged && (isPlainObject(value) || typeof value === "string")) return coerceJsonForSchema(value, merged, root);
    return schema.allOf.reduce((current, option) => coerceJsonForSchema(current, option, root), value);
  }
  const union = Array.isArray(schema.anyOf) ? schema.anyOf : Array.isArray(schema.oneOf) ? schema.oneOf : null;
  const isOneOf = Array.isArray(schema.oneOf) && union === schema.oneOf;
  if (union) {
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
  if (schemaTypeIncludes(schema, "object", root) || schema.properties || schema.patternProperties) {
    if (typeof value === "string") {
      const parsed = parseLooseJson(value);
      if (isPlainObject(parsed)) value = parsed;
    }
    if (!isPlainObject(value)) return value;
    const properties = schema.properties ?? {};
    const allowed = new Set(Object.keys(properties));
    const entries = Object.entries(value).filter(([key]) => objectAllowsProperty(schema, key, allowed, root));
    let normalized = Object.fromEntries(
      entries.map(([key, item]) => [key, coerceJsonForSchema(item, objectPropertySchema(schema, key), root)]),
    );
    for (const [key, prop] of Object.entries(properties)) {
      const resolvedProp = resolveJsonSchema(prop, root);
      if (!(key in normalized) && resolvedProp && typeof resolvedProp === "object" && "default" in resolvedProp) {
        normalized[key] = coerceJsonForSchema(resolvedProp.default, resolvedProp, root);
      }
    }
    for (const [key, dependent] of Object.entries(schema.dependentSchemas ?? {})) {
      if (key in normalized && dependent && typeof dependent === "object" && !Array.isArray(dependent)) {
        const withDependent = coerceJsonForSchema(normalized, dependent, root);
        if (isPlainObject(withDependent)) normalized = withDependent;
      }
    }
    for (const [key, dependent] of Object.entries(schema.dependencies ?? {})) {
      if (key in normalized && dependent && typeof dependent === "object" && !Array.isArray(dependent)) {
        const withDependent = coerceJsonForSchema(normalized, dependent, root);
        if (isPlainObject(withDependent)) normalized = withDependent;
      }
    }
    return normalized;
  }
  if (schemaTypeIncludes(schema, "array", root) || schema.items || Array.isArray(schema.prefixItems)) {
    if (Array.isArray(value)) {
      const coerced = value.map((item, index) => coerceJsonArrayItemForSchema(item, schema, index, root));
      return schemaValueMatches(coerced, schema, root) ? coerced : value;
    }
    if (schemaTypeIncludes(schema, "array", root)) {
      const coerced = coerceForJsonSchema(value, schema, root);
      if (Array.isArray(coerced)) return coerced.map((item, index) => coerceJsonArrayItemForSchema(item, schema, index, root));
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
  if (!schema || typeof schema !== "object") return true;
  if (schema.not && schemaValueMatches(value, schema.not, root)) return false;
  if (Array.isArray(schema.allOf)) {
    const merged = mergeAllOfObjectSchema(schema, root);
    if (merged && isPlainObject(value)) return schemaValueMatches(value, merged, root);
    return schema.allOf.every((option) => schemaValueMatches(value, option, root));
  }
  if (Array.isArray(schema.anyOf)) {
    const option = discriminatorOptionForValue(schema, value, schema.anyOf, root);
    const unionMatches = option ? schemaValueMatches(value, option, root) : schema.anyOf.some((candidate) => schemaValueMatches(value, candidate, root));
    if (!unionMatches) return false;
    const base = schemaWithoutUnion(schema, root);
    return base ? schemaValueMatches(value, base, root) : true;
  }
  if (Array.isArray(schema.oneOf)) {
    const option = discriminatorOptionForValue(schema, value, schema.oneOf, root);
    const unionMatches = option ? schemaValueMatches(value, option, root) : countMatchingSchemas(value, schema.oneOf, root) === 1;
    if (!unionMatches) return false;
    const base = schemaWithoutUnion(schema, root);
    return base ? schemaValueMatches(value, base, root) : true;
  }
  const conditional = conditionalBranchForValue(schema, value, root);
  if (conditional !== null && !schemaValueMatches(value, conditional, root)) return false;
  if ("const" in schema && !jsonValuesEqual(value, schema.const)) return false;
  if (Array.isArray(schema.enum) && !schema.enum.some((item) => jsonValuesEqual(item, value))) return false;
  if (schemaTypeIncludes(schema, "null", root) && value === null) return true;
  if (Array.isArray(value) && hasArrayValidationKeywords(schema) && schemaValidationAppliesToKind(schema, "array", root)) return arraySchemaMatches(value, schema, root);
  if (isPlainObject(value) && hasObjectValidationKeywords(schema) && schemaValidationAppliesToKind(schema, "object", root)) return objectSchemaMatches(value, schema, root);
  if (typeof value === "number" && Number.isFinite(value) && hasNumberValidationKeywords(schema) && schemaValidationAppliesToKind(schema, "number", root)) return numberSchemaMatches(value, schema);
  if (typeof value === "string" && hasStringValidationKeywords(schema) && schemaValidationAppliesToKind(schema, "string", root)) return stringSchemaMatches(value, schema);
  if ((schemaTypeIncludes(schema, "array", root) || schema.items || Array.isArray(schema.prefixItems)) && Array.isArray(value)) return arraySchemaMatches(value, schema, root);
  if ((schemaTypeIncludes(schema, "object", root) || schema.properties || schema.patternProperties) && isPlainObject(value)) return objectSchemaMatches(value, schema, root);
  if (schemaTypeIncludes(schema, "integer", root) && Number.isInteger(value)) return numberSchemaMatches(value, schema);
  if (schemaTypeIncludes(schema, "number", root) && typeof value === "number" && Number.isFinite(value)) return numberSchemaMatches(value, schema);
  if (schemaTypeIncludes(schema, "boolean", root) && typeof value === "boolean") return true;
  if (schemaTypeIncludes(schema, "string", root) && typeof value === "string") return stringSchemaMatches(value, schema);
  return !schema.type;
}

function hasArrayValidationKeywords(schema) {
  return ["minItems", "maxItems", "uniqueItems", "contains", "minContains", "maxContains", "unevaluatedItems"].some((key) => Object.prototype.hasOwnProperty.call(schema, key));
}

function hasObjectValidationKeywords(schema) {
  return [
    "properties",
    "patternProperties",
    "propertyNames",
    "required",
    "additionalProperties",
    "unevaluatedProperties",
    "dependentRequired",
    "dependentSchemas",
    "dependencies",
    "minProperties",
    "maxProperties",
  ].some((key) => Object.prototype.hasOwnProperty.call(schema, key));
}

function hasNumberValidationKeywords(schema) {
  return ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "format"].some((key) => Object.prototype.hasOwnProperty.call(schema, key));
}

function hasStringValidationKeywords(schema) {
  return ["minLength", "maxLength", "pattern", "format", "contentEncoding", "contentMediaType", "contentSchema"].some((key) => Object.prototype.hasOwnProperty.call(schema, key));
}

function schemaValidationAppliesToKind(schema, kind, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!schema || typeof schema !== "object" || schema.type === undefined) return true;
  if (kind === "number") return schemaTypeIncludes(schema, "number", root) || schemaTypeIncludes(schema, "integer", root);
  return schemaTypeIncludes(schema, kind, root);
}

function conditionalBranchForValue(schema, value, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!schema || typeof schema !== "object" || Array.isArray(schema) || !Object.prototype.hasOwnProperty.call(schema, "if")) return null;
  const branch = schemaValueMatches(value, schema.if, root) ? schema.then : schema.else;
  if (branch === true || branch === false) return branch;
  return branch && typeof branch === "object" && !Array.isArray(branch) ? branch : null;
}

function schemaWithoutConditionals(schema, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return null;
  const base = { ...schema };
  delete base.if;
  delete base.then;
  delete base.else;
  return Object.keys(base).length ? base : null;
}

function schemaWithoutUnion(schema, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return null;
  const base = { ...schema };
  delete base.anyOf;
  delete base.oneOf;
  delete base.discriminator;
  return Object.keys(base).length ? base : null;
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
  if (!schema || typeof schema !== "object") return true;
  if (schema.not && schemaValueMatchesAfterCoercion(original, coerced, schema.not, root)) return false;
  if (Array.isArray(schema.allOf)) return schema.allOf.every((option) => schemaValueMatchesAfterCoercion(original, coerced, option, root));
  if (Array.isArray(schema.anyOf)) {
    const option = discriminatorOptionForValue(schema, original, schema.anyOf, root);
    const unionMatches = option ? schemaValueMatchesAfterCoercion(original, coerced, option, root) : schema.anyOf.some((candidate) => schemaValueMatchesAfterCoercion(original, coerced, candidate, root));
    if (!unionMatches) return false;
    const base = schemaWithoutUnion(schema, root);
    return base ? schemaValueMatchesAfterCoercion(original, coerced, base, root) : true;
  }
  if (Array.isArray(schema.oneOf)) {
    const option = discriminatorOptionForValue(schema, original, schema.oneOf, root);
    const unionMatches = option ? schemaValueMatchesAfterCoercion(original, coerced, option, root) : countMatchingSchemasAfterCoercion(original, coerced, schema.oneOf, root) === 1;
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
  if ((schemaTypeIncludes(schema, "array", root) || schema.items || Array.isArray(schema.prefixItems)) && Array.isArray(coerced)) {
    return arraySchemaMatchesAfterCoercion(original, coerced, schema, root);
  }
  if ((schemaTypeIncludes(schema, "object", root) || schema.properties || schema.patternProperties) && isPlainObject(coerced)) {
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
  if (typeof schema.minProperties === "number" && Object.keys(value).length < schema.minProperties) return false;
  if (typeof schema.maxProperties === "number" && Object.keys(value).length > schema.maxProperties) return false;
  const required = Array.isArray(schema.required) ? schema.required : [];
  if (required.some((key) => !(key in value))) return false;
  const originalObject = isPlainObject(original) ? original : {};
  const properties = schema.properties ?? {};
  const allowed = new Set(Object.keys(properties));
  for (const [key, item] of Object.entries(value)) {
    if (!objectAllowsProperty(schema, key, allowed, root)) return false;
    const originalItem = Object.prototype.hasOwnProperty.call(originalObject, key) ? originalObject[key] : item;
    for (const propSchema of objectPropertySchemas(schema, key)) {
      if (!schemaValueMatchesAfterCoercion(originalItem, item, propSchema, root)) return false;
    }
  }
  for (const [key, requiredKeys] of Object.entries(schema.dependentRequired ?? {})) {
    if (key in value && Array.isArray(requiredKeys) && requiredKeys.some((requiredKey) => !(requiredKey in value))) return false;
  }
  for (const [key, dependent] of Object.entries(schema.dependentSchemas ?? {})) {
    if (!(key in value)) continue;
    if (dependent === false) return false;
    if (dependent && typeof dependent === "object" && !Array.isArray(dependent) && !schemaValueMatchesAfterCoercion(original, value, dependent, root)) return false;
  }
  for (const [key, dependent] of Object.entries(schema.dependencies ?? {})) {
    if (!(key in value)) continue;
    if (Array.isArray(dependent) && dependent.some((requiredKey) => !(requiredKey in value))) return false;
    if (dependent === false) return false;
    if (dependent && typeof dependent === "object" && !Array.isArray(dependent) && !schemaValueMatchesAfterCoercion(original, value, dependent, root)) return false;
  }
  return true;
}

function arraySchemaMatchesAfterCoercion(original, value, schema, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (!Array.isArray(value)) return false;
  if (typeof schema.minItems === "number" && value.length < schema.minItems) return false;
  if (typeof schema.maxItems === "number" && value.length > schema.maxItems) return false;
  if (schema.uniqueItems === true && !arrayItemsAreUnique(value)) return false;
  const originalArray = Array.isArray(original) ? original : [];
  if (Object.prototype.hasOwnProperty.call(schema, "contains") && (typeof schema.contains === "boolean" || (schema.contains && typeof schema.contains === "object" && !Array.isArray(schema.contains)))) {
    const matches = value.filter((item, index) => schemaValueMatchesAfterCoercion(originalArray[index], item, schema.contains, root)).length;
    const minContains = typeof schema.minContains === "number" ? schema.minContains : 1;
    if (matches < minContains) return false;
    if (typeof schema.maxContains === "number" && matches > schema.maxContains) return false;
  }
  return value.every((item, index) => schemaValueMatchesAfterCoercion(originalArray[index], item, arrayItemSchema(schema, index, root), root));
}

function mergeAllOfObjectSchema(schema, root = schema) {
  if (!schema || typeof schema !== "object" || !Array.isArray(schema.allOf)) return null;
  const base = { ...schema };
  delete base.allOf;
  const parts = [base, ...schema.allOf.map((option) => resolveJsonSchema(option, root))].filter((part) => part && typeof part === "object" && !Array.isArray(part) && Object.keys(part).length);
  if (!parts.length || parts.some((part) => !isObjectCompositionSchema(part, root))) return null;
  const merged = { type: "object", properties: {}, patternProperties: {} };
  const required = new Set();
  for (const part of parts) {
    if (part.properties && typeof part.properties === "object" && !Array.isArray(part.properties)) {
      for (const [key, value] of Object.entries(part.properties)) {
        merged.properties[key] = intersectJsonSchemas(merged.properties[key], value);
      }
    }
    if (part.patternProperties && typeof part.patternProperties === "object" && !Array.isArray(part.patternProperties)) {
      for (const [key, value] of Object.entries(part.patternProperties)) {
        merged.patternProperties[key] = intersectJsonSchemas(merged.patternProperties[key], value);
      }
    }
    for (const key of Array.isArray(part.required) ? part.required : []) required.add(key);
    if (part.additionalProperties !== undefined) merged.additionalProperties = intersectJsonSchemas(merged.additionalProperties, part.additionalProperties);
    if (part.unevaluatedProperties !== undefined) merged.unevaluatedProperties = intersectJsonSchemas(merged.unevaluatedProperties, part.unevaluatedProperties);
    if (part.propertyNames !== undefined) merged.propertyNames = merged.propertyNames ? { allOf: [merged.propertyNames, part.propertyNames] } : part.propertyNames;
    if (typeof part.minProperties === "number") merged.minProperties = Math.max(merged.minProperties ?? 0, part.minProperties);
    if (typeof part.maxProperties === "number") merged.maxProperties = Math.min(merged.maxProperties ?? Infinity, part.maxProperties);
    if (part.dependentRequired && typeof part.dependentRequired === "object" && !Array.isArray(part.dependentRequired)) {
      merged.dependentRequired ??= {};
      for (const [key, values] of Object.entries(part.dependentRequired)) {
        merged.dependentRequired[key] = [...new Set([...(merged.dependentRequired[key] ?? []), ...(Array.isArray(values) ? values : [])])];
      }
    }
    if (part.dependentSchemas && typeof part.dependentSchemas === "object" && !Array.isArray(part.dependentSchemas)) {
      merged.dependentSchemas ??= {};
      for (const [key, value] of Object.entries(part.dependentSchemas)) {
        merged.dependentSchemas[key] = merged.dependentSchemas[key] ? { allOf: [merged.dependentSchemas[key], value] } : value;
      }
    }
    if (part.dependencies && typeof part.dependencies === "object" && !Array.isArray(part.dependencies)) {
      for (const [key, value] of Object.entries(part.dependencies)) {
        if (Array.isArray(value)) {
          merged.dependentRequired ??= {};
          merged.dependentRequired[key] = [...new Set([...(merged.dependentRequired[key] ?? []), ...value])];
        } else if (value === false || value === true || (value && typeof value === "object" && !Array.isArray(value))) {
          merged.dependentSchemas ??= {};
          merged.dependentSchemas[key] = merged.dependentSchemas[key] ? { allOf: [merged.dependentSchemas[key], value] } : value;
        }
      }
    }
  }
  if (required.size) merged.required = [...required];
  if (!Object.keys(merged.properties).length) delete merged.properties;
  if (!Object.keys(merged.patternProperties).length) delete merged.patternProperties;
  if (merged.maxProperties === Infinity) delete merged.maxProperties;
  return merged;
}

function intersectJsonSchemas(left, right) {
  if (left === undefined) return right;
  if (right === undefined) return left;
  if (left === false || right === false) return false;
  if (left === true) return right;
  if (right === true) return left;
  if (jsonValuesEqual(left, right)) return left;
  return { allOf: [...schemaIntersectionParts(left), ...schemaIntersectionParts(right)] };
}

function schemaIntersectionParts(schema) {
  return schema && typeof schema === "object" && !Array.isArray(schema) && Array.isArray(schema.allOf) && Object.keys(schema).length === 1
    ? schema.allOf
    : [schema];
}

function isObjectCompositionSchema(schema, root = schema) {
  const resolved = resolveJsonSchema(schema, root);
  if (!resolved || typeof resolved !== "object" || Array.isArray(resolved)) return false;
  if (resolved.type !== undefined && !schemaTypeIncludes(resolved, "object", root)) return false;
  return [
    "type",
    "properties",
    "patternProperties",
    "required",
    "additionalProperties",
    "unevaluatedProperties",
    "propertyNames",
    "dependentRequired",
    "dependentSchemas",
    "dependencies",
    "minProperties",
    "maxProperties",
    "$defs",
    "definitions",
    "title",
    "description",
  ].some((key) => Object.prototype.hasOwnProperty.call(resolved, key));
}

function numberSchemaMatches(value, schema) {
  if (typeof schema.minimum === "number" && value < schema.minimum) return false;
  if (typeof schema.maximum === "number" && value > schema.maximum) return false;
  if (typeof schema.exclusiveMinimum === "number" && value <= schema.exclusiveMinimum) return false;
  if (schema.exclusiveMinimum === true && typeof schema.minimum === "number" && value <= schema.minimum) return false;
  if (typeof schema.exclusiveMaximum === "number" && value >= schema.exclusiveMaximum) return false;
  if (schema.exclusiveMaximum === true && typeof schema.maximum === "number" && value >= schema.maximum) return false;
  if (typeof schema.multipleOf === "number" && schema.multipleOf > 0) {
    const quotient = value / schema.multipleOf;
    if (Math.abs(quotient - Math.round(quotient)) > 1e-9) return false;
  }
  if (typeof schema.format === "string" && !numberFormatMatches(value, schema.format)) return false;
  return true;
}

function numberFormatMatches(value, format) {
  if (format === "int32") return Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;
  if (format === "int64") return Number.isInteger(value) && Number.isSafeInteger(value);
  if (format === "float" || format === "double") return Number.isFinite(value);
  return true;
}

function stringSchemaMatches(value, schema) {
  const length = jsonStringLength(value);
  if (typeof schema.minLength === "number" && length < schema.minLength) return false;
  if (typeof schema.maxLength === "number" && length > schema.maxLength) return false;
  if (typeof schema.pattern === "string") {
    try {
      if (!new RegExp(schema.pattern).test(value)) return false;
    } catch {}
  }
  if (typeof schema.format === "string" && !stringFormatMatches(value, schema.format)) return false;
  if (typeof schema.contentEncoding === "string" && !contentEncodingMatches(value, schema.contentEncoding)) return false;
  if (typeof schema.contentMediaType === "string" && !contentMediaTypeMatches(value, schema)) return false;
  if (schema.contentSchema !== undefined && !contentSchemaMatches(value, schema)) return false;
  return true;
}

function jsonStringLength(value) {
  return [...value].length;
}

function stringFormatMatches(value, format) {
  if (format === "email") return validEmailString(value);
  if (format === "uri" || format === "url") {
    if (/\s/.test(value)) return false;
    try {
      const parsed = new URL(value);
      return Boolean(parsed.protocol);
    } catch {
      return false;
    }
  }
  if (format === "uuid") return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  if (format === "date") return validDateString(value);
  if (format === "date-time") return validDateTimeString(value);
  if (format === "time") return validTimeString(value);
  if (format === "hostname") return validHostname(value);
  if (format === "idn-hostname") return validIdnHostname(value);
  if (format === "ipv4") return isIP(value) === 4;
  if (format === "ipv6") return isIP(value) === 6;
  if (format === "idn-email") return validIdnEmail(value);
  if (format === "regex") return validRegexString(value);
  if (format === "json-pointer") return validJsonPointer(value);
  if (format === "uri-reference") return validUriReference(value);
  if (format === "iri") return validIri(value);
  if (format === "iri-reference") return validIriReference(value);
  if (format === "uri-template") return validUriTemplate(value);
  if (format === "relative-json-pointer") return validRelativeJsonPointer(value);
  if (format === "byte") return validBase64String(value);
  if (format === "duration") return validDurationString(value);
  return true;
}

function validDateString(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() + 1 === Number(match[2]) && date.getUTCDate() === Number(match[3]);
}

function validDateTimeString(value) {
  const match = /^(\d{4}-\d{2}-\d{2})[Tt](\d{2}:\d{2}:\d{2}(?:\.\d+)?)([Zz]|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || !validDateString(match[1]) || !validTimeString(match[2]) || !validTimezoneOffset(match[3])) return false;
  return Number.isFinite(Date.parse(value));
}

function validTimeString(value) {
  const match = /^(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?([Zz]|[+-]\d{2}:\d{2})?$/.exec(value);
  if (!match) return false;
  return Number(match[1]) <= 23 && Number(match[2]) <= 59 && Number(match[3]) <= 59 && validTimezoneOffset(match[4] ?? "");
}

function validTimezoneOffset(value) {
  if (!value || value.toUpperCase() === "Z") return true;
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(value);
  return Boolean(match && Number(match[2]) <= 23 && Number(match[3]) <= 59);
}

function validEmailString(value) {
  if (typeof value !== "string" || /\s/.test(value)) return false;
  const at = value.lastIndexOf("@");
  if (at <= 0 || at !== value.indexOf("@") || at === value.length - 1) return false;
  const local = value.slice(0, at);
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  return validHostname(value.slice(at + 1));
}

function validHostname(value) {
  if (typeof value !== "string" || value.length > 253) return false;
  const hostname = value.endsWith(".") ? value.slice(0, -1) : value;
  if (!hostname) return false;
  return hostname.split(".").every((label) => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label));
}

function validIdnHostname(value) {
  if (typeof value !== "string" || /\s/.test(value)) return false;
  try {
    const ascii = new URL(`http://${value}`).hostname;
    return validHostname(ascii);
  } catch {
    return false;
  }
}

function validIdnEmail(value) {
  if (typeof value !== "string" || /\s/.test(value)) return false;
  const at = value.lastIndexOf("@");
  if (at <= 0 || at !== value.indexOf("@") || at === value.length - 1) return false;
  const local = value.slice(0, at);
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  return validIdnHostname(value.slice(at + 1));
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
  return value === "" || (value.startsWith("/") && !/(^|[^~])~([^01]|$)/.test(value));
}

function validUriReference(value) {
  if (typeof value !== "string" || /\s/.test(value)) return false;
  try {
    new URL(value, "http://example.invalid/base");
    return true;
  } catch {
    return false;
  }
}

function validIri(value) {
  if (typeof value !== "string" || /\s/.test(value)) return false;
  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol);
  } catch {
    return false;
  }
}

function validIriReference(value) {
  if (typeof value !== "string" || /\s/.test(value)) return false;
  try {
    new URL(value, "http://example.invalid/base");
    return true;
  } catch {
    return false;
  }
}

function validUriTemplate(value) {
  if (typeof value !== "string" || /\s/.test(value)) return false;
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
  const body = /^[+#./;?&]/.test(text) ? text.slice(1) : text;
  if (!body) return false;
  return body.split(",").every((part) => /^[A-Za-z0-9_][A-Za-z0-9_.%-]*(?::[1-9][0-9]{0,3}|\*)?$/.test(part));
}

function validRelativeJsonPointer(value) {
  if (typeof value !== "string") return false;
  return /^(0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~[01])*)*)?$/.test(value);
}

function validBase64String(value) {
  if (typeof value !== "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) return false;
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
  if (normalized === "base16" || normalized === "hex") return typeof value === "string" && value.length % 2 === 0 && /^[0-9a-f]*$/i.test(value);
  return true;
}

function validBase64UrlString(value) {
  return typeof value === "string"
    && value.length % 4 !== 1
    && /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2}(?:==)?|[A-Za-z0-9_-]{3}=?)?$/.test(value);
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
  if (typeof value !== "string") return null;
  const encoding = typeof schema.contentEncoding === "string" ? schema.contentEncoding.toLowerCase() : "";
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
  return /^P(?:\d+W|(?=\d|T\d)(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?=\d)(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?)$/.test(value);
}

function discriminatorOptionForValue(schema, value, union, root = schema) {
  if (!schema?.discriminator || !isPlainObject(value) || !Array.isArray(union)) return null;
  const propertyName = schema.discriminator.propertyName;
  if (typeof propertyName !== "string" || !propertyName || typeof value[propertyName] !== "string") return null;
  const tag = value[propertyName];
  const mapping = schema.discriminator.mapping;
  if (mapping && typeof mapping === "object" && !Array.isArray(mapping) && typeof mapping[tag] === "string") {
    const mappedRef = mapping[tag];
    const mapped = union.find((option) => schemaOptionMatchesRef(option, mappedRef, root));
    if (mapped) return mapped;
  }
  return union.find((option) => discriminatorPropertyMatches(option, propertyName, tag, root)) ?? null;
}

function schemaOptionMatchesRef(option, ref, root) {
  if (option && typeof option === "object" && !Array.isArray(option) && option.$ref === ref) return true;
  const target = resolveJsonPointer(root, ref);
  const resolved = resolveJsonSchema(option, root);
  return Boolean(target && resolved === target);
}

function discriminatorPropertyMatches(option, propertyName, tag, root) {
  const resolved = resolveJsonSchema(option, root);
  const prop = resolved?.properties?.[propertyName];
  if (!prop || typeof prop !== "object" || Array.isArray(prop)) return false;
  if ("const" in prop && jsonValuesEqual(prop.const, tag)) return true;
  return Array.isArray(prop.enum) && prop.enum.some((item) => jsonValuesEqual(item, tag));
}

function objectSchemaMatches(value, schema, root = schema) {
  schema = resolveJsonSchema(schema, root);
  if (typeof schema.minProperties === "number" && Object.keys(value).length < schema.minProperties) return false;
  if (typeof schema.maxProperties === "number" && Object.keys(value).length > schema.maxProperties) return false;
  const required = Array.isArray(schema.required) ? schema.required : [];
  if (required.some((key) => !(key in value))) return false;
  const properties = schema.properties ?? {};
  const allowed = new Set(Object.keys(properties));
  for (const [key, item] of Object.entries(value)) {
    if (!objectAllowsProperty(schema, key, allowed, root)) return false;
    for (const propSchema of objectPropertySchemas(schema, key)) {
      if (!schemaValueMatches(item, propSchema, root)) return false;
    }
  }
  for (const [key, requiredKeys] of Object.entries(schema.dependentRequired ?? {})) {
    if (key in value && Array.isArray(requiredKeys) && requiredKeys.some((requiredKey) => !(requiredKey in value))) return false;
  }
  for (const [key, dependent] of Object.entries(schema.dependentSchemas ?? {})) {
    if (!(key in value)) continue;
    if (dependent === false) return false;
    if (dependent && typeof dependent === "object" && !Array.isArray(dependent) && !schemaValueMatches(value, dependent, root)) return false;
  }
  for (const [key, dependent] of Object.entries(schema.dependencies ?? {})) {
    if (!(key in value)) continue;
    if (Array.isArray(dependent) && dependent.some((requiredKey) => !(requiredKey in value))) return false;
    if (dependent === false) return false;
    if (dependent && typeof dependent === "object" && !Array.isArray(dependent) && !schemaValueMatches(value, dependent, root)) return false;
  }
  return true;
}

function arraySchemaMatches(value, schema, root = schema) {
  if (typeof schema.minItems === "number" && value.length < schema.minItems) return false;
  if (typeof schema.maxItems === "number" && value.length > schema.maxItems) return false;
  if (schema.uniqueItems === true && !arrayItemsAreUnique(value)) return false;
  if (Object.prototype.hasOwnProperty.call(schema, "contains") && (typeof schema.contains === "boolean" || (schema.contains && typeof schema.contains === "object" && !Array.isArray(schema.contains)))) {
    const matches = value.filter((item) => schemaValueMatches(item, schema.contains, root)).length;
    const minContains = typeof schema.minContains === "number" ? schema.minContains : 1;
    if (matches < minContains) return false;
    if (typeof schema.maxContains === "number" && matches > schema.maxContains) return false;
  }
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
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((item, index) => jsonValuesEqual(item, right[index]));
  }
  if (isPlainObject(left) || isPlainObject(right)) {
    if (!isPlainObject(left) || !isPlainObject(right)) return false;
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index] && jsonValuesEqual(left[key], right[key]));
  }
  return false;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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

function inferCodeLanguageFromContent(content) {
  const languages = codeFenceLanguages(content);
  if (languages.some((language) => ["python", "py"].includes(language))) return "python";
  return inferJavaScriptLanguageFromContent(content);
}

function inferJavaScriptLanguageFromContent(content) {
  const languages = codeFenceLanguages(content);
  if (languages.some((language) => ["typescript", "ts", "tsx", "mts", "cts"].includes(language))) return "typescript";
  if (languages.some((language) => ["javascript", "js", "jsx", "mjs", "cjs"].includes(language))) return "javascript";
  return null;
}

function codeFenceLanguages(content) {
  const languages = [];
  const openingFenceRe = /(?:```|~~~)(?<lang>[A-Za-z0-9_+-]*)/g;
  for (const match of String(content ?? "").matchAll(openingFenceRe)) {
    const language = (match.groups?.lang ?? "").trim().toLowerCase();
    if (language) languages.push(language);
  }
  CODE_FENCE_RE.lastIndex = 0;
  for (const match of String(content ?? "").matchAll(CODE_FENCE_RE)) {
    const language = (match.groups?.lang ?? "").trim().toLowerCase();
    if (language) languages.push(language);
  }
  return languages;
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
    if (["python", "py"].includes(lang)) candidates.push(code);
  }
  return [...new Set(candidates.map((candidate) => candidate.trim()).filter(Boolean))];
}

function repairPythonCandidate(code) {
  let cleaned = stripEndTokens(code).trim().replace(/\r\n/g, "\n");
  return trimToParseablePythonPrefix(cleaned).trim();
}

function trimToParseablePythonPrefix(code) {
  if (isParseablePython(code)) return code;
  const lines = code.split("\n");
  for (let end = lines.length - 1; end > 0; end -= 1) {
    const candidate = lines.slice(0, end).join("\n").trimEnd();
    if (isParseablePython(candidate)) return candidate;
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
  const candidates = javaScriptCodeCandidates(content, language);
  for (const candidate of candidates) {
    const repaired = repairJavaScriptCandidate(candidate, language);
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
    if (javaScriptFenceMatches(lang, language)) candidates.push(code);
  }
  return [...new Set(candidates.map((candidate) => candidate.trim()).filter(Boolean))];
}

function javaScriptFenceMatches(lang, language) {
  if (!lang) return false;
  const js = new Set(["javascript", "js", "jsx", "mjs", "cjs"]);
  const ts = new Set(["typescript", "ts", "tsx", "mts", "cts"]);
  return language === "typescript" ? ts.has(lang) || js.has(lang) : js.has(lang);
}

function repairJavaScriptCandidate(code, language) {
  let cleaned = stripEndTokens(code).trim().replace(/\r\n/g, "\n");
  return trimToParseableJavaScriptPrefix(cleaned, language).trim();
}

function trimToParseableJavaScriptPrefix(code, language) {
  if (isParseableJavaScriptOrTypeScript(code, language)) return code;
  const lines = code.split("\n");
  for (let end = lines.length - 1; end > 0; end -= 1) {
    const candidate = lines.slice(0, end).join("\n").trimEnd();
    if (isParseableJavaScriptOrTypeScript(candidate, language)) return candidate;
  }
  return code;
}

function isParseableJavaScriptOrTypeScript(code, language = "javascript") {
  const text = stripEndTokens(String(code ?? "")).trim();
  if (!text || text.includes("```")) return false;
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
  if (language === "typescript") {
    plugins.unshift("typescript");
  }
  return plugins;
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
  if (policy.retry_malformed_json && !explicitNonJsonFormatRequest(requestPayload) && !stats.repairs.includes("repaired_json_content")) {
    const wantsJson = looksLikeJsonRequest(requestPayload);
    const jsonishContent = jsonLikeResponseContent(content);
    if ((wantsJson && content) || jsonishContent) return "malformed_json";
  }
  if (policy.retry_malformed_python) {
    const language = inferCodeLanguageFromContent(content);
    if (!looksLikeJsonRequest(requestPayload) && content && language === "python" && !isParseablePython(content)) return "malformed_python";
  }
  if (policy.retry_malformed_javascript) {
    const language = inferCodeLanguageFromContent(content);
    if (!looksLikeJsonRequest(requestPayload) && content && ["javascript", "typescript"].includes(language) && !isParseableJavaScriptOrTypeScript(content, language)) return `malformed_${language}`;
  }
  return null;
}

function jsonLikeResponseContent(content) {
  const text = String(content ?? "");
  const trimmed = text.trimStart();
  if (!trimmed) return false;
  return trimmed.startsWith("{") || trimmed.startsWith("[") || JSON_FENCE_RE.test(text);
}

function firstMessage(body) {
  const choice = Array.isArray(body?.choices) ? body.choices[0] : {};
  return choice?.message && typeof choice.message === "object" ? choice.message : {};
}

function looksLikeJsonRequest(payload) {
  return jsonFormatRequest(payload);
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

function applyCors(reply) {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept,OpenAI-Beta,OpenAI-Organization,OpenAI-Project");
  reply.header("Access-Control-Max-Age", "86400");
}

function responseInputToMessages(payload) {
  const messages = [];
  if (typeof payload?.instructions === "string" && payload.instructions.trim()) {
    messages.push({ role: "system", content: payload.instructions });
  }
  const addMessage = (role, content) => {
    const text = normalizeContentValue(content);
    if (text) messages.push({ role, content: text });
  };
  const input = payload?.input;
  if (typeof input === "string") addMessage("user", input);
  else if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === "string") addMessage("user", item);
      else if (item && typeof item === "object") {
        if (item.type === "reasoning") continue;
        if (item.type === "function_call" && typeof item.name === "string") {
          const callId = String(item.call_id ?? item.id ?? `call_${randomUUID().replaceAll("-", "").slice(0, 12)}`);
          messages.push({
            role: "assistant",
            content: "",
            tool_calls: [
              {
                id: callId,
                type: "function",
                function: {
                  name: item.name,
                  arguments: typeof item.arguments === "string" ? item.arguments : JSON.stringify(item.arguments ?? {}),
                },
              },
            ],
          });
          continue;
        }
        if (item.type === "function_call_output") {
          const callId = String(item.call_id ?? item.id ?? `call_${randomUUID().replaceAll("-", "").slice(0, 12)}`);
          messages.push({
            role: "tool",
            tool_call_id: callId,
            content: responseToolOutputContent(item.output ?? item.content ?? ""),
          });
          continue;
        }
        if (typeof item.type === "string" && item.type.endsWith("_call_output")) {
          addMessage("user", responseToolOutputContent(item.output ?? item.content ?? item.result ?? item));
          continue;
        }
        if (typeof item.type === "string" && item.type.endsWith("_call")) {
          addMessage("assistant", responseToolOutputContent(item.action ?? item.input ?? item.arguments ?? item));
          continue;
        }
        const role = ["system", "developer", "user", "assistant"].includes(item.role) ? (item.role === "developer" ? "system" : item.role) : "user";
        addMessage(role, item.content ?? item.text ?? item);
      }
    }
  } else if (input && typeof input === "object") {
    const role = ["system", "developer", "user", "assistant"].includes(input.role) ? (input.role === "developer" ? "system" : input.role) : "user";
    addMessage(role, input.content ?? input.text ?? input);
  }
  if (!messages.length) messages.push({ role: "user", content: "" });
  return messages;
}

function responseToolOutputContent(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const text = normalizeContentValue(value);
    return text || JSON.stringify(value);
  }
  if (typeof value === "object") {
    const text = normalizeContentValue(value);
    return text && text !== "[object Object]" ? text : JSON.stringify(value);
  }
  return String(value);
}

function responsesToolsToChatTools(tools) {
  if (!Array.isArray(tools)) return tools;
  const converted = [];
  for (const tool of tools) {
    if (!tool || typeof tool !== "object") continue;
    if (tool.type === "function" && tool.function && typeof tool.function === "object") {
      converted.push(tool);
      continue;
    }
    if (tool.type === "function" && typeof tool.name === "string" && tool.name) {
      const fn = { name: tool.name };
      for (const key of ["description", "parameters", "strict"]) {
        if (tool[key] !== undefined) fn[key] = tool[key];
      }
      if (fn.parameters === undefined && tool.input_schema !== undefined) fn.parameters = tool.input_schema;
      converted.push({ type: "function", function: fn });
      continue;
    }
    converted.push(tool);
  }
  return converted;
}

function responsesToolChoiceToChatToolChoice(toolChoice) {
  if (!toolChoice || typeof toolChoice !== "object" || Array.isArray(toolChoice)) return toolChoice;
  const functionName = toolChoice.name ?? toolChoice.function?.name;
  if (toolChoice.type === "function" && typeof functionName === "string") {
    return { type: "function", function: { name: functionName } };
  }
  if (["auto", "none", "required"].includes(toolChoice.type)) return toolChoice.type;
  return toolChoice;
}

function responsesTextFormatToChatResponseFormat(format) {
  if (!format || typeof format !== "object" || Array.isArray(format)) return undefined;
  if (format.type === "json_object") return { type: "json_object" };
  if (format.type === "json_schema") {
    if (format.json_schema && typeof format.json_schema === "object") {
      return { type: "json_schema", json_schema: format.json_schema };
    }
    return {
      type: "json_schema",
      json_schema: {
        ...(format.name === undefined ? {} : { name: format.name }),
        ...(format.schema === undefined ? {} : { schema: format.schema }),
        ...(format.strict === undefined ? {} : { strict: format.strict }),
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
  for (const key of ["temperature", "top_p", "stream", "stop", "metadata", "user", "parallel_tool_calls", "frequency_penalty", "presence_penalty", "seed", "logprobs", "top_logprobs", "service_tier", "modalities", "audio", "prediction", "store", "truncation", "include", "background", "safety_identifier"]) {
    if (payload[key] !== undefined) chat[key] = payload[key];
  }
  if (payload.reasoning?.effort !== undefined) chat.reasoning_effort = payload.reasoning.effort;
  if (payload.reasoning?.summary !== undefined) chat.reasoning_summary = payload.reasoning.summary;
  if (payload.reasoning?.generate_summary !== undefined) chat.reasoning_generate_summary = payload.reasoning.generate_summary;
  if (payload.text?.verbosity !== undefined) chat.verbosity = payload.text.verbosity;
  if (payload.top_k !== undefined) chat.top_k = payload.top_k;
  if (payload.tools !== undefined) chat.tools = responsesToolsToChatTools(payload.tools);
  if (payload.tool_choice !== undefined) chat.tool_choice = responsesToolChoiceToChatToolChoice(payload.tool_choice);
  if (payload.response_format !== undefined) chat.response_format = payload.response_format;
  else {
    const responseFormat = responsesTextFormatToChatResponseFormat(payload.text?.format);
    if (responseFormat !== undefined) chat.response_format = responseFormat;
  }
  if (payload.max_output_tokens !== undefined) chat.max_tokens = payload.max_output_tokens;
  else if (payload.max_completion_tokens !== undefined) chat.max_tokens = payload.max_completion_tokens;
  else if (payload.max_tokens !== undefined) chat.max_tokens = payload.max_tokens;
  return chat;
}

function chatCompletionToResponsesBody(chatBody, responsePayload) {
  const choice = Array.isArray(chatBody?.choices) ? (chatBody.choices[0] ?? {}) : {};
  const finishReason = choice.finish_reason;
  const incompleteReason = finishReason === "length" ? "max_output_tokens" : finishReason === "content_filter" ? "content_filter" : null;
  const incomplete = incompleteReason !== null;
  const outputStatus = incomplete ? "incomplete" : "completed";
  const message = firstMessage(chatBody);
  const text = normalizeContentValue(message.content);
  const refusal = normalizeContentValue(message.refusal);
  const output = [];
  if (text) {
    output.push({
      id: `msg_${randomUUID().replaceAll("-", "").slice(0, 24)}`,
      type: "message",
      status: outputStatus,
      role: "assistant",
      content: [{ type: "output_text", text, annotations: [] }],
    });
  }
  if (refusal) {
    output.push({
      id: `msg_${randomUUID().replaceAll("-", "").slice(0, 24)}`,
      type: "message",
      status: outputStatus,
      role: "assistant",
      content: [{ type: "refusal", refusal, annotations: [] }],
    });
  }
  for (const call of Array.isArray(message.tool_calls) ? message.tool_calls : []) {
    if (!call?.function?.name) continue;
    output.push({
      id: call.id ?? `fc_${randomUUID().replaceAll("-", "").slice(0, 24)}`,
      type: "function_call",
      status: outputStatus,
      call_id: call.id ?? `call_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
      name: call.function.name,
      arguments: typeof call.function.arguments === "string" ? call.function.arguments : JSON.stringify(call.function.arguments ?? {}),
    });
  }
  if (!output.length) {
    output.push({
      id: `msg_${randomUUID().replaceAll("-", "").slice(0, 24)}`,
      type: "message",
      status: outputStatus,
      role: "assistant",
      content: [{ type: "output_text", text: "", annotations: [] }],
    });
  }
  const created = typeof chatBody?.created === "number" ? chatBody.created : Math.floor(Date.now() / 1000);
  const id = chatBody?.id ?? `resp_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
  const usage = responsesUsageFromChatUsage(chatBody?.usage);
  return {
    id,
    object: "response",
    created_at: created,
    status: incomplete ? "incomplete" : "completed",
    ...(incomplete ? { incomplete_details: { reason: incompleteReason } } : {}),
    model: chatBody?.model ?? responsePayload?.model,
    ...responsesMetadata(responsePayload, chatBody),
    output,
    output_text: text,
    usage,
    gemma_harness: chatBody?.gemma_harness,
  };
}

function chatCompletionStreamToResponsesSse(body, responsePayload) {
  const id = `resp_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
  const messageId = `msg_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
  const created = Math.floor(Date.now() / 1000);
  let model = responsePayload?.model;
  let outputText = "";
  let refusalText = "";
  let usage;
  let systemFingerprint;
  let incompleteReason = null;
  const toolCalls = new Map();
  const events = [
    sseEvent("response.created", {
      type: "response.created",
      response: { id, object: "response", created_at: created, status: "in_progress", model, output: [], output_text: "" },
    }),
  ];
  for (const event of parseChatCompletionSse(body)) {
    if (event.model) model = event.model;
    if (event.usage) usage = responsesUsageFromChatUsage(event.usage);
    if (event.system_fingerprint) systemFingerprint = event.system_fingerprint;
    const choice = Array.isArray(event.choices) ? event.choices[0] : null;
    const delta = normalizeContentValue(choice?.delta?.content);
    if (delta) {
      outputText += delta;
      events.push(sseEvent("response.output_text.delta", {
        type: "response.output_text.delta",
        item_id: messageId,
        output_index: 0,
        content_index: 0,
        delta,
      }));
    }
    const refusal = normalizeContentValue(choice?.delta?.refusal);
    if (refusal) {
      refusalText += refusal;
      events.push(sseEvent("response.refusal.delta", {
        type: "response.refusal.delta",
        item_id: messageId,
        output_index: 0,
        content_index: 0,
        delta: refusal,
      }));
    }
    for (const call of Array.isArray(choice?.delta?.tool_calls) ? choice.delta.tool_calls : []) {
      const index = Number.isInteger(call.index) ? call.index : toolCalls.size;
      const current = toolCalls.get(index) ?? { id: "", name: "", arguments: "" };
      if (call.id) current.id = call.id;
      if (call.function?.name) current.name = call.function.name;
      if (call.function?.arguments) current.arguments += call.function.arguments;
      toolCalls.set(index, current);
    }
    if (choice?.finish_reason === "length") incompleteReason = "max_output_tokens";
    else if (choice?.finish_reason === "content_filter") incompleteReason = "content_filter";
  }
  const status = incompleteReason ? "incomplete" : "completed";
  const output = [];
  if (outputText || refusalText || !toolCalls.size) {
    output.push({
      id: messageId,
      type: "message",
      status,
      role: "assistant",
      content: refusalText
        ? [{ type: "refusal", refusal: refusalText, annotations: [] }]
        : [{ type: "output_text", text: outputText, annotations: [] }],
    });
  }
  for (const call of [...toolCalls.values()]) {
    if (!call.name) continue;
    const callId = call.id || `call_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
    const item = {
      id: callId,
      type: "function_call",
      status,
      call_id: callId,
      name: call.name,
      arguments: call.arguments || "{}",
    };
    output.push(item);
    events.push(sseEvent("response.output_item.added", {
      type: "response.output_item.added",
      output_index: output.length - 1,
      item,
    }));
  }
  const response = {
    id,
    object: "response",
    created_at: created,
    status,
    ...(incompleteReason ? { incomplete_details: { reason: incompleteReason } } : {}),
    model,
    ...responsesMetadata(responsePayload, systemFingerprint ? { system_fingerprint: systemFingerprint } : {}),
    output,
    output_text: outputText,
    ...(usage ? { usage } : {}),
  };
  if (outputText) {
    events.push(sseEvent("response.output_text.done", {
      type: "response.output_text.done",
      item_id: messageId,
      output_index: 0,
      content_index: 0,
      text: outputText,
    }));
  }
  if (refusalText) {
    events.push(sseEvent("response.refusal.done", {
      type: "response.refusal.done",
      item_id: messageId,
      output_index: 0,
      content_index: 0,
      refusal: refusalText,
    }));
  }
  events.push(sseEvent(status === "completed" ? "response.completed" : "response.incomplete", {
    type: status === "completed" ? "response.completed" : "response.incomplete",
    response,
  }));
  events.push(sseEvent("response.done", { type: "response.done", response }));
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
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function responsesMetadata(responsePayload, chatBody = {}) {
  return {
    ...(responsePayload?.parallel_tool_calls !== undefined ? { parallel_tool_calls: responsePayload.parallel_tool_calls } : {}),
    ...(responsePayload?.previous_response_id !== undefined ? { previous_response_id: responsePayload.previous_response_id } : {}),
    ...(responsePayload?.truncation !== undefined ? { truncation: responsePayload.truncation } : {}),
    ...(responsePayload?.max_output_tokens !== undefined ? { max_output_tokens: responsePayload.max_output_tokens } : {}),
    ...(responsePayload?.store !== undefined ? { store: responsePayload.store } : {}),
    ...(responsePayload?.tool_choice !== undefined ? { tool_choice: responsePayload.tool_choice } : {}),
    ...(chatBody?.service_tier !== undefined ? { service_tier: chatBody.service_tier } : {}),
    ...(chatBody?.system_fingerprint !== undefined ? { system_fingerprint: chatBody.system_fingerprint } : {}),
  };
}

function responsesUsageFromChatUsage(usage) {
  if (!usage || typeof usage !== "object") return undefined;
  return {
    input_tokens: usage.prompt_tokens ?? usage.input_tokens ?? 0,
    output_tokens: usage.completion_tokens ?? usage.output_tokens ?? 0,
    total_tokens: usage.total_tokens ?? 0,
    ...(usage.prompt_tokens_details ? { input_tokens_details: usage.prompt_tokens_details } : {}),
    ...(usage.completion_tokens_details ? { output_tokens_details: usage.completion_tokens_details } : {}),
  };
}

function completionPromptText(prompt) {
  if (typeof prompt === "string") return prompt;
  if (Array.isArray(prompt)) {
    if (prompt.every((item) => typeof item === "string")) return prompt.join("\n");
    if (prompt.every((item) => typeof item === "number")) return prompt.join(" ");
    return prompt.map(completionPromptText).filter(Boolean).join("\n");
  }
  return normalizeContentValue(prompt);
}

function completionsPayloadToChatPayload(payload) {
  const chat = {
    model: payload.model,
    messages: [{ role: "user", content: completionPromptText(payload.prompt ?? "") }],
  };
  for (const key of ["temperature", "top_p", "stop", "user", "n", "frequency_penalty", "presence_penalty", "seed", "logprobs", "top_logprobs", "response_format"]) {
    if (payload[key] !== undefined) chat[key] = payload[key];
  }
  if (payload.max_tokens !== undefined) chat.max_tokens = payload.max_tokens;
  else if (payload.max_completion_tokens !== undefined) chat.max_tokens = payload.max_completion_tokens;
  else if (payload.max_output_tokens !== undefined) chat.max_tokens = payload.max_output_tokens;
  return chat;
}

function chatCompletionToCompletionsBody(chatBody, completionPayload) {
  const created = chatBody?.created ?? Math.floor(Date.now() / 1000);
  return {
    id: chatBody?.id ?? `cmpl_${randomUUID().replaceAll("-", "").slice(0, 24)}`,
    object: "text_completion",
    created,
    model: chatBody?.model ?? completionPayload?.model,
    choices: (Array.isArray(chatBody?.choices) ? chatBody.choices : []).map((choice, index) => ({
      text: normalizeContentValue(choice?.message?.content),
      index: choice?.index ?? index,
      logprobs: choice?.logprobs ?? null,
      finish_reason: choice?.finish_reason ?? null,
    })),
    usage: chatBody?.usage,
    gemma_harness: chatBody?.gemma_harness,
  };
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
    if (requestPayload.stream === true) {
      const upstream = await upstreamRequest(state, "POST", "/v1/chat/completions", upstreamPayload);
      writeJsonl(state.logJsonl, {
        path: request.url,
        model: requestPayload.model,
        elapsed_ms: Number((performance.now() - started).toFixed(3)),
        attempts: [{ attempt: 1, status: upstream.status, retry_reason: "" }],
        parse: { skipped: "streaming_passthrough" },
      });
      reply.code(upstream.status).headers({ "content-type": upstream.headers["content-type"] ?? upstream.headers["Content-Type"] ?? "application/json" });
      return reply.send(upstream.body);
    }
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

  app.post("/v1/responses", async (request, reply) => {
    const started = performance.now();
    const requestPayload = request.body;
    if (!requestPayload || typeof requestPayload !== "object" || Array.isArray(requestPayload)) {
      reply.code(400);
      return { error: { message: "request body must be a JSON object" } };
    }
    const chatPayload = responsesPayloadToChatPayload(requestPayload);
    const upstreamPayload = prepareUpstreamPayload(chatPayload, state.policy);
    if (requestPayload.stream === true) {
      const upstream = await upstreamRequest(state, "POST", "/v1/chat/completions", upstreamPayload);
      writeJsonl(state.logJsonl, {
        path: request.url,
        model: requestPayload.model,
        elapsed_ms: Number((performance.now() - started).toFixed(3)),
        attempts: [{ attempt: 1, status: upstream.status, retry_reason: "" }],
        parse: { adapter: "responses_stream_to_chat_completions" },
      });
      const contentType = upstream.status >= 400 ? (upstream.headers["content-type"] ?? "application/json") : "text/event-stream";
      reply.code(upstream.status).headers({ "content-type": contentType });
      return reply.send(upstream.status >= 400 ? upstream.body : chatCompletionStreamToResponsesSse(upstream.body, requestPayload));
    }
    const attempts = [];
    let finalStatus = 502;
    let finalBody = Buffer.alloc(0);
    let parseStats = {};

    for (let attempt = 0; attempt < Math.max(1, Number(state.policy.max_retries) + 1); attempt += 1) {
      const upstream = await upstreamRequest(state, "POST", "/v1/chat/completions", upstreamPayload);
      finalStatus = upstream.status;
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
      const processed = processChatCompletion(upstreamJson, chatPayload, state.policy);
      parseStats = processed.stats;
      const retryReason = retryReasonForProcessed(processed.body, chatPayload, parseStats, state.policy);
      attempts.push({ ...attemptInfo, retry_reason: retryReason ?? "" });
      if (retryReason && attempt < state.policy.max_retries) continue;
      finalBody = Buffer.from(JSON.stringify(chatCompletionToResponsesBody(processed.body, requestPayload)));
      finalStatus = upstream.status;
      break;
    }

    writeJsonl(state.logJsonl, {
      path: request.url,
      model: requestPayload.model,
      elapsed_ms: Number((performance.now() - started).toFixed(3)),
      attempts,
      parse: { ...parseStats, adapter: "responses_to_chat_completions" },
    });
    reply.code(finalStatus).headers({ "content-type": "application/json" });
    return reply.send(finalBody);
  });

  app.post("/v1/completions", async (request, reply) => {
    const started = performance.now();
    const requestPayload = request.body;
    if (!requestPayload || typeof requestPayload !== "object" || Array.isArray(requestPayload)) {
      reply.code(400);
      return { error: { message: "request body must be a JSON object" } };
    }
    if (requestPayload.stream === true) {
      const upstream = await upstreamRequest(state, "POST", "/v1/completions", prepareUpstreamPayload(requestPayload, state.policy));
      writeJsonl(state.logJsonl, {
        path: request.url,
        model: requestPayload.model,
        elapsed_ms: Number((performance.now() - started).toFixed(3)),
        attempts: [{ attempt: 1, status: upstream.status, retry_reason: "" }],
        parse: { skipped: "legacy_completions_streaming_passthrough" },
      });
      reply.code(upstream.status).headers({ "content-type": upstream.headers["content-type"] ?? upstream.headers["Content-Type"] ?? "application/json" });
      return reply.send(upstream.body);
    }
    const chatPayload = completionsPayloadToChatPayload(requestPayload);
    const upstreamPayload = prepareUpstreamPayload(chatPayload, state.policy);
    const attempts = [];
    let finalStatus = 502;
    let finalBody = Buffer.alloc(0);
    let parseStats = {};

    for (let attempt = 0; attempt < Math.max(1, Number(state.policy.max_retries) + 1); attempt += 1) {
      const upstream = await upstreamRequest(state, "POST", "/v1/chat/completions", upstreamPayload);
      finalStatus = upstream.status;
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
      const processed = processChatCompletion(upstreamJson, chatPayload, state.policy);
      parseStats = processed.stats;
      const retryReason = retryReasonForProcessed(processed.body, chatPayload, parseStats, state.policy);
      attempts.push({ ...attemptInfo, retry_reason: retryReason ?? "" });
      if (retryReason && attempt < state.policy.max_retries) continue;
      finalBody = Buffer.from(JSON.stringify(chatCompletionToCompletionsBody(processed.body, requestPayload)));
      finalStatus = upstream.status;
      break;
    }

    writeJsonl(state.logJsonl, {
      path: request.url,
      model: requestPayload.model,
      elapsed_ms: Number((performance.now() - started).toFixed(3)),
      attempts,
      parse: { ...parseStats, adapter: "completions_to_chat_completions" },
    });
    reply.code(finalStatus).headers({ "content-type": "application/json" });
    return reply.send(finalBody);
  });

  app.all("*", async (request, reply) => {
    if (request.method === "OPTIONS") {
      applyCors(reply);
      reply.code(204);
      return "";
    }
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
    policy: DEFAULT_POLICY_PATH,
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
  console.log(`gemma4 harness listening on http://${args.host}:${args.port} -> ${state.upstream.replace(/\/$/, "")} policy=${policy.name}:${policy.version}`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
