#!/usr/bin/env node
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildServer,
  loadPolicy,
  prepareUpstreamPayload,
  processChatCompletion,
} from "./proxy.mjs";

const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_weather",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          location: { type: "string" },
          units: { type: "string", default: "celsius" },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculator",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: { expression: { type: "string" } },
        required: ["expression"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "web_search",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: { query: { type: "string" }, max_results: { type: "integer", default: 5 } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_calendar_event",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          date: { type: "string" },
          time: { type: "string" },
          duration_minutes: { type: "integer" },
        },
        required: ["title", "date", "time"],
      },
    },
  },
];

function request(user, { tools = TOOLS, system = "You are helpful." } = {}) {
  return {
    model: "gemma-4-E2B-it-qat-UD-Q4_K_XL",
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    tools: structuredClone(tools),
    temperature: 0,
  };
}

function response(content, toolCalls = []) {
  return { choices: [{ message: { role: "assistant", content, tool_calls: toolCalls } }] };
}

function processed(content, req, toolCalls = []) {
  const result = processChatCompletion(response(content, toolCalls), req, loadPolicy());
  return { message: result.body.choices[0].message, stats: result.stats };
}

function args(call) {
  return JSON.parse(call.function.arguments);
}

async function test(name, fn) {
  await fn();
  console.log(`PASS ${name}`);
}

await test("01 sampler override", () => {
  const req = request("hello");
  const out = prepareUpstreamPayload(req, loadPolicy());
  assert.equal(out.temperature, 1);
  assert.equal(out.top_p, 0.95);
  assert.equal(out.top_k, 64);
  assert.equal(req.temperature, 0);
});

await test("02 tagged tool_call", () => {
  const { message } = processed('<tool_call>{"name":"get_weather","arguments":{"location":"Berlin"}}</tool_call>', request("What's the weather in Berlin?"));
  assert.equal(message.tool_calls.length, 1);
  assert.equal(message.tool_calls[0].function.name, "get_weather");
});

await test("03 function syntax", () => {
  const { message } = processed('get_weather(location="Tokyo", units="fahrenheit")', request("What's the temperature in Tokyo in Fahrenheit?"));
  assert.equal(message.tool_calls[0].function.name, "get_weather");
  assert.equal(args(message.tool_calls[0]).units, "fahrenheit");
});

await test("04 escaped JSON tool", () => {
  const { message } = processed('{\\"name\\":\\"get_weather\\",\\"arguments\\":{\\"location\\":\\"Paris\\"}}', request("What's the weather in Paris?"));
  assert.equal(message.tool_calls[0].function.name, "get_weather");
});

await test("05 batch JSON calls", () => {
  const content = '{"tool_calls":[{"function":{"name":"web_search","arguments":{"query":"population of Iceland"}}},{"function":{"name":"calculator","arguments":{"expression":"2%"}}}]}';
  const { message } = processed(content, request("Search for the population of Iceland and calculate what 2% of it would be."));
  assert.deepEqual(message.tool_calls.map((call) => call.function.name), ["web_search", "calculator"]);
});

await test("06 existing call arg normalization", () => {
  const call = { function: { name: "create_calendar_event", arguments: '{"title":"standup","duration_minutes":"30","junk":true}' } };
  const { message } = processed("", request("Schedule a standup at 9:30."), [call]);
  assert.equal(args(message.tool_calls[0]).duration_minutes, 30);
  assert.equal("junk" in args(message.tool_calls[0]), false);
});

await test("07 direct simple math guard", () => {
  const call = { function: { name: "calculator", arguments: '{"expression":"200 * 0.15"}' } };
  const { message } = processed("", request("What is 15% of 200?"), [call]);
  assert.deepEqual(message.tool_calls, []);
  assert.equal(message.content, "30");
});

await test("08 synthesize weather call", () => {
  const { message } = processed("I need to use the weather tool.", request("What's the temperature in Tokyo in Fahrenheit?"));
  assert.equal(message.tool_calls[0].function.name, "get_weather");
  assert.equal(args(message.tool_calls[0]).units, "fahrenheit");
});

await test("09 synthesize missing calculator batch", () => {
  const call = { function: { name: "web_search", arguments: '{"query":"population of Iceland"}' } };
  const { message } = processed("", request("Search for the population of Iceland and calculate what 2% of it would be."), [call]);
  assert.deepEqual(message.tool_calls.map((item) => item.function.name), ["web_search", "calculator"]);
});

await test("10 data JSON numeric coercion", () => {
  const { message } = processed('{"price":"$1,299","battery_life_hours":"10 hours","zip":"92101"}', request("Extract. Fields: price, battery_life_hours, zip", { tools: [], system: "Output valid JSON with exact fields." }));
  const data = JSON.parse(message.content);
  assert.equal(data.price, 1299);
  assert.equal(data.battery_life_hours, 10);
  assert.equal(data.zip, "92101");
});

await test("11 fenced JSON extraction", () => {
  const { message } = processed('```json\n{"total":"$14.66"}\n```', request("Extract. Fields: total", { tools: [], system: "Output valid JSON." }));
  assert.equal(JSON.parse(message.content).total, 14.66);
});

await test("12 think stripping", () => {
  const { message } = processed("<think>private</think>\nFinal answer.", request("Say final.", { tools: [] }));
  assert.equal(message.content, "Final answer.");
});

await test("13 reasonmath canonical answer", () => {
  const content = "Work...\nANSWER: Win if you switch to Door 2: 3/4; Win if you stay with Door 1: 1/4";
  const { message } = processed(content, request("Should I switch or stay?", { tools: [] }));
  assert.match(message.content, /ANSWER: switch=0.75; stay=0.25$/);
});

await test("14 invalid tool ignored", () => {
  const { message } = processed('<tool_call>{"name":"unknown_tool","arguments":{}}</tool_call>', request("Use a tool."));
  assert.deepEqual(message.tool_calls, []);
});

await test("15 dedupe calls", () => {
  const content = '<tool_call>{"name":"get_weather","arguments":{"location":"Berlin"}}</tool_call><tool_call>{"name":"get_weather","arguments":{"location":"Berlin"}}</tool_call>';
  const { message } = processed(content, request("What's the weather in Berlin?"));
  assert.equal(message.tool_calls.length, 1);
});

await test("16 request messages unchanged", () => {
  const req = request("What's the weather in Berlin?");
  const before = structuredClone(req.messages);
  processed('<tool_call>{"name":"get_weather","arguments":{"location":"Berlin"}}</tool_call>', req);
  assert.deepEqual(req.messages, before);
});

await test("17 fenced python extraction", () => {
  const content = "Here is the implementation:\n```python\ndef add(a, b):\n    return a + b\n```\nExplanation follows.";
  const { message, stats } = processed(content, request("Write Python. Implement add(a, b).", { tools: [] }));
  assert.equal(message.content, "def add(a, b):\n    return a + b");
  assert.ok(stats.repairs.includes("extracted_python_code"));
});

await test("18 prose python extraction", () => {
  const content = "Sure.\nfrom collections import Counter\n\ndef count_items(items):\n    return Counter(items)\n\nExplanation: this counts values.";
  const { message } = processed(content, request("Write Python. Implement count_items(items).", { tools: [] }));
  assert.equal(message.content, "from collections import Counter\n\ndef count_items(items):\n    return Counter(items)");
});

await test("19 BenchLoop coding output is not replaced with answer key", () => {
  const req = request("Write a Python function `fib(n: int) -> int` that returns the nth Fibonacci number using memoization.", { tools: [] });
  const malformed = "Here is code:\n```python\ndef fib(n):\n    return";
  const result = processChatCompletion(response(malformed), req, loadPolicy(null));
  const content = result.body.choices[0].message.content;
  assert.equal(result.stats.repairs.includes("synthesized_benchloop_coding_solution"), false);
  assert.equal(content.includes("memo = {0: 0, 1: 1}"), false);
});

await test("20 malformed Python is not extracted", () => {
  const content = "```python\ndef add(a, b):\n    return a +\n```";
  const { message, stats } = processed(content, request("Write Python. Implement add(a, b).", { tools: [] }));
  assert.equal(message.content, content);
  assert.equal(stats.repairs.includes("extracted_python_code"), false);
});

await test("21 fenced JavaScript AST extraction", () => {
  const content = "Here you go:\n```javascript\nexport function add(a, b) {\n  return a + b;\n}\n```\nExplanation follows.";
  const { message, stats } = processed(content, request("Write JavaScript. Implement add(a, b).", { tools: [] }));
  assert.equal(message.content, "export function add(a, b) {\n  return a + b;\n}");
  assert.ok(stats.repairs.includes("extracted_javascript_code"));
});

await test("22 fenced TypeScript AST extraction", () => {
  const content = "```ts\nexport function identity<T>(value: T): T {\n  return value;\n}\n```";
  const { message, stats } = processed(content, request("Write TypeScript. Implement identity<T>(value: T): T.", { tools: [] }));
  assert.equal(message.content, "export function identity<T>(value: T): T {\n  return value;\n}");
  assert.ok(stats.repairs.includes("extracted_typescript_code"));
});

await test("23 malformed TypeScript is not extracted", () => {
  const content = "```ts\nexport function identity<T>(value: T): T {\n  return\n```";
  const { message, stats } = processed(content, request("Write TypeScript. Implement identity<T>(value: T): T.", { tools: [] }));
  assert.equal(message.content, content);
  assert.equal(stats.repairs.includes("extracted_typescript_code"), false);
});

await test("24 scalar JSON coercion", () => {
  const req = request("Extract. Fields: needs_projector, needs_catering, referral", { tools: [], system: "Output valid JSON with exact fields." });
  const result = processChatCompletion(response('{"needs_projector":"We need a projector","needs_catering":"No catering needed","referral":"not mentioned"}'), req, loadPolicy(null, { coerce_scalar_json_values: true }));
  const data = JSON.parse(result.body.choices[0].message.content);
  assert.equal(data.needs_projector, true);
  assert.equal(data.needs_catering, false);
  assert.equal(data.referral, null);
});

await test("25 reasonmath answer is not inferred from prompt alone", () => {
  const req = request("In a 4 door game, should I switch or stay after the host opens Door 3 and Door 4?", { tools: [] });
  const content = "Work...\nThe alternative door has the accumulated three-quarters chance, while the original has one-quarter.";
  const result = processChatCompletion(response(content), req, loadPolicy(null));
  assert.equal(result.body.choices[0].message.content.includes("ANSWER: switch=0.75; stay=0.25"), false);
});

await test("26 PIN count is not inferred from prompt alone", () => {
  const req = request("A 4-digit PIN must start non-zero, use different digits, and be strictly increasing. What is the count?", { tools: [] });
  const content = "Choose any 4 digits from 1 through 9 in increasing order.";
  const result = processChatCompletion(response(content), req, loadPolicy(null));
  assert.equal(result.body.choices[0].message.content.includes("ANSWER: count=126"), false);
});

await test("27 clarification tool synthesis", () => {
  const req = request("Schedule the team standup next Monday at 9:30 for Alex and Jamie.", { tools: TOOLS });
  const result = processChatCompletion(response('What is the full date of "next Monday"?'), req, loadPolicy(null, { synthesize_tool_calls_from_prompt_on_clarification: true }));
  const call = result.body.choices[0].message.tool_calls[0];
  assert.equal(call.function.name, "create_calendar_event");
  assert.equal(args(call).date, "next Monday");
});

await test("28 Fastify proxy endpoint", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.equal(payload.temperature, 1);
        assert.equal(payload.top_p, 0.95);
        assert.equal(payload.top_k, 64);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response('<tool_call>{"name":"get_weather","arguments":{"location":"Berlin"}}</tool_call>')));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const logJsonl = path.join(os.tmpdir(), `gemma4-fastify-harness-${Date.now()}.jsonl`);
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
    logJsonl,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request("What's the weather in Berlin?")),
    });
    const json = await res.json();
    assert.equal(json.choices[0].message.tool_calls[0].function.name, "get_weather");
    assert.equal(fs.existsSync(logJsonl), true);
  } finally {
    await app.close();
    await upstream.close();
    fs.rmSync(logJsonl, { force: true });
  }
});

await test("29 Fastify retries malformed Python", async () => {
  let calls = 0;
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then(() => {
        calls += 1;
        res.setHeader("content-type", "application/json");
        const content = calls === 1 ? "Here is code:\n```python\ndef add(a, b):\n    return a +" : "```python\ndef add(a, b):\n    return a + b\n```";
        res.end(JSON.stringify(response(content)));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(null, { retry_malformed_python: true, max_retries: 1 }),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request("Write Python. Implement add(a, b).", { tools: [] })),
    });
    const json = await res.json();
    assert.equal(calls, 2);
    assert.equal(json.choices[0].message.content, "def add(a, b):\n    return a + b");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("30 Fastify retries malformed TypeScript", async () => {
  let calls = 0;
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then(() => {
        calls += 1;
        res.setHeader("content-type", "application/json");
        const content =
          calls === 1
            ? "```ts\nexport function identity<T>(value: T): T {\n  return value +\n```"
            : "```ts\nexport function identity<T>(value: T): T {\n  return value;\n}\n```";
        res.end(JSON.stringify(response(content)));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(null, { retry_malformed_javascript: true, max_retries: 1 }),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request("Write TypeScript. Implement identity<T>(value: T): T.", { tools: [] })),
    });
    const json = await res.json();
    assert.equal(calls, 2);
    assert.equal(json.choices[0].message.content, "export function identity<T>(value: T): T {\n  return value;\n}");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("31 Fastify always calls upstream for BenchLoop coding prompts", async () => {
  let calls = 0;
  const upstream = await startUpstreamServer((_req, res) => {
    calls += 1;
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(response("def fib(n: int) -> int:\n    return n")));
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(null),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request("Write a Python function `fib(n: int) -> int` that returns the nth Fibonacci number using memoization.", { tools: [] })),
    });
    const json = await res.json();
    assert.equal(calls, 1);
    assert.match(json.choices[0].message.content, /def fib/);
    assert.equal(json.gemma_harness?.preflight, undefined);
    assert.equal(json.gemma_harness?.repairs?.includes("preflight_benchloop_coding_solution"), false);
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("32 JSON ts field does not trigger TypeScript retry", async () => {
  let calls = 0;
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then(() => {
        calls += 1;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response('{"ts":"2026-06-07T00:00:00Z","level":"INFO"}')));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(null, { retry_malformed_javascript: true, max_retries: 2 }),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request("Extract fields: ts, level", { tools: [], system: "Output valid JSON with exact fields." })),
    });
    const json = await res.json();
    assert.equal(calls, 1);
    assert.equal(JSON.parse(json.choices[0].message.content).ts, "2026-06-07T00:00:00Z");
  } finally {
    await app.close();
    await upstream.close();
  }
});

async function startUpstreamServer(handler) {
  const server = http.createServer(handler);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  return {
    port: server.address().port,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
