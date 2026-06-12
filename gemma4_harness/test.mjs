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

await test("01b max_completion_tokens maps to max_tokens", () => {
  const req = { ...request("hello", { tools: [] }), max_completion_tokens: 77 };
  const out = prepareUpstreamPayload(req, loadPolicy());
  assert.equal(out.max_tokens, 77);
  assert.equal(out.max_completion_tokens, undefined);
  assert.equal(req.max_completion_tokens, 77);
});

await test("01c developer chat messages map to system upstream", () => {
  const req = {
    model: "gemma-test",
    messages: [
      { role: "developer", content: "Prefer compact answers." },
      { role: "user", content: "Hello." },
    ],
  };
  const out = prepareUpstreamPayload(req, loadPolicy());
  assert.deepEqual(out.messages, [
    { role: "system", content: "Prefer compact answers." },
    { role: "user", content: "Hello." },
  ]);
  assert.equal(req.messages[0].role, "developer");
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

await test("03b function syntax requires exact tool names", () => {
  const content = 'weather(location="Tokyo", units="fahrenheit")';
  const { message } = processed(content, request("What's the temperature in Tokyo in Fahrenheit?"));
  assert.deepEqual(message.tool_calls, []);
  assert.equal(message.content, content);
});

await test("04 escaped JSON tool", () => {
  const { message } = processed('{\\"name\\":\\"get_weather\\",\\"arguments\\":{\\"location\\":\\"Paris\\"}}', request("What's the weather in Paris?"));
  assert.equal(message.tool_calls[0].function.name, "get_weather");
});

await test("05 batch JSON calls", () => {
  const content = '{"tool_calls":[{"function":{"name":"web_search","arguments":{"query":"current population estimate"}}},{"function":{"name":"calculator","arguments":{"expression":"result * 0.02"}}}]}';
  const { message } = processed(content, request("Search for a current population estimate and calculate 2% of it."));
  assert.deepEqual(message.tool_calls.map((call) => call.function.name), ["web_search", "calculator"]);
});

await test("06 existing call arg normalization", () => {
  const call = { function: { name: "create_calendar_event", arguments: '{"title":"standup","duration_minutes":"30","junk":true}' } };
  const { message } = processed("", request("Schedule a standup at 9:30."), [call]);
  assert.equal(args(message.tool_calls[0]).duration_minutes, 30);
  assert.equal("junk" in args(message.tool_calls[0]), false);
});

await test("07 no prompt-derived direct answer", () => {
  const call = { function: { name: "calculator", arguments: '{"expression":"300 * 0.09"}' } };
  const { message } = processed("", request("What is 9% of 300?"), [call]);
  assert.equal(message.content, "");
  assert.equal(message.tool_calls[0].function.name, "calculator");
  assert.equal(args(message.tool_calls[0]).expression, "300 * 0.09");
});

await test("08 no prompt-derived weather call", () => {
  const { message } = processed("I need to use the weather tool.", request("What's the temperature in Tokyo in Fahrenheit?"));
  assert.equal(message.content, "I need to use the weather tool.");
  assert.deepEqual(message.tool_calls, []);
});

await test("09 no prompt-derived missing batch call", () => {
  const call = { function: { name: "web_search", arguments: '{"query":"current population estimate"}' } };
  const { message } = processed("", request("Search for a current population estimate and calculate 2% of it."), [call]);
  assert.deepEqual(message.tool_calls.map((item) => item.function.name), ["web_search"]);
});

await test("10 data JSON repair preserves untyped scalar strings", () => {
  const { message } = processed('{"price":"$1,299","battery_life_hours":"10 hours","zip":"92101"}', request("Extract. Fields: price, battery_life_hours, zip", { tools: [], system: "Output valid JSON with exact fields." }));
  const data = JSON.parse(message.content);
  assert.equal(data.price, "$1,299");
  assert.equal(data.battery_life_hours, "10 hours");
  assert.equal(data.zip, "92101");
});

await test("11 fenced JSON extraction", () => {
  const { message } = processed('```json\n{"total":"$14.66"}\n```', request("Extract. Fields: total", { tools: [], system: "Output valid JSON." }));
  assert.equal(JSON.parse(message.content).total, "$14.66");
});

await test("12 think stripping", () => {
  const { message } = processed("<think>private</think>\nFinal answer.", request("Say final.", { tools: [] }));
  assert.equal(message.content, "Final answer.");
});

await test("13 answer text is not augmented", () => {
  const content = "Work...\nFinal answer: option A has probability 0.75 and option B has probability 0.25.";
  const { message } = processed(content, request("Compare the two options.", { tools: [] }));
  assert.equal(message.content, content);
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

await test("18 prose python is not extracted", () => {
  const content = "Sure.\nfrom collections import Counter\n\ndef count_items(items):\n    return Counter(items)\n\nExplanation: this counts values.";
  const { message, stats } = processed(content, request("Write Python. Implement count_items(items).", { tools: [] }));
  assert.equal(message.content, content);
  assert.equal(stats.repairs.includes("extracted_python_code"), false);
});

await test("19 BenchLoop coding output is not replaced with answer key", () => {
  const req = request("Write a Python function `fib(n: int) -> int` that returns the nth Fibonacci number using memoization.", { tools: [] });
  const malformed = "Here is code:\n```python\ndef fib(n):\n    return";
  const result = processChatCompletion(response(malformed), req, loadPolicy(null));
  const content = result.body.choices[0].message.content;
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

await test("24 untyped scalar JSON values preserve source text", () => {
  const req = request("Extract. Fields: needs_projector, needs_catering, referral", { tools: [], system: "Output valid JSON with exact fields." });
  const result = processChatCompletion(response('{"needs_projector":"We need a projector","needs_catering":"No catering needed","referral":"not mentioned"}'), req, loadPolicy());
  const data = JSON.parse(result.body.choices[0].message.content);
  assert.equal(data.needs_projector, "We need a projector");
  assert.equal(data.needs_catering, "No catering needed");
  assert.equal(data.referral, "not mentioned");
});

await test("25 probability prose is not reformatted", () => {
  const req = request("Explain the probabilities for two choices.", { tools: [] });
  const content = "Work...\nThe alternative choice has the accumulated three-quarters chance, while the original has one-quarter.";
  const result = processChatCompletion(response(content), req, loadPolicy(null));
  assert.equal(result.body.choices[0].message.content, content);
});

await test("26 combinatorics prose is not reformatted", () => {
  const req = request("Explain the count for a constrained code.", { tools: [] });
  const content = "Choose the required symbols, then place them in the only valid order.";
  const result = processChatCompletion(response(content), req, loadPolicy(null));
  assert.equal(result.body.choices[0].message.content, content);
});

await test("27 clarification does not synthesize a tool call", () => {
  const req = request("Schedule the design review for next week at 10:00.", { tools: TOOLS });
  const result = processChatCompletion(response('Which calendar date should I use?'), req, loadPolicy(null));
  assert.equal(result.body.choices[0].message.content, 'Which calendar date should I use?');
  assert.deepEqual(result.body.choices[0].message.tool_calls, []);
});

await test("28 harness proxy endpoint", async () => {
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
  const logJsonl = path.join(os.tmpdir(), `gemma4-harness-${Date.now()}.jsonl`);
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

await test("29 harness retries malformed Python", async () => {
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

await test("30 harness retries malformed TypeScript", async () => {
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

await test("31 harness always calls upstream for BenchLoop coding prompts", async () => {
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

await test("33 content parts feed JSON repair without untyped scalar coercion", () => {
  const req = {
    model: "gemma-4-E2B-it-qat-UD-Q4_K_XL",
    messages: [
      { role: "system", content: [{ type: "text", text: "Output valid JSON with exact fields." }] },
      { role: "user", content: [{ type: "text", text: "Extract. Fields: price, zip" }] },
    ],
    tools: [],
  };
  const { message } = processed('{"price":"$42","zip":"02110"}', req);
  const data = JSON.parse(message.content);
  assert.deepEqual(data, { price: "$42", zip: "02110" });
});

await test("34 prior tool calls do not create extra calls", () => {
  const stockTool = {
    type: "function",
    function: {
      name: "get_stock_price",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: { ticker: { type: "string" } },
        required: ["ticker"],
      },
    },
  };
  const req = request("I own 10 shares of ACME and 5 shares of OMNI. Calculate the total value.", { tools: [stockTool, TOOLS[1]] });
  req.messages.push({
    role: "assistant",
    content: "",
    tool_calls: [
      { id: "call_acme", type: "function", function: { name: "get_stock_price", arguments: '{"ticker":"ACME"}' } },
      { id: "call_omni", type: "function", function: { name: "get_stock_price", arguments: '{"ticker":"OMNI"}' } },
    ],
  });
  req.messages.push({ role: "tool", name: "get_stock_price", tool_call_id: "call_acme", content: "ACME: $188.43" });
  req.messages.push({ role: "tool", name: "get_stock_price", tool_call_id: "call_omni", content: "OMNI: $412.65" });
  const calculatorCall = { function: { name: "calculator", arguments: '{"expression":"(10 * 188.43) + (5 * 412.65)"}' } };
  const { message } = processed("", req, [calculatorCall]);
  assert.deepEqual(message.tool_calls.map((call) => call.function.name), ["calculator"]);
});

await test("35 certification-style ratings stay strings", () => {
  const { message } = processed('{"water_resistance_rating":"IPX5","rating_stars":"4 stars"}', request("Extract. Fields: water_resistance_rating, rating_stars", { tools: [], system: "Output valid JSON with exact fields." }));
  const data = JSON.parse(message.content);
  assert.equal(data.water_resistance_rating, "IPX5");
  assert.equal(data.rating_stars, "4 stars");
});

await test("36 harness passes through streaming responses", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.equal(payload.stream, true);
        assert.equal(payload.temperature, 1);
        res.statusCode = 200;
        res.setHeader("content-type", "text/event-stream");
        res.end("data: {\"choices\":[{\"delta\":{\"content\":\"hi\"}}]}\n\ndata: [DONE]\n\n");
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...request("Say hi.", { tools: [] }), stream: true }),
    });
    assert.match(res.headers.get("content-type"), /text\/event-stream/);
    assert.match(await res.text(), /data: \[DONE\]/);
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("37 prompt wording does not collapse top-level JSON arrays", () => {
  const req = request("Extract the meeting details. Fields: meeting_name, day", {
    tools: [],
    system: "Output valid JSON with the exact field names specified. Output ONLY the JSON object or JSON array.",
  });
  const result = processChatCompletion(
    response('[{"meeting_name":"planning","day":"Thursday"},{"meeting_name":"retro","day":"Friday"}]'),
    req,
    loadPolicy(),
  );
  const data = JSON.parse(result.body.choices[0].message.content);
  assert.deepEqual(data, [
    { meeting_name: "planning", day: "Thursday" },
    { meeting_name: "retro", day: "Friday" },
  ]);
});

await test("38 untyped JSON fields are not coerced by key-name word lists", () => {
  const req = request("Extract the status fields.", {
    tools: [],
    system: "Output valid JSON with the exact field names specified.",
  });
  const result = processChatCompletion(
    response('{"count":"7","enabled":"yes","status":"not provided"}'),
    req,
    loadPolicy(),
  );
  const data = JSON.parse(result.body.choices[0].message.content);
  assert.deepEqual(data, { count: "7", enabled: "yes", status: "not provided" });
});

await test("39 harness handles CORS preflight", async () => {
  const upstream = await startUpstreamServer((_req, res) => {
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "POST",
      },
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-origin"), "*");
    assert.match(res.headers.get("access-control-allow-methods"), /POST/);
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("40 harness adapts non-streaming Responses API requests", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.equal(payload.model, "gemma-test");
        assert.equal(payload.max_tokens, 123);
        assert.deepEqual(payload.messages, [
          { role: "system", content: "Reply tersely." },
          { role: "user", content: "What changed?" },
        ]);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({
          id: "chatcmpl_test",
          model: "gemma-test",
          choices: [{ message: { role: "assistant", content: "Protocol compatibility.", tool_calls: [] } }],
          usage: { prompt_tokens: 10, completion_tokens: 3, total_tokens: 13 },
        }));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer local" },
      body: JSON.stringify({
        model: "gemma-test",
        instructions: "Reply tersely.",
        input: "What changed?",
        max_output_tokens: 123,
      }),
    });
    const json = await res.json();
    assert.equal(json.object, "response");
    assert.equal(json.output_text, "Protocol compatibility.");
    assert.equal(json.output[0].content[0].text, "Protocol compatibility.");
    assert.equal(json.usage.input_tokens, 10);
    assert.equal(json.gemma_harness.policy, "gemma4-q4-optimized");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("41 harness adapts Responses API function tools and tool choice", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.deepEqual(payload.tools, [
          {
            type: "function",
            function: {
              name: "calculator",
              description: "Evaluate a numeric expression.",
              parameters: {
                type: "object",
                additionalProperties: false,
                properties: { expression: { type: "string" } },
                required: ["expression"],
              },
            },
          },
        ]);
        assert.deepEqual(payload.tool_choice, { type: "function", function: { name: "calculator" } });
        assert.deepEqual(payload.response_format, { type: "json_object" });
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({
          id: "chatcmpl_tool",
          model: "gemma-test",
          choices: [
            {
              message: {
                role: "assistant",
                content: "",
                tool_calls: [
                  {
                    id: "call_calc",
                    type: "function",
                    function: { name: "calculator", arguments: '{"expression":"2 + 2"}' },
                  },
                ],
              },
            },
          ],
        }));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        input: [{ role: "user", content: [{ type: "input_text", text: "Calculate 2 + 2." }] }],
        tools: [
          {
            type: "function",
            name: "calculator",
            description: "Evaluate a numeric expression.",
            parameters: {
              type: "object",
              additionalProperties: false,
              properties: { expression: { type: "string" } },
              required: ["expression"],
            },
          },
        ],
        tool_choice: { type: "function", name: "calculator" },
        text: { format: { type: "json_object" } },
      }),
    });
    const json = await res.json();
    assert.equal(json.output_text, "");
    assert.deepEqual(json.output, [
      {
        id: "call_calc",
        type: "function_call",
        status: "completed",
        call_id: "call_calc",
        name: "calculator",
        arguments: '{"expression":"2 + 2"}',
      },
    ]);
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("42 harness retries generic JSON-object Responses instructions", async () => {
  let calls = 0;
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then(() => {
        calls += 1;
        res.setHeader("content-type", "application/json");
        const content = calls === 1 ? '{"match": true,' : '{"match":true,"reason":""}';
        res.end(JSON.stringify({
          id: `chatcmpl_json_${calls}`,
          model: "gemma-test",
          choices: [{ message: { role: "assistant", content, tool_calls: [] } }],
        }));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(null, { retry_malformed_json: true, max_retries: 1 }),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        instructions: 'Return a JSON object with exactly these fields: {"match": true|false, "reason": ""}',
        input: "Does the request fulfill the instruction?",
        max_output_tokens: 256,
      }),
    });
    const json = await res.json();
    assert.equal(calls, 2);
    assert.deepEqual(JSON.parse(json.output_text), { match: true, reason: "" });
    assert.ok(json.gemma_harness.repairs.includes("repaired_json_content"));
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("43 harness adapts Responses function-call history", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.deepEqual(payload.messages, [
          { role: "user", content: "Calculate 2 + 2." },
          {
            role: "assistant",
            content: "",
            tool_calls: [
              {
                id: "call_calc",
                type: "function",
                function: { name: "calculator", arguments: '{"expression":"2 + 2"}' },
              },
            ],
          },
          { role: "tool", tool_call_id: "call_calc", content: "4" },
          { role: "user", content: "Now answer with the result." },
        ]);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({
          id: "chatcmpl_history",
          model: "gemma-test",
          choices: [{ message: { role: "assistant", content: "The result is 4.", tool_calls: [] } }],
        }));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        input: [
          { type: "message", role: "user", content: [{ type: "input_text", text: "Calculate 2 + 2." }] },
          { type: "function_call", call_id: "call_calc", name: "calculator", arguments: '{"expression":"2 + 2"}' },
          { type: "function_call_output", call_id: "call_calc", output: "4" },
          { role: "user", content: "Now answer with the result." },
        ],
      }),
    });
    const json = await res.json();
    assert.equal(json.output_text, "The result is 4.");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("44 bare JSON object keys are repaired outside strings", () => {
  const req = request("Return a JSON object with fields success, amount, note.", {
    tools: [],
    system: "Return JSON.",
  });
  const { message } = processed('{success: true, amount: "$3", note: "{not_a_key: true}"}', req);
  const data = JSON.parse(message.content);
  assert.deepEqual(data, { success: true, amount: "$3", note: "{not_a_key: true}" });
});

await test("45 nullish-looking untyped scalar values stay strings", () => {
  const req = request("Extract. Fields: dietary_restrictions, contact_name, notes", {
    tools: [],
    system: "Output valid JSON with exact fields.",
  });
  const result = processChatCompletion(
    response('{"dietary_restrictions":"not provided","contact_name":"unknown","notes":"N/A"}'),
    req,
    loadPolicy(),
  );
  const data = JSON.parse(result.body.choices[0].message.content);
  assert.deepEqual(data, { dietary_restrictions: "not provided", contact_name: "unknown", notes: "N/A" });
});

await test("46 malformed JSON retry handles prefaced JSON-like content", async () => {
  let calls = 0;
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then(() => {
        calls += 1;
        res.setHeader("content-type", "application/json");
        const content = calls === 1 ? "```json\n{success: true,\n```" : '{"success":true}';
        res.end(JSON.stringify(response(content)));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(null, { retry_malformed_json: true, max_retries: 1 }),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request("Return JSON with field success.", { tools: [], system: "Return JSON." })),
    });
    const json = await res.json();
    assert.equal(calls, 2);
    assert.deepEqual(JSON.parse(json.choices[0].message.content), { success: true });
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("46b prompt prose alone does not trigger malformed JSON retry", async () => {
  let calls = 0;
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then(() => {
        calls += 1;
        res.setHeader("content-type", "application/json");
        const content = calls === 1 ? "Here is the JSON: {success: true," : '{"success":true}';
        res.end(JSON.stringify(response(content)));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(null, { retry_malformed_json: true, max_retries: 1 }),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request("Return JSON with field success.", { tools: [], system: "Return JSON." })),
    });
    const json = await res.json();
    assert.equal(calls, 1);
    assert.equal(json.choices[0].message.content, "Here is the JSON: {success: true,");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("47 boolean-looking untyped scalar values stay strings", () => {
  const req = request("Extract. Fields: has_parking, is_remote, project_status", {
    tools: [],
    system: "Output valid JSON with exact fields.",
  });
  const result = processChatCompletion(
    response('{"has_parking":"No parking included","is_remote":"available","project_status":"not required"}'),
    req,
    loadPolicy(),
  );
  const data = JSON.parse(result.body.choices[0].message.content);
  assert.deepEqual(data, { has_parking: "No parking included", is_remote: "available", project_status: "not required" });
});

await test("48 Responses adapter preserves common generation controls", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.equal(payload.parallel_tool_calls, false);
        assert.equal(payload.frequency_penalty, 0.25);
        assert.equal(payload.presence_penalty, 0.5);
        assert.equal(payload.seed, 1234);
        assert.equal(payload.logprobs, true);
        assert.equal(payload.top_logprobs, 2);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("ok")));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        input: "Say ok.",
        parallel_tool_calls: false,
        frequency_penalty: 0.25,
        presence_penalty: 0.5,
        seed: 1234,
        logprobs: true,
        top_logprobs: 2,
      }),
    });
    const json = await res.json();
    assert.equal(json.output_text, "ok");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("49 legacy function_call responses normalize to tool_calls", () => {
  const body = {
    choices: [
      {
        message: {
          role: "assistant",
          content: null,
          function_call: { name: "get_weather", arguments: '{"location":"Oslo"}' },
        },
      },
    ],
  };
  const result = processChatCompletion(body, request("Use the weather tool for Oslo."), loadPolicy());
  const message = result.body.choices[0].message;
  assert.equal(message.function_call, undefined);
  assert.equal(message.tool_calls[0].function.name, "get_weather");
  assert.deepEqual(args(message.tool_calls[0]), { location: "Oslo", units: "celsius" });
});

await test("50 Responses function tools accept input_schema descriptors", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.deepEqual(payload.tools, [
          {
            type: "function",
            function: {
              name: "lookup",
              parameters: {
                type: "object",
                properties: { query: { type: "string" } },
                required: ["query"],
              },
            },
          },
        ]);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("ok")));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        input: "Look something up.",
        tools: [
          {
            type: "function",
            name: "lookup",
            input_schema: {
              type: "object",
              properties: { query: { type: "string" } },
              required: ["query"],
            },
          },
        ],
      }),
    });
    const json = await res.json();
    assert.equal(json.output_text, "ok");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("51 Responses single-object input preserves developer role as system", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.deepEqual(payload.messages, [{ role: "system", content: "Use terse answers." }]);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("ok")));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        input: { role: "developer", content: "Use terse answers." },
      }),
    });
    const json = await res.json();
    assert.equal(json.output_text, "ok");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("52 tool argument normalization coerces schema booleans", () => {
  const toggleTool = {
    type: "function",
    function: {
      name: "set_feature",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          enabled: { type: "boolean" },
          required: { type: ["boolean", "null"] },
        },
        required: ["enabled"],
      },
    },
  };
  const call = { function: { name: "set_feature", arguments: '{"enabled":"true","required":"false","extra":1}' } };
  const { message } = processed("", request("Set the feature flags.", { tools: [toggleTool] }), [call]);
  assert.deepEqual(args(message.tool_calls[0]), { enabled: true, required: false });
});

await test("53 tool argument normalization coerces schema nulls", () => {
  const updateTool = {
    type: "function",
    function: {
      name: "update_profile",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          display_name: { type: ["string", "null"] },
          nickname: { type: ["string", "null"] },
        },
      },
    },
  };
  const call = { function: { name: "update_profile", arguments: '{"display_name":"null","nickname":"Ace"}' } };
  const { message } = processed("", request("Update profile fields.", { tools: [updateTool] }), [call]);
  assert.deepEqual(args(message.tool_calls[0]), { display_name: null, nickname: "Ace" });
});

await test("54 tool argument normalization canonicalizes string enums", () => {
  const formatTool = {
    type: "function",
    function: {
      name: "set_format",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          mode: { type: "string", enum: ["compact", "detailed"] },
          fallback: { type: "string", enum: ["ask", "skip"] },
        },
      },
    },
  };
  const call = { function: { name: "set_format", arguments: '{"mode":"Detailed","fallback":"manual"}' } };
  const { message } = processed("", request("Set output formatting.", { tools: [formatTool] }), [call]);
  assert.deepEqual(args(message.tool_calls[0]), { mode: "detailed", fallback: "manual" });
});

await test("55 harness adapts non-streaming legacy completions", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.equal(payload.model, "gemma-test");
        assert.equal(payload.temperature, 1);
        assert.equal(payload.max_tokens, 64);
        assert.deepEqual(payload.messages, [{ role: "user", content: "Return JSON with field answer." }]);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({
          id: "chatcmpl_completion",
          created: 123,
          model: "gemma-test",
          choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "Here is JSON:\n```json\n{answer: 'ok'}\n```", tool_calls: [] } }],
          usage: { prompt_tokens: 5, completion_tokens: 4, total_tokens: 9 },
        }));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        prompt: "Return JSON with field answer.",
        max_tokens: 64,
        temperature: 0,
      }),
    });
    const json = await res.json();
    assert.equal(json.object, "text_completion");
    assert.equal(json.created, 123);
    assert.deepEqual(JSON.parse(json.choices[0].text), { answer: "ok" });
    assert.equal(json.choices[0].finish_reason, "stop");
    assert.equal(json.usage.total_tokens, 9);
    assert.equal(json.gemma_harness.policy, "gemma4-q4-optimized");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("56 legacy completions adapter preserves n and multiple choices", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.equal(payload.n, 2);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({
          id: "chatcmpl_multi",
          model: "gemma-test",
          choices: [
            { index: 0, finish_reason: "stop", message: { role: "assistant", content: "alpha", tool_calls: [] } },
            { index: 1, finish_reason: "length", message: { role: "assistant", content: "beta", tool_calls: [] } },
          ],
        }));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", prompt: "Give two options.", n: 2 }),
    });
    const json = await res.json();
    assert.deepEqual(json.choices.map((choice) => [choice.index, choice.text, choice.finish_reason]), [
      [0, "alpha", "stop"],
      [1, "beta", "length"],
    ]);
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("57 direct chat tools can normalize top-level input_schema", () => {
  const tool = {
    type: "function",
    name: "set_limit",
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        limit: { type: "integer" },
        enabled: { type: "boolean" },
      },
    },
  };
  const call = { function: { name: "set_limit", arguments: '{"limit":"12 items","enabled":"true","ignored":true}' } };
  const { message } = processed("", request("Set the limit.", { tools: [tool] }), [call]);
  assert.deepEqual(args(message.tool_calls[0]), { limit: 12, enabled: true });
});

await test("58 JSON repair strips comments outside strings", () => {
  const content = `{
    // generated summary
    url: "https://example.com/a//b",
    count: "7", /* inline note */
  }`;
  const { message } = processed(content, request("Return JSON with fields url and count.", { tools: [], system: "Return JSON." }));
  const data = JSON.parse(message.content);
  assert.deepEqual(data, { url: "https://example.com/a//b", count: "7" });
});

await test("59 JSON response_format schema coerces repaired response fields", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "result",
        schema: {
          type: "object",
          properties: {
            count: { type: "integer" },
            enabled: { type: "boolean" },
            mode: { type: "string", enum: ["fast", "safe"] },
            tags: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  };
  const { message } = processed('{count: "12 items", enabled: "true", mode: "SAFE", tags: "alpha, beta"}', req);
  const data = JSON.parse(message.content);
  assert.deepEqual(data, { count: 12, enabled: true, mode: "safe", tags: ["alpha", "beta"] });
});

await test("60 JSON response_format accepts direct json_schema object", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        type: "object",
        properties: {
          score: { type: "number" },
          active: { type: "boolean" },
        },
      },
    },
  };
  const { message } = processed('{score: "98.5", active: "true"}', req);
  const data = JSON.parse(message.content);
  assert.deepEqual(data, { score: 98.5, active: true });
});

await test("61 harness chat maps max_completion_tokens for upstream", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.equal(payload.max_tokens, 88);
        assert.equal(payload.max_completion_tokens, undefined);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("ok")));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...request("Say ok.", { tools: [] }), max_completion_tokens: 88 }),
    });
    const json = await res.json();
    assert.equal(json.choices[0].message.content, "ok");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("62 JSON response_format schema prunes disallowed extra fields", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "result",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            answer: { type: "string" },
            details: {
              type: "object",
              additionalProperties: false,
              properties: { count: { type: "integer" } },
            },
          },
        },
      },
    },
  };
  const { message } = processed('{answer: "ok", extra: "drop", details: {count: "3", junk: true}}', req);
  const data = JSON.parse(message.content);
  assert.deepEqual(data, { answer: "ok", details: { count: 3 } });
});

await test("63 JSON response_format schema coerces anyOf fields", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "result",
        schema: {
          type: "object",
          properties: {
            score: { anyOf: [{ type: "integer" }, { type: "null" }] },
            note: { oneOf: [{ type: "null" }, { type: "string" }] },
          },
        },
      },
    },
  };
  const { message } = processed('{score: "42", note: "null"}', req);
  const data = JSON.parse(message.content);
  assert.deepEqual(data, { score: 42, note: null });
});

await test("64 tool argument normalization coerces anyOf fields", () => {
  const updateTool = {
    type: "function",
    function: {
      name: "set_threshold",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          threshold: { anyOf: [{ type: "number" }, { type: "null" }] },
          mode: { oneOf: [{ type: "string", enum: ["auto", "manual"] }, { type: "null" }] },
        },
      },
    },
  };
  const call = { function: { name: "set_threshold", arguments: '{"threshold":"3.5","mode":"AUTO"}' } };
  const { message } = processed("", request("Set threshold.", { tools: [updateTool] }), [call]);
  assert.deepEqual(args(message.tool_calls[0]), { threshold: 3.5, mode: "auto" });
});

await test("65 schema const values are canonicalized for JSON and tool args", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "result",
        schema: {
          type: "object",
          properties: {
            kind: { const: "verdict" },
            ok: { const: true },
          },
        },
      },
    },
  };
  const { message } = processed('{kind: "VERDICT", ok: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { kind: "verdict", ok: true });

  const tool = {
    type: "function",
    function: {
      name: "record_verdict",
      parameters: {
        type: "object",
        properties: {
          kind: { const: "verdict" },
          ok: { const: true },
        },
      },
    },
  };
  const call = { function: { name: "record_verdict", arguments: '{"kind":"Verdict","ok":"true"}' } };
  const normalized = processed("", request("Record verdict.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { kind: "verdict", ok: true });
});

await test("66 harness chat maps developer messages upstream", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.deepEqual(payload.messages, [
          { role: "system", content: "Prefer compact answers." },
          { role: "user", content: "Say ok." },
        ]);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("ok")));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        messages: [
          { role: "developer", content: "Prefer compact answers." },
          { role: "user", content: "Say ok." },
        ],
      }),
    });
    const json = await res.json();
    assert.equal(json.choices[0].message.content, "ok");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("67 schema allOf coercion applies to JSON and tool args", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "result",
        schema: {
          allOf: [
            { type: "object", properties: { count: { type: "integer" } } },
            { type: "object", properties: { mode: { enum: ["fast", "safe"] } } },
          ],
        },
      },
    },
  };
  const { message } = processed('{count: "9 items", mode: "FAST"}', req);
  assert.deepEqual(JSON.parse(message.content), { count: 9, mode: "fast" });

  const tool = {
    type: "function",
    function: {
      name: "configure",
      parameters: {
        type: "object",
        properties: {
          count: { allOf: [{ type: "integer" }] },
          enabled: { allOf: [{ type: "boolean" }] },
        },
      },
    },
  };
  const call = { function: { name: "configure", arguments: '{"count":"4","enabled":"true"}' } };
  const normalized = processed("", request("Configure.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { count: 4, enabled: true });
});

await test("68 Responses adapter maps max_completion_tokens", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.equal(payload.max_tokens, 91);
        assert.equal(payload.max_completion_tokens, undefined);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("ok")));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", input: "Say ok.", max_completion_tokens: 91 }),
    });
    const json = await res.json();
    assert.equal(json.output_text, "ok");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("69 JSON response_format schema applies explicit defaults", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "result",
        schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            confidence: { type: "number", default: "0.5" },
            ok: { type: "boolean", default: "true" },
          },
        },
      },
    },
  };
  const { message } = processed('{answer: "ok"}', req);
  assert.deepEqual(JSON.parse(message.content), { answer: "ok", confidence: 0.5, ok: true });
});

await test("70 harness chat maps Responses-style tool_choice", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.deepEqual(payload.tool_choice, { type: "function", function: { name: "calculator" } });
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("", [
          { function: { name: "calculator", arguments: '{"expression":"1 + 1"}' } },
        ])));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...request("Calculate 1 + 1.", { tools: [TOOLS[1]] }), tool_choice: { type: "function", name: "calculator" } }),
    });
    const json = await res.json();
    assert.equal(json.choices[0].message.tool_calls[0].function.name, "calculator");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("71 Responses-style tool calls preserve call_id", () => {
  const lookupTool = {
    type: "function",
    function: {
      name: "lookup",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
      },
    },
  };
  const call = { type: "function_call", call_id: "call_lookup_123", name: "lookup", arguments: '{"query":"alpha"}' };
  const { message } = processed("", request("Look this up.", { tools: [lookupTool] }), [call]);
  assert.equal(message.tool_calls[0].id, "call_lookup_123");
  assert.deepEqual(args(message.tool_calls[0]), { query: "alpha" });
});

await test("72 Responses function_call_output serializes structured output", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        const toolMessage = payload.messages.find((message) => message.role === "tool");
        assert.equal(toolMessage.tool_call_id, "call_lookup_123");
        assert.equal(toolMessage.content, '{"answer":4,"sources":["cache"]}');
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("ok")));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        input: [
          { type: "function_call", call_id: "call_lookup_123", name: "lookup", arguments: '{"query":"two plus two"}' },
          { type: "function_call_output", call_id: "call_lookup_123", output: { answer: 4, sources: ["cache"] } },
        ],
      }),
    });
    const json = await res.json();
    assert.equal(json.output_text, "ok");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("73 JSON Schema additionalProperties schemas coerce extra fields", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "result",
        schema: {
          type: "object",
          properties: { name: { type: "string" } },
          additionalProperties: { type: "integer" },
        },
      },
    },
  };
  const { message } = processed('{name: "alpha", count: "12 items"}', req);
  assert.deepEqual(JSON.parse(message.content), { name: "alpha", count: 12 });

  const flagTool = {
    type: "function",
    function: {
      name: "set_flags",
      parameters: {
        type: "object",
        properties: { name: { type: "string" } },
        additionalProperties: { type: "boolean" },
      },
    },
  };
  const call = { function: { name: "set_flags", arguments: '{"name":"alpha","active":"true","archived":"false"}' } };
  const normalized = processed("", request("Set flags.", { tools: [flagTool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { name: "alpha", active: true, archived: false });
});

await test("74 JSON Schema prefixItems tuple arrays are coerced", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the tuple." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "tuple",
        schema: {
          type: "array",
          prefixItems: [{ type: "integer" }, { type: "boolean" }, { type: "string" }],
        },
      },
    },
  };
  const { message } = processed('["3 items","true",7]', req);
  assert.deepEqual(JSON.parse(message.content), [3, true, "7"]);

  const tupleTool = {
    type: "function",
    function: {
      name: "set_tuple",
      parameters: {
        type: "object",
        properties: {
          values: {
            type: "array",
            prefixItems: [{ type: "integer" }, { type: "boolean" }],
          },
        },
      },
    },
  };
  const call = { function: { name: "set_tuple", arguments: '{"values":["5 items","false"]}' } };
  const normalized = processed("", request("Set tuple.", { tools: [tupleTool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: [5, false] });
});

await test("75 tool argument defaults are coerced through their schema", () => {
  const tool = {
    type: "function",
    function: {
      name: "set_limit",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "integer", default: "8 items" },
          enabled: { type: "boolean", default: "true" },
        },
      },
    },
  };
  const call = { function: { name: "set_limit", arguments: "{}" } };
  const { message } = processed("", request("Set defaults.", { tools: [tool] }), [call]);
  assert.deepEqual(args(message.tool_calls[0]), { limit: 8, enabled: true });
});

await test("76 local JSON Schema $ref is resolved for responses and tool args", () => {
  const schema = {
    $defs: {
      count: { type: "integer" },
      flag: { type: "boolean" },
    },
    type: "object",
    properties: {
      count: { $ref: "#/$defs/count" },
      enabled: { $ref: "#/$defs/flag" },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "result", schema } },
  };
  const { message } = processed('{count: "6 items", enabled: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { count: 6, enabled: true });

  const tool = {
    type: "function",
    function: {
      name: "configure_ref",
      parameters: schema,
    },
  };
  const call = { function: { name: "configure_ref", arguments: '{"count":"4 items","enabled":"false"}' } };
  const normalized = processed("", request("Configure.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { count: 4, enabled: false });
});

await test("77 OpenAPI nullable schemas coerce JSON null strings", () => {
  const schema = {
    type: "object",
    properties: {
      display_name: { type: "string", nullable: true },
      score: { type: "integer", nullable: true },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "profile", schema } },
  };
  const { message } = processed('{display_name: "null", score: "12 points"}', req);
  assert.deepEqual(JSON.parse(message.content), { display_name: null, score: 12 });

  const tool = {
    type: "function",
    function: {
      name: "update_profile_nullable",
      parameters: schema,
    },
  };
  const call = { function: { name: "update_profile_nullable", arguments: '{"display_name":"null","score":"null"}' } };
  const normalized = processed("", request("Update profile.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { display_name: null, score: null });
});

await test("78 JSON Schema patternProperties coerce matching keys", () => {
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: { name: { type: "string" } },
    patternProperties: {
      "^count_": { type: "integer" },
      "^flag_": { type: "boolean" },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "patterned", schema } },
  };
  const { message } = processed('{name: "alpha", count_items: "9", flag_ready: "true", other: "drop"}', req);
  assert.deepEqual(JSON.parse(message.content), { name: "alpha", count_items: 9, flag_ready: true });

  const tool = {
    type: "function",
    function: {
      name: "set_patterned",
      parameters: schema,
    },
  };
  const call = { function: { name: "set_patterned", arguments: '{"name":"alpha","count_items":"3","flag_ready":"false","other":"drop"}' } };
  const normalized = processed("", request("Set patterned.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { name: "alpha", count_items: 3, flag_ready: false });
});

await test("79 draft-07 tuple items arrays are coerced", () => {
  const schema = {
    type: "array",
    items: [{ type: "integer" }, { type: "boolean" }, { type: "string" }],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the tuple." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "tuple", schema } },
  };
  const { message } = processed('["11 items","true",3]', req);
  assert.deepEqual(JSON.parse(message.content), [11, true, "3"]);

  const tool = {
    type: "function",
    function: {
      name: "set_legacy_tuple",
      parameters: {
        type: "object",
        properties: { values: schema },
      },
    },
  };
  const call = { function: { name: "set_legacy_tuple", arguments: '{"values":["2","false",7]}' } };
  const normalized = processed("", request("Set tuple.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: [2, false, "7"] });
});

await test("80 tool-call input argument aliases are parsed", () => {
  const tool = {
    type: "function",
    function: {
      name: "set_limit_input",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          limit: { type: "integer" },
          enabled: { type: "boolean" },
        },
      },
    },
  };
  const existing = { function: { name: "set_limit_input", input: '{"limit":"10 items","enabled":"true"}' } };
  const { message } = processed("", request("Set limit.", { tools: [tool] }), [existing]);
  assert.deepEqual(args(message.tool_calls[0]), { limit: 10, enabled: true });

  const fromContent = processed(
    '{"name":"set_limit_input","input":{"limit":"3","enabled":"false"}}',
    request("Set limit.", { tools: [tool] }),
  ).message;
  assert.deepEqual(args(fromContent.tool_calls[0]), { limit: 3, enabled: false });
});

await test("81 object unions choose matching schema branches", () => {
  const schema = {
    anyOf: [
      {
        type: "object",
        additionalProperties: false,
        required: ["kind", "enabled"],
        properties: { kind: { const: "flag" }, enabled: { type: "boolean" } },
      },
      {
        type: "object",
        additionalProperties: false,
        required: ["kind", "count"],
        properties: { kind: { const: "count" }, count: { type: "integer" } },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "union", schema } },
  };
  const { message } = processed('{kind: "count", count: "7 items"}', req);
  assert.deepEqual(JSON.parse(message.content), { kind: "count", count: 7 });

  const tool = { type: "function", function: { name: "record_union", parameters: schema } };
  const call = { function: { name: "record_union", arguments: '{"kind":"flag","enabled":"true"}' } };
  const normalized = processed("", request("Record union.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { kind: "flag", enabled: true });
});

await test("82 JSON Schema if/then/else branches coerce matching fields", () => {
  const schema = {
    type: "object",
    properties: { mode: { type: "string" }, value: {} },
    if: { required: ["mode"], properties: { mode: { const: "numeric" } } },
    then: { properties: { value: { type: "integer" } } },
    else: { properties: { value: { type: "boolean" } } },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "conditional", schema } },
  };
  const { message } = processed('{mode: "numeric", value: "12 items"}', req);
  assert.deepEqual(JSON.parse(message.content), { mode: "numeric", value: 12 });

  const tool = { type: "function", function: { name: "set_conditional", parameters: schema } };
  const call = { function: { name: "set_conditional", arguments: '{"mode":"flag","value":"false"}' } };
  const normalized = processed("", request("Set conditional.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { mode: "flag", value: false });
});

await test("83 JSON Schema dependentSchemas coerce dependent fields", () => {
  const schema = {
    type: "object",
    properties: { plan: { type: "string" }, seats: {}, enabled: {} },
    dependentSchemas: {
      plan: {
        properties: {
          seats: { type: "integer" },
          enabled: { type: "boolean" },
        },
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "dependent", schema } },
  };
  const { message } = processed('{plan: "team", seats: "5 seats", enabled: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { plan: "team", seats: 5, enabled: true });

  const tool = { type: "function", function: { name: "set_dependent", parameters: schema } };
  const call = { function: { name: "set_dependent", arguments: '{"plan":"solo","seats":"1 seat","enabled":"false"}' } };
  const normalized = processed("", request("Set dependent.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { plan: "solo", seats: 1, enabled: false });
});

await test("84 propertyNames patterns filter and coerce named values", () => {
  const schema = {
    type: "object",
    propertyNames: { type: "string", pattern: "^x_" },
    additionalProperties: { type: "integer" },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "named", schema } },
  };
  const { message } = processed('{x_count: "8", y_count: "9"}', req);
  assert.deepEqual(JSON.parse(message.content), { x_count: 8 });

  const tool = { type: "function", function: { name: "set_named", parameters: schema } };
  const call = { function: { name: "set_named", arguments: '{"x_count":"4","y_count":"5"}' } };
  const normalized = processed("", request("Set named.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { x_count: 4 });
});

await test("85 unevaluatedProperties false prunes extras", () => {
  const schema = {
    type: "object",
    unevaluatedProperties: false,
    properties: {
      name: { type: "string" },
      count: { type: "integer" },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "closed", schema } },
  };
  const { message } = processed('{name: "alpha", count: "6", extra: "drop"}', req);
  assert.deepEqual(JSON.parse(message.content), { name: "alpha", count: 6 });

  const tool = { type: "function", function: { name: "set_closed", parameters: schema } };
  const call = { function: { name: "set_closed", arguments: '{"name":"beta","count":"3","extra":"drop"}' } };
  const normalized = processed("", request("Set closed.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { name: "beta", count: 3 });
});

await test("86 JSON Schema not excludes union branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          kind: { type: "string", not: { const: "count" } },
          value: { type: "string" },
        },
      },
      {
        properties: {
          kind: { const: "count" },
          value: { type: "integer" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "not_union", schema } },
  };
  const { message } = processed('{kind: "count", value: "9 items"}', req);
  assert.deepEqual(JSON.parse(message.content), { kind: "count", value: 9 });

  const tool = { type: "function", function: { name: "set_not_union", parameters: schema } };
  const call = { function: { name: "set_not_union", arguments: '{"kind":"count","value":"4 items"}' } };
  const normalized = processed("", request("Set not union.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { kind: "count", value: 4 });
});

await test("87 array minItems and maxItems choose matching schema branches", () => {
  const valuesSchema = {
    anyOf: [
      { type: "array", maxItems: 1, items: { type: "string" } },
      { type: "array", minItems: 2, items: { type: "integer" } },
    ],
  };
  const schema = { type: "object", properties: { values: valuesSchema } };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "array_bounds", schema } },
  };
  const { message } = processed('{values: ["1", "2"]}', req);
  assert.deepEqual(JSON.parse(message.content), { values: [1, 2] });

  const tool = { type: "function", function: { name: "set_array_bounds", parameters: schema } };
  const call = { function: { name: "set_array_bounds", arguments: '{"values":["3","4"]}' } };
  const normalized = processed("", request("Set array bounds.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: [3, 4] });
});

await test("88 string minLength and maxLength choose matching schema branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          label: { type: "string", maxLength: 3 },
          active: { type: "string" },
        },
      },
      {
        properties: {
          label: { type: "string", minLength: 4 },
          active: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "string_lengths", schema } },
  };
  const { message } = processed('{label: "alpha", active: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { label: "alpha", active: true });

  const tool = { type: "function", function: { name: "set_string_lengths", parameters: schema } };
  const call = { function: { name: "set_string_lengths", arguments: '{"label":"bravo","active":"false"}' } };
  const normalized = processed("", request("Set string lengths.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { label: "bravo", active: false });
});

await test("89 numeric constraints choose matching schema branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          score: { type: "number", maximum: 10 },
          passed: { type: "string" },
        },
      },
      {
        properties: {
          score: { type: "number", minimum: 11, multipleOf: 3 },
          passed: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "numeric_bounds", schema } },
  };
  const { message } = processed('{score: "12 points", passed: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { score: 12, passed: true });

  const tool = { type: "function", function: { name: "set_numeric_bounds", parameters: schema } };
  const call = { function: { name: "set_numeric_bounds", arguments: '{"score":"15 points","passed":"false"}' } };
  const normalized = processed("", request("Set numeric bounds.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { score: 15, passed: false });
});

await test("90 Responses adapter maps length finish_reason to incomplete status", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then(() => {
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({
          id: "chatcmpl_partial",
          model: "gemma-test",
          choices: [
            {
              finish_reason: "length",
              message: { role: "assistant", content: "partial answer" },
            },
          ],
          usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
        }));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", input: "Finish briefly.", max_output_tokens: 2 }),
    });
    const json = await res.json();
    assert.equal(json.status, "incomplete");
    assert.deepEqual(json.incomplete_details, { reason: "max_output_tokens" });
    assert.equal(json.output[0].status, "incomplete");
    assert.equal(json.output_text, "partial answer");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("91 object minProperties and maxProperties choose matching schema branches", () => {
  const schema = {
    type: "object",
    properties: {
      values: {
        anyOf: [
          { type: "object", maxProperties: 1, additionalProperties: { type: "string" } },
          { type: "object", minProperties: 2, additionalProperties: { type: "integer" } },
        ],
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "object_counts", schema } },
  };
  const { message } = processed('{values: {a: "1", b: "2"}}', req);
  assert.deepEqual(JSON.parse(message.content), { values: { a: 1, b: 2 } });

  const tool = { type: "function", function: { name: "set_object_counts", parameters: schema } };
  const call = { function: { name: "set_object_counts", arguments: '{"values":{"a":"3","b":"4"}}' } };
  const normalized = processed("", request("Set object counts.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: { a: 3, b: 4 } });
});

await test("92 uniqueItems excludes duplicate-array schema branches", () => {
  const schema = {
    type: "object",
    properties: {
      values: {
        anyOf: [
          { type: "array", uniqueItems: true, items: { type: "integer" } },
          { type: "array", items: { type: "string" } },
        ],
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "unique_items", schema } },
  };
  const { message } = processed('{values: ["1", "1"]}', req);
  assert.deepEqual(JSON.parse(message.content), { values: ["1", "1"] });

  const tool = { type: "function", function: { name: "set_unique_items", parameters: schema } };
  const call = { function: { name: "set_unique_items", arguments: '{"values":["2","2"]}' } };
  const normalized = processed("", request("Set unique items.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: ["2", "2"] });
});

await test("93 contains and minContains choose matching array schema branches", () => {
  const schema = {
    type: "object",
    properties: {
      values: {
        anyOf: [
          { type: "array", contains: { type: "boolean" }, minContains: 1, items: {} },
          { type: "array", contains: { type: "integer" }, minContains: 2, items: { type: "integer" } },
        ],
      },
      note: { type: "string" },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "contains_items", schema } },
  };
  const { message } = processed('{values: ["1", "2"], note: "ok"}', req);
  assert.deepEqual(JSON.parse(message.content), { values: [1, 2], note: "ok" });

  const tool = { type: "function", function: { name: "set_contains_items", parameters: schema } };
  const call = { function: { name: "set_contains_items", arguments: '{"values":["3","4"],"note":"ok"}' } };
  const normalized = processed("", request("Set contains items.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: [3, 4], note: "ok" });
});

await test("94 schema-declared arrays wrap scalar values", () => {
  const schema = {
    type: "object",
    properties: {
      values: { type: "array", items: { type: "integer" } },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "scalar_array", schema } },
  };
  const { message } = processed('{values: 7}', req);
  assert.deepEqual(JSON.parse(message.content), { values: [7] });

  const tool = { type: "function", function: { name: "set_scalar_array", parameters: schema } };
  const call = { function: { name: "set_scalar_array", arguments: '{"values":8}' } };
  const normalized = processed("", request("Set scalar array.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: [8] });
});

await test("95 Responses adapter preserves upstream created timestamp", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then(() => {
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({
          id: "chatcmpl_created",
          created: 1234567890,
          model: "gemma-test",
          choices: [
            {
              finish_reason: "stop",
              message: { role: "assistant", content: "done" },
            },
          ],
        }));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(),
    timeoutSec: 10,
  });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", input: "Finish." }),
    });
    const json = await res.json();
    assert.equal(json.created_at, 1234567890);
    assert.equal(json.status, "completed");
    assert.equal(json.output_text, "done");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("96 boolean false schemas reject extra tuple items", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          values: { type: "array", prefixItems: [{ type: "integer" }], items: false },
          flag: { type: "string" },
        },
      },
      {
        properties: {
          values: { type: "array", items: { type: "integer" } },
          flag: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "boolean_false", schema } },
  };
  const { message } = processed('{values: ["1", "2"], flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { values: [1, 2], flag: true });

  const tool = { type: "function", function: { name: "set_boolean_false", parameters: schema } };
  const call = { function: { name: "set_boolean_false", arguments: '{"values":["3","4"],"flag":"false"}' } };
  const normalized = processed("", request("Set boolean false.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: [3, 4], flag: false });
});

await test("97 properties and patternProperties both apply to a property", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          x_count: { type: "integer" },
          flag: { type: "string" },
        },
        patternProperties: {
          "^x_": { maximum: 5 },
        },
      },
      {
        properties: {
          x_count: { type: "integer" },
          flag: { type: "boolean" },
        },
        patternProperties: {
          "^x_": { minimum: 6 },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "property_pattern", schema } },
  };
  const { message } = processed('{x_count: "7 items", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { x_count: 7, flag: true });

  const tool = { type: "function", function: { name: "set_property_pattern", parameters: schema } };
  const call = { function: { name: "set_property_pattern", arguments: '{"x_count":"8 items","flag":"false"}' } };
  const normalized = processed("", request("Set property pattern.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { x_count: 8, flag: false });
});

await test("98 all matching patternProperties apply", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: { flag: { type: "string" } },
        patternProperties: {
          "^x_": { type: "integer" },
          "_count$": { maximum: 5 },
        },
      },
      {
        properties: { flag: { type: "boolean" } },
        patternProperties: {
          "^x_": { type: "integer" },
          "_count$": { minimum: 6 },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "multi_pattern", schema } },
  };
  const { message } = processed('{x_count: "9 items", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { x_count: 9, flag: true });

  const tool = { type: "function", function: { name: "set_multi_pattern", parameters: schema } };
  const call = { function: { name: "set_multi_pattern", arguments: '{"x_count":"10 items","flag":"false"}' } };
  const normalized = processed("", request("Set multi pattern.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { x_count: 10, flag: false });
});

await test("99 numeric boolean and null enum values are canonicalized", () => {
  const schema = {
    type: "object",
    properties: {
      code: { enum: [1, 2] },
      enabled: { enum: [true, false] },
      status: { enum: [null, "ok"] },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "scalar_enums", schema } },
  };
  const { message } = processed('{code: "2", enabled: "true", status: "null"}', req);
  assert.deepEqual(JSON.parse(message.content), { code: 2, enabled: true, status: null });

  const tool = { type: "function", function: { name: "set_scalar_enums", parameters: schema } };
  const call = { function: { name: "set_scalar_enums", arguments: '{"code":"1","enabled":"false","status":"null"}' } };
  const normalized = processed("", request("Set scalar enums.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { code: 1, enabled: false, status: null });
});

await test("100 object enum values match by JSON value", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          shape: { enum: [{ kind: "text" }] },
          flag: { type: "string" },
        },
      },
      {
        properties: {
          shape: { enum: [{ kind: "count" }] },
          flag: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "object_enum", schema } },
  };
  const { message } = processed('{shape: {kind: "count"}, flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { shape: { kind: "count" }, flag: true });

  const tool = { type: "function", function: { name: "set_object_enum", parameters: schema } };
  const call = { function: { name: "set_object_enum", arguments: '{"shape":{"kind":"count"},"flag":"false"}' } };
  const normalized = processed("", request("Set object enum.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { shape: { kind: "count" }, flag: false });
});

await test("101 string format constraints choose matching schema branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          contact: { type: "string", format: "email" },
          flag: { type: "string" },
        },
      },
      {
        properties: {
          contact: { type: "string", format: "date" },
          flag: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "formats", schema } },
  };
  const { message } = processed('{contact: "2026-06-11", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { contact: "2026-06-11", flag: true });

  const tool = { type: "function", function: { name: "set_formats", parameters: schema } };
  const call = { function: { name: "set_formats", arguments: '{"contact":"2026-06-12","flag":"false"}' } };
  const normalized = processed("", request("Set formats.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { contact: "2026-06-12", flag: false });
});

await test("102 string length counts Unicode code points", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          label: { type: "string", maxLength: 2 },
          flag: { type: "boolean" },
        },
      },
      {
        properties: {
          label: { type: "string", minLength: 3 },
          flag: { type: "string" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "unicode_length", schema } },
  };
  const { message } = processed('{label: "🙂x", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { label: "🙂x", flag: true });

  const tool = { type: "function", function: { name: "set_unicode_length", parameters: schema } };
  const call = { function: { name: "set_unicode_length", arguments: '{"label":"🙂y","flag":"false"}' } };
  const normalized = processed("", request("Set unicode length.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { label: "🙂y", flag: false });
});

await test("103 schema-declared object fields parse JSON strings", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        type: "object",
        properties: {
          count: { type: "integer" },
          enabled: { type: "boolean" },
        },
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "nested_object_string", schema } },
  };
  const { message } = processed(JSON.stringify({ payload: JSON.stringify({ count: "7", enabled: "true" }) }), req);
  assert.deepEqual(JSON.parse(message.content), { payload: { count: 7, enabled: true } });

  const tool = { type: "function", function: { name: "set_nested_object_string", parameters: schema } };
  const call = { function: { name: "set_nested_object_string", arguments: JSON.stringify({ payload: JSON.stringify({ count: "3", enabled: "false" }) }) } };
  const normalized = processed("", request("Set nested object string.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { payload: { count: 3, enabled: false } });
});

await test("104 schema-declared array fields parse JSON strings", () => {
  const schema = {
    type: "object",
    properties: {
      rows: {
        type: "array",
        items: {
          type: "object",
          properties: { count: { type: "integer" } },
        },
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "nested_array_string", schema } },
  };
  const { message } = processed(JSON.stringify({ rows: JSON.stringify([{ count: "1" }, { count: "2" }]) }), req);
  assert.deepEqual(JSON.parse(message.content), { rows: [{ count: 1 }, { count: 2 }] });

  const tool = { type: "function", function: { name: "set_nested_array_string", parameters: schema } };
  const call = { function: { name: "set_nested_array_string", arguments: JSON.stringify({ rows: JSON.stringify([{ count: "4" }, { count: "5" }]) }) } };
  const normalized = processed("", request("Set nested array string.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { rows: [{ count: 4 }, { count: 5 }] });
});

await test("105 draft-07 additionalItems applies to tuple arrays", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          values: { type: "array", items: [{ type: "integer" }], additionalItems: false },
          flag: { type: "string" },
        },
      },
      {
        properties: {
          values: { type: "array", items: [{ type: "integer" }], additionalItems: { type: "boolean" } },
          flag: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "additional_items", schema } },
  };
  const { message } = processed('{values: ["1", "true"], flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { values: [1, true], flag: true });

  const tool = { type: "function", function: { name: "set_additional_items", parameters: schema } };
  const call = { function: { name: "set_additional_items", arguments: '{"values":["2","false"],"flag":"false"}' } };
  const normalized = processed("", request("Set additional items.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: [2, false], flag: false });
});

await test("106 object const values match by JSON value", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          shape: { const: { kind: "text" } },
          flag: { type: "string" },
        },
      },
      {
        properties: {
          shape: { const: { kind: "count" } },
          flag: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "object_const", schema } },
  };
  const { message } = processed('{shape: {kind: "count"}, flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { shape: { kind: "count" }, flag: true });

  const tool = { type: "function", function: { name: "set_object_const", parameters: schema } };
  const call = { function: { name: "set_object_const", arguments: '{"shape":{"kind":"count"},"flag":"false"}' } };
  const normalized = processed("", request("Set object const.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { shape: { kind: "count" }, flag: false });
});

await test("107 JSON schema root scalar responses are repaired", () => {
  const intReq = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the number." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "root_integer", schema: { type: "integer" } } },
  };
  assert.equal(processed("42", intReq).message.content, "42");

  const boolReq = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the flag." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "root_boolean", schema: { type: "boolean" } } },
  };
  assert.equal(processed("true", boolReq).message.content, "true");

  const stringReq = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the label." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "root_string", schema: { type: "string" } } },
  };
  assert.equal(processed('"ready"', stringReq).message.content, '"ready"');
});

await test("108 contains true honors maxContains", () => {
  const schema = {
    type: "object",
    properties: {
      values: {
        anyOf: [
          { type: "array", contains: true, maxContains: 1, items: { type: "string" } },
          { type: "array", minItems: 2, items: { type: "integer" } },
        ],
      },
      flag: { type: "boolean" },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "contains_true", schema } },
  };
  const { message } = processed('{values: ["1", "2"], flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { values: [1, 2], flag: true });

  const tool = { type: "function", function: { name: "set_contains_true", parameters: schema } };
  const call = { function: { name: "set_contains_true", arguments: '{"values":["3","4"],"flag":"false"}' } };
  const normalized = processed("", request("Set contains true.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: [3, 4], flag: false });
});

await test("109 contains false rejects arrays by default", () => {
  const schema = {
    type: "object",
    properties: {
      values: {
        anyOf: [
          { type: "array", contains: false, items: { type: "string" } },
          { type: "array", items: { type: "integer" } },
        ],
      },
      flag: { type: "boolean" },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "contains_false", schema } },
  };
  const { message } = processed('{values: ["5"], flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { values: [5], flag: true });

  const tool = { type: "function", function: { name: "set_contains_false", parameters: schema } };
  const call = { function: { name: "set_contains_false", arguments: '{"values":["6"],"flag":"false"}' } };
  const normalized = processed("", request("Set contains false.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: [6], flag: false });
});

await test("110 ambiguous oneOf branches do not coerce", () => {
  const schema = {
    type: "object",
    properties: {
      choice: {
        oneOf: [
          { type: "object", properties: { x: { type: "integer" } } },
          { type: "object", properties: { x: { type: "integer" }, y: { type: "string" } } },
        ],
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "ambiguous_oneof", schema } },
  };
  const { message } = processed('{choice: {x: "7", y: "yes"}}', req);
  assert.deepEqual(JSON.parse(message.content), { choice: { x: "7", y: "yes" } });

  const tool = { type: "function", function: { name: "set_ambiguous_oneof", parameters: schema } };
  const call = { function: { name: "set_ambiguous_oneof", arguments: '{"choice":{"x":"8","y":"no"}}' } };
  const normalized = processed("", request("Set ambiguous oneOf.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { choice: { x: "8", y: "no" } });
});

await test("111 exact oneOf branches still coerce", () => {
  const schema = {
    type: "object",
    properties: {
      choice: {
        oneOf: [
          { type: "object", properties: { kind: { const: "text" }, value: { type: "string" } } },
          { type: "object", properties: { kind: { const: "count" }, value: { type: "integer" } } },
        ],
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "exact_oneof", schema } },
  };
  const { message } = processed('{choice: {kind: "count", value: "9 items"}}', req);
  assert.deepEqual(JSON.parse(message.content), { choice: { kind: "count", value: 9 } });

  const tool = { type: "function", function: { name: "set_exact_oneof", parameters: schema } };
  const call = { function: { name: "set_exact_oneof", arguments: '{"choice":{"kind":"count","value":"10 items"}}' } };
  const normalized = processed("", request("Set exact oneOf.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { choice: { kind: "count", value: 10 } });
});

await test("112 schema primitive coercion ignores prose markers", () => {
  const schema = {
    type: "object",
    properties: {
      enabled: { type: "boolean" },
      score: { type: ["integer", "null"] },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "no_prose_markers", schema } },
  };
  const { message } = processed('{enabled: "yes", score: "not provided"}', req);
  assert.deepEqual(JSON.parse(message.content), { enabled: "yes", score: "not provided" });

  const tool = { type: "function", function: { name: "set_no_prose_markers", parameters: schema } };
  const call = { function: { name: "set_no_prose_markers", arguments: '{"enabled":"no","score":"unknown"}' } };
  const normalized = processed("", request("Set prose markers.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { enabled: "no", score: "unknown" });
});

await test("113 unevaluatedProperties schemas coerce extra object fields", () => {
  const schema = {
    type: "object",
    properties: { name: { type: "string" } },
    unevaluatedProperties: { type: "integer" },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "unevaluated_props", schema } },
  };
  const { message } = processed('{name: "alpha", count: "7 items"}', req);
  assert.deepEqual(JSON.parse(message.content), { name: "alpha", count: 7 });

  const tool = { type: "function", function: { name: "set_unevaluated_props", parameters: schema } };
  const call = { function: { name: "set_unevaluated_props", arguments: '{"name":"beta","count":"8 items"}' } };
  const normalized = processed("", request("Set unevaluated props.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { name: "beta", count: 8 });
});

await test("114 unevaluatedItems schemas coerce tuple extras", () => {
  const schema = {
    type: "array",
    prefixItems: [{ type: "string" }],
    unevaluatedItems: { type: "integer" },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the tuple." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "unevaluated_items", schema } },
  };
  const { message } = processed('["row", "1 item", "2 items"]', req);
  assert.deepEqual(JSON.parse(message.content), ["row", 1, 2]);

  const tool = { type: "function", function: { name: "set_unevaluated_items", parameters: { type: "object", properties: { values: schema } } } };
  const call = { function: { name: "set_unevaluated_items", arguments: '{"values":["row","3 items","4 items"]}' } };
  const normalized = processed("", request("Set unevaluated items.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: ["row", 3, 4] });
});

await test("115 OpenAPI discriminator mappings select union branches", () => {
  const schema = {
    $defs: {
      cat: { type: "object", properties: { kind: { type: "string" }, lives: { type: "integer" } } },
      dog: { type: "object", properties: { kind: { type: "string" }, bark_volume: { type: "boolean" } } },
    },
    oneOf: [{ $ref: "#/$defs/cat" }, { $ref: "#/$defs/dog" }],
    discriminator: {
      propertyName: "kind",
      mapping: {
        cat: "#/$defs/cat",
        dog: "#/$defs/dog",
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "discriminator", schema } },
  };
  const { message } = processed('{kind: "dog", bark_volume: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { kind: "dog", bark_volume: true });

  const tool = { type: "function", function: { name: "set_discriminator", parameters: schema } };
  const call = { function: { name: "set_discriminator", arguments: '{"kind":"cat","lives":"9 lives"}' } };
  const normalized = processed("", request("Set discriminator.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { kind: "cat", lives: 9 });
});

await test("116 contains-only schemas coerce matching array items", () => {
  const schema = {
    type: "object",
    properties: {
      values: {
        anyOf: [
          { type: "array", contains: { type: "boolean" }, minContains: 1 },
          { type: "array", contains: { type: "integer" }, minContains: 2 },
        ],
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "contains_only", schema } },
  };
  const { message } = processed('{values: ["1 item", "2 items"]}', req);
  assert.deepEqual(JSON.parse(message.content), { values: [1, 2] });

  const tool = { type: "function", function: { name: "set_contains_only", parameters: schema } };
  const call = { function: { name: "set_contains_only", arguments: '{"values":["3 items","4 items"]}' } };
  const normalized = processed("", request("Set contains only.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: [3, 4] });
});

await test("117 hostname and IP formats choose matching schema branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      { properties: { host: { type: "string", format: "ipv4" }, value: { type: "boolean" } } },
      { properties: { host: { type: "string", format: "ipv6" }, value: { type: "integer" } } },
      { properties: { host: { type: "string", format: "hostname" }, value: { type: "number" } } },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "network_formats", schema } },
  };
  const { message } = processed('{host: "2001:db8::1", value: "6 units"}', req);
  assert.deepEqual(JSON.parse(message.content), { host: "2001:db8::1", value: 6 });

  const tool = { type: "function", function: { name: "set_network_formats", parameters: schema } };
  const call = { function: { name: "set_network_formats", arguments: '{"host":"api.example.com","value":"7.5 units"}' } };
  const normalized = processed("", request("Set network format.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { host: "api.example.com", value: 7.5 });
});

await test("118 regex json-pointer and URI-reference formats choose branches", () => {
  const uriSchema = {
    type: "object",
    anyOf: [
      { properties: { target: { type: "string", format: "json-pointer" }, count: { type: "boolean" } } },
      { properties: { target: { type: "string", format: "uri-reference" }, count: { type: "integer" } } },
    ],
  };
  const regexSchema = {
    type: "object",
    anyOf: [
      { properties: { target: { type: "string", format: "json-pointer" }, count: { type: "boolean" } } },
      { properties: { target: { type: "string", format: "regex" }, count: { type: "number" } } },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "uri_reference_format", schema: uriSchema } },
  };
  const { message } = processed('{target: "(", count: "4 items"}', req);
  assert.deepEqual(JSON.parse(message.content), { target: "(", count: 4 });

  const tool = { type: "function", function: { name: "set_string_formats", parameters: regexSchema } };
  const call = { function: { name: "set_string_formats", arguments: '{"target":"[A-Z]+","count":"2.5"}' } };
  const normalized = processed("", request("Set string format.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { target: "[A-Z]+", count: 2.5 });
});

await test("119 Responses tool_choice mode objects map to chat strings", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.equal(payload.tool_choice, "required");
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("ok")));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        input: "Use a tool.",
        tools: [{ type: "function", name: "noop", input_schema: { type: "object" } }],
        tool_choice: { type: "required" },
      }),
    });
    const json = await res.json();
    assert.equal(json.output_text, "ok");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("120 Responses reasoning and chat-compatible generation fields pass through", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.equal(payload.reasoning_effort, "medium");
        assert.equal(payload.service_tier, "flex");
        assert.deepEqual(payload.prediction, { type: "content", content: "expected" });
        assert.deepEqual(payload.modalities, ["text"]);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("ok")));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        input: "Say ok.",
        reasoning: { effort: "medium" },
        service_tier: "flex",
        prediction: { type: "content", content: "expected" },
        modalities: ["text"],
      }),
    });
    const json = await res.json();
    assert.equal(json.output_text, "ok");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("121 Responses multimodal and file content parts preserve references", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.deepEqual(payload.messages, [
          { role: "user", content: "Inspect this\n[image: https://example.com/screen.png]\n[file: report.pdf (file_123)]" },
        ]);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("ok")));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        input: [
          {
            type: "message",
            role: "user",
            content: [
              { type: "input_text", text: "Inspect this" },
              { type: "input_image", image_url: "https://example.com/screen.png" },
              { type: "input_file", filename: "report.pdf", file_id: "file_123" },
            ],
          },
        ],
      }),
    });
    const json = await res.json();
    assert.equal(json.output_text, "ok");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("122 Responses reasoning input items are not replayed as user text", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then((payload) => {
        assert.deepEqual(payload.messages, [
          { role: "user", content: "Start." },
          { role: "user", content: "Continue." },
        ]);
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response("ok")));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        input: [
          { role: "user", content: "Start." },
          { type: "reasoning", summary: [{ type: "summary_text", text: "hidden chain" }] },
          { role: "user", content: "Continue." },
        ],
      }),
    });
    const json = await res.json();
    assert.equal(json.output_text, "ok");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("123 Responses output maps chat refusal content", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        id: "chatcmpl_refusal",
        model: "gemma-test",
        choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: null, refusal: "I cannot comply." } }],
      }));
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", input: "Do the task." }),
    });
    const json = await res.json();
    assert.equal(json.output[0].content[0].type, "refusal");
    assert.equal(json.output[0].content[0].refusal, "I cannot comply.");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("124 Responses usage maps chat token details", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ...response("ok"),
        usage: {
          prompt_tokens: 10,
          completion_tokens: 3,
          total_tokens: 13,
          prompt_tokens_details: { cached_tokens: 4 },
          completion_tokens_details: { reasoning_tokens: 2 },
        },
      }));
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  try {
    const address = app.server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", input: "Say ok." }),
    });
    const json = await res.json();
    assert.deepEqual(json.usage, {
      input_tokens: 10,
      output_tokens: 3,
      total_tokens: 13,
      input_tokens_details: { cached_tokens: 4 },
      output_tokens_details: { reasoning_tokens: 2 },
    });
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("125 allOf closed object schemas merge declared properties", () => {
  const schema = {
    allOf: [
      {
        type: "object",
        additionalProperties: false,
        required: ["kind"],
        properties: {
          kind: { const: "metric" },
          count: { type: "integer" },
        },
      },
      {
        type: "object",
        additionalProperties: false,
        required: ["enabled"],
        properties: {
          enabled: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "allof_closed", schema } },
  };
  const { message } = processed('{kind: "metric", count: "7 items", enabled: "true", extra: "drop"}', req);
  assert.deepEqual(JSON.parse(message.content), { kind: "metric", count: 7, enabled: true });

  const tool = { type: "function", function: { name: "set_allof_closed", parameters: schema } };
  const call = { function: { name: "set_allof_closed", arguments: '{"kind":"metric","count":"8 items","enabled":"false","extra":"drop"}' } };
  const normalized = processed("", request("Set closed allOf.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { kind: "metric", count: 8, enabled: false });
});

await test("126 OpenAPI int32 format constrains integer branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      { properties: { port: { type: "integer", format: "int32" }, active: { type: "boolean" } } },
      { properties: { port: { type: "integer", minimum: 2147483648 }, active: { type: "string" } } },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "int32_format", schema } },
  };
  const { message } = processed('{port: "443", active: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { port: 443, active: true });

  const tool = { type: "function", function: { name: "set_int32_format", parameters: schema } };
  const call = { function: { name: "set_int32_format", arguments: '{"port":"8443","active":"false"}' } };
  const normalized = processed("", request("Set int32.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { port: 8443, active: false });
});

await test("127 OpenAPI int64 format accepts larger integer branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      { properties: { id: { type: "integer", format: "int32" }, flag: { type: "string" } } },
      { properties: { id: { type: "integer", format: "int64" }, flag: { type: "boolean" } } },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "int64_format", schema } },
  };
  const { message } = processed('{id: "5000000000", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { id: 5000000000, flag: true });

  const tool = { type: "function", function: { name: "set_int64_format", parameters: schema } };
  const call = { function: { name: "set_int64_format", arguments: '{"id":"6000000000","flag":"false"}' } };
  const normalized = processed("", request("Set int64.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { id: 6000000000, flag: false });
});

await test("128 OpenAPI byte string format chooses matching branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      { properties: { payload: { type: "string", format: "byte" }, count: { type: "integer" } } },
      { properties: { payload: { type: "string", format: "duration" }, count: { type: "boolean" } } },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "byte_format", schema } },
  };
  const { message } = processed('{payload: "SGVsbG8=", count: "5 items"}', req);
  assert.deepEqual(JSON.parse(message.content), { payload: "SGVsbG8=", count: 5 });

  const tool = { type: "function", function: { name: "set_byte_format", parameters: schema } };
  const call = { function: { name: "set_byte_format", arguments: '{"payload":"V29ybGQ=","count":"6 items"}' } };
  const normalized = processed("", request("Set byte.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { payload: "V29ybGQ=", count: 6 });
});

await test("129 ISO duration string format chooses matching branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      { properties: { delay: { type: "string", format: "byte" }, enabled: { type: "string" } } },
      { properties: { delay: { type: "string", format: "duration" }, enabled: { type: "boolean" } } },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "duration_format", schema } },
  };
  const { message } = processed('{delay: "P1DT2H", enabled: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { delay: "P1DT2H", enabled: true });

  const tool = { type: "function", function: { name: "set_duration_format", parameters: schema } };
  const call = { function: { name: "set_duration_format", arguments: '{"delay":"PT30M","enabled":"false"}' } };
  const normalized = processed("", request("Set duration.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { delay: "PT30M", enabled: false });
});

await test("130 object and array const values canonicalize from JSON strings", () => {
  const schema = {
    type: "object",
    properties: {
      shape: { const: { kind: "count" } },
      path: { const: ["root", "leaf"] },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "json_const_strings", schema } },
  };
  const { message } = processed(JSON.stringify({ shape: JSON.stringify({ kind: "count" }), path: JSON.stringify(["root", "leaf"]) }), req);
  assert.deepEqual(JSON.parse(message.content), { shape: { kind: "count" }, path: ["root", "leaf"] });

  const tool = { type: "function", function: { name: "set_json_const_strings", parameters: schema } };
  const call = { function: { name: "set_json_const_strings", arguments: JSON.stringify({ shape: JSON.stringify({ kind: "count" }), path: JSON.stringify(["root", "leaf"]) }) } };
  const normalized = processed("", request("Set JSON const strings.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { shape: { kind: "count" }, path: ["root", "leaf"] });
});

await test("131 object and array enum values canonicalize from JSON strings", () => {
  const schema = {
    type: "object",
    properties: {
      shape: { enum: [{ kind: "count" }, { kind: "text" }] },
      path: { enum: [["root", "leaf"], ["root", "branch"]] },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "json_enum_strings", schema } },
  };
  const { message } = processed(JSON.stringify({ shape: JSON.stringify({ kind: "text" }), path: JSON.stringify(["root", "branch"]) }), req);
  assert.deepEqual(JSON.parse(message.content), { shape: { kind: "text" }, path: ["root", "branch"] });

  const tool = { type: "function", function: { name: "set_json_enum_strings", parameters: schema } };
  const call = { function: { name: "set_json_enum_strings", arguments: JSON.stringify({ shape: JSON.stringify({ kind: "count" }), path: JSON.stringify(["root", "leaf"]) }) } };
  const normalized = processed("", request("Set JSON enum strings.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { shape: { kind: "count" }, path: ["root", "leaf"] });
});

await test("132 integer schemas do not truncate fractional numbers", () => {
  const schema = {
    type: "object",
    properties: {
      count: { type: "integer" },
      score: { type: "number" },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "fractional_integer_guard", schema } },
  };
  const { message } = processed('{count: "7.5", score: "7.5"}', req);
  assert.deepEqual(JSON.parse(message.content), { count: "7.5", score: 7.5 });

  const tool = { type: "function", function: { name: "set_fractional_integer_guard", parameters: schema } };
  const call = { function: { name: "set_fractional_integer_guard", arguments: '{"count":"8.25","score":"8.25"}' } };
  const normalized = processed("", request("Set fractional integer guard.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { count: "8.25", score: 8.25 });
});

await test("133 numeric coercion respects declared constraints", () => {
  const schema = {
    type: "object",
    properties: {
      port: { type: "integer", format: "int32" },
      ratio: { type: "number", minimum: 0, maximum: 1 },
      even: { type: "integer", multipleOf: 2 },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "numeric_constraint_guard", schema } },
  };
  const { message } = processed('{port: "5000000000", ratio: "1.25", even: "5"}', req);
  assert.deepEqual(JSON.parse(message.content), { port: "5000000000", ratio: "1.25", even: "5" });

  const tool = { type: "function", function: { name: "set_numeric_constraint_guard", parameters: schema } };
  const validCall = { function: { name: "set_numeric_constraint_guard", arguments: '{"port":"443","ratio":"0.75","even":"6"}' } };
  const valid = processed("", request("Set numeric constraints.", { tools: [tool] }), [validCall]).message;
  assert.deepEqual(args(valid.tool_calls[0]), { port: 443, ratio: 0.75, even: 6 });

  const invalidCall = { function: { name: "set_numeric_constraint_guard", arguments: '{"port":"6000000000","ratio":"-0.1","even":"7"}' } };
  const invalid = processed("", request("Set numeric constraints.", { tools: [tool] }), [invalidCall]).message;
  assert.deepEqual(args(invalid.tool_calls[0]), { port: "6000000000", ratio: "-0.1", even: "7" });
});

await test("134 string coercion respects declared constraints", () => {
  const schema = {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      code: { type: "string", pattern: "^[A-Z]{3}$" },
      short: { type: "string", maxLength: 3 },
      note: { type: "string" },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "string_constraint_guard", schema } },
  };
  const { message } = processed('{id: 123, code: 42, short: 1234, note: 99}', req);
  assert.deepEqual(JSON.parse(message.content), { id: 123, code: 42, short: 1234, note: "99" });

  const tool = { type: "function", function: { name: "set_string_constraint_guard", parameters: schema } };
  const call = { function: { name: "set_string_constraint_guard", arguments: '{"id":"550e8400-e29b-41d4-a716-446655440000","code":"ABC","short":321,"note":88}' } };
  const normalized = processed("", request("Set string constraints.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), {
    id: "550e8400-e29b-41d4-a716-446655440000",
    code: "ABC",
    short: "321",
    note: "88",
  });
});

await test("135 scalar-to-array coercion respects cardinality constraints", () => {
  const schema = {
    type: "object",
    properties: {
      tags: { type: "array", minItems: 2, items: { type: "string" } },
      one: { type: "array", maxItems: 1, items: { type: "integer" } },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "array_cardinality_guard", schema } },
  };
  const { message } = processed('{tags: "alpha", one: "7"}', req);
  assert.deepEqual(JSON.parse(message.content), { tags: "alpha", one: [7] });

  const tool = { type: "function", function: { name: "set_array_cardinality_guard", parameters: schema } };
  const call = { function: { name: "set_array_cardinality_guard", arguments: '{"tags":"alpha,beta","one":"8"}' } };
  const normalized = processed("", request("Set array cardinality.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { tags: ["alpha", "beta"], one: [8] });
});

await test("136 scalar-to-array coercion respects contains constraints", () => {
  const schema = {
    type: "object",
    properties: {
      thresholds: { type: "array", contains: { type: "integer", minimum: 10 } },
      lows: { type: "array", contains: { type: "integer", minimum: 10 } },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "array_contains_guard", schema } },
  };
  const { message } = processed('{thresholds: "12", lows: "5"}', req);
  assert.deepEqual(JSON.parse(message.content), { thresholds: [12], lows: "5" });

  const tool = { type: "function", function: { name: "set_array_contains_guard", parameters: schema } };
  const call = { function: { name: "set_array_contains_guard", arguments: '{"thresholds":"15","lows":"4"}' } };
  const normalized = processed("", request("Set array contains.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { thresholds: [15], lows: "4" });
});

await test("137 scalar-to-array coercion respects boolean item schemas", () => {
  const schema = {
    type: "object",
    properties: {
      blocked: { type: "array", items: false },
      open: { type: "array", items: true },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "array_boolean_item_guard", schema } },
  };
  const { message } = processed('{blocked: "x", open: "x"}', req);
  assert.deepEqual(JSON.parse(message.content), { blocked: "x", open: ["x"] });

  const tool = { type: "function", function: { name: "set_array_boolean_item_guard", parameters: schema } };
  const call = { function: { name: "set_array_boolean_item_guard", arguments: '{"blocked":"y","open":"y"}' } };
  const normalized = processed("", request("Set array boolean item guard.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { blocked: "y", open: ["y"] });
});

await test("138 scalar-to-array coercion does not split English conjunctions", () => {
  const schema = {
    type: "object",
    properties: {
      tags: { type: "array", minItems: 2, items: { type: "string" } },
      listed: { type: "array", minItems: 2, items: { type: "string" } },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "array_split_guard", schema } },
  };
  const { message } = processed('{tags: "alpha and beta", listed: "alpha; beta"}', req);
  assert.deepEqual(JSON.parse(message.content), { tags: "alpha and beta", listed: ["alpha", "beta"] });

  const tool = { type: "function", function: { name: "set_array_split_guard", parameters: schema } };
  const call = { function: { name: "set_array_split_guard", arguments: '{"tags":"gamma and delta","listed":"gamma, delta"}' } };
  const normalized = processed("", request("Set array split guard.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { tags: "gamma and delta", listed: ["gamma", "delta"] });
});

await test("139 scalar JSON Schema conditionals coerce matching branches", () => {
  const schema = {
    type: "object",
    properties: {
      value: {
        if: { type: "string", pattern: "^\\d+$" },
        then: { type: "integer" },
        else: { type: "string" },
      },
      label: {
        if: { type: "string", minLength: 4 },
        then: { type: "string", maxLength: 5 },
        else: { type: "string", minLength: 1 },
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "scalar_conditional", schema } },
  };
  const { message } = processed('{value: "42", label: 1234}', req);
  assert.deepEqual(JSON.parse(message.content), { value: 42, label: "1234" });

  const tool = { type: "function", function: { name: "set_scalar_conditional", parameters: schema } };
  const call = { function: { name: "set_scalar_conditional", arguments: '{"value":"abc","label":99}' } };
  const normalized = processed("", request("Set scalar conditional.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { value: "abc", label: "99" });
});

await test("140 root scalar JSON Schema conditionals coerce matching branches", () => {
  const schema = {
    if: { type: "string", pattern: "^#\\d{3}$" },
    then: { type: "integer", minimum: 100 },
    else: { type: "string" },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the scalar." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "root_scalar_conditional", schema } },
  };
  const { message } = processed('"#123"', req);
  assert.equal(JSON.parse(message.content), 123);
});

await test("141 array JSON Schema conditionals coerce matching item branches", () => {
  const schema = {
    type: "object",
    properties: {
      values: {
        type: "array",
        if: { minItems: 2 },
        then: { items: { type: "integer" } },
        else: { items: { type: "string" } },
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "array_conditional", schema } },
  };
  const { message } = processed('{values: ["1", "2"]}', req);
  assert.deepEqual(JSON.parse(message.content), { values: [1, 2] });

  const tool = { type: "function", function: { name: "set_array_conditional", parameters: schema } };
  const call = { function: { name: "set_array_conditional", arguments: '{"values":["7"]}' } };
  const normalized = processed("", request("Set array conditional.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { values: ["7"] });
});

await test("142 conditional union branches validate after branch coercion", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          payload: {
            if: { type: "string", pattern: "^\\d+$" },
            then: { type: "integer", minimum: 10 },
            else: { type: "string" },
          },
          flag: { type: "boolean" },
        },
      },
      {
        properties: {
          payload: { type: "string", maxLength: 2 },
          flag: { type: "string" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "conditional_union", schema } },
  };
  const { message } = processed('{payload: "12", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { payload: 12, flag: true });

  const tool = { type: "function", function: { name: "set_conditional_union", parameters: schema } };
  const call = { function: { name: "set_conditional_union", arguments: '{"payload":"xy","flag":"kept"}' } };
  const normalized = processed("", request("Set conditional union.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { payload: "xy", flag: "kept" });
});

await test("143 boolean false property schemas prune prohibited fields", () => {
  const schema = {
    type: "object",
    properties: {
      public: { type: "string" },
      secret: false,
      count: { type: "integer" },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "false_property", schema } },
  };
  const { message } = processed('{public: 7, secret: "drop", count: "3"}', req);
  assert.deepEqual(JSON.parse(message.content), { public: "7", count: 3 });

  const tool = { type: "function", function: { name: "set_false_property", parameters: schema } };
  const call = { function: { name: "set_false_property", arguments: '{"public":8,"secret":"drop","count":"4"}' } };
  const normalized = processed("", request("Set false property.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { public: "8", count: 4 });
});

await test("144 boolean false patternProperties prune matching fields", () => {
  const schema = {
    type: "object",
    properties: {
      keep: { type: "integer" },
    },
    patternProperties: {
      "^x-": false,
      "^n-": { type: "integer" },
    },
    additionalProperties: false,
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "false_pattern_property", schema } },
  };
  const { message } = processed('{keep: "1", "x-token": "drop", "n-score": "2", other: "drop"}', req);
  assert.deepEqual(JSON.parse(message.content), { keep: 1, "n-score": 2 });

  const tool = { type: "function", function: { name: "set_false_pattern_property", parameters: schema } };
  const call = { function: { name: "set_false_pattern_property", arguments: '{"keep":"3","x-token":"drop","n-score":"4","other":"drop"}' } };
  const normalized = processed("", request("Set false pattern property.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { keep: 3, "n-score": 4 });
});

await test("145 dependentSchemas false rejects incompatible union branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          token: { type: "string" },
          flag: { type: "string" },
        },
        dependentSchemas: { token: false },
      },
      {
        properties: {
          token: { type: "string" },
          flag: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "false_dependent_schema", schema } },
  };
  const { message } = processed('{token: "abc", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { token: "abc", flag: true });

  const tool = { type: "function", function: { name: "set_false_dependent_schema", parameters: schema } };
  const call = { function: { name: "set_false_dependent_schema", arguments: '{"token":"def","flag":"false"}' } };
  const normalized = processed("", request("Set false dependent schema.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { token: "def", flag: false });
});

await test("146 conditional then false rejects matching branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          payload: {
            if: { type: "string", pattern: "^skip" },
            then: false,
            else: { type: "string" },
          },
          flag: { type: "string" },
        },
      },
      {
        properties: {
          payload: { type: "string" },
          flag: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "then_false_conditional", schema } },
  };
  const { message } = processed('{payload: "skip-this", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { payload: "skip-this", flag: true });

  const tool = { type: "function", function: { name: "set_then_false_conditional", parameters: schema } };
  const call = { function: { name: "set_then_false_conditional", arguments: '{"payload":"skip-that","flag":"false"}' } };
  const normalized = processed("", request("Set then false conditional.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { payload: "skip-that", flag: false });
});

await test("147 conditional else false rejects nonmatching branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          payload: {
            if: { type: "string", pattern: "^ok" },
            then: { type: "integer" },
            else: false,
          },
          flag: { type: "boolean" },
        },
      },
      {
        properties: {
          payload: { type: "string" },
          flag: { type: "string" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "else_false_conditional", schema } },
  };
  const { message } = processed('{payload: "bad", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { payload: "bad", flag: "true" });

  const tool = { type: "function", function: { name: "set_else_false_conditional", parameters: schema } };
  const call = { function: { name: "set_else_false_conditional", arguments: '{"payload":"bad","flag":"false"}' } };
  const normalized = processed("", request("Set else false conditional.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { payload: "bad", flag: "false" });
});

await test("148 allOf overlapping property schemas preserve both constraints", () => {
  const schema = {
    allOf: [
      {
        type: "object",
        properties: {
          count: { type: "integer" },
          label: { type: "string" },
        },
      },
      {
        properties: {
          count: { minimum: 10 },
          label: { maxLength: 3 },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "allof_property_intersection", schema } },
  };
  const { message } = processed('{count: "12", label: 99}', req);
  assert.deepEqual(JSON.parse(message.content), { count: 12, label: "99" });

  const tool = { type: "function", function: { name: "set_allof_property_intersection", parameters: schema } };
  const call = { function: { name: "set_allof_property_intersection", arguments: '{"count":"14","label":88}' } };
  const normalized = processed("", request("Set allOf property intersection.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { count: 14, label: "88" });
});

await test("149 allOf overlapping patternProperties preserve both constraints", () => {
  const schema = {
    allOf: [
      {
        type: "object",
        patternProperties: {
          "^n-": { type: "integer" },
        },
      },
      {
        patternProperties: {
          "^n-": { minimum: 10 },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "allof_pattern_intersection", schema } },
  };
  const { message } = processed('{"n-score": "12"}', req);
  assert.deepEqual(JSON.parse(message.content), { "n-score": 12 });

  const tool = { type: "function", function: { name: "set_allof_pattern_intersection", parameters: schema } };
  const call = { function: { name: "set_allof_pattern_intersection", arguments: '{"n-score":"16"}' } };
  const normalized = processed("", request("Set allOf pattern intersection.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { "n-score": 16 });
});

await test("150 allOf additionalProperties schemas preserve both constraints", () => {
  const schema = {
    allOf: [
      {
        type: "object",
        additionalProperties: { type: "integer" },
      },
      {
        additionalProperties: { minimum: 10 },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "allof_additional_intersection", schema } },
  };
  const { message } = processed('{extra: "12"}', req);
  assert.deepEqual(JSON.parse(message.content), { extra: 12 });

  const tool = { type: "function", function: { name: "set_allof_additional_intersection", parameters: schema } };
  const call = { function: { name: "set_allof_additional_intersection", arguments: '{"extra":"18"}' } };
  const normalized = processed("", request("Set allOf additional intersection.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { extra: 18 });
});

await test("151 allOf unevaluatedProperties schemas preserve both constraints", () => {
  const schema = {
    allOf: [
      {
        type: "object",
        unevaluatedProperties: { type: "integer" },
      },
      {
        unevaluatedProperties: { minimum: 10 },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "allof_unevaluated_intersection", schema } },
  };
  const { message } = processed('{extra: "12"}', req);
  assert.deepEqual(JSON.parse(message.content), { extra: 12 });

  const tool = { type: "function", function: { name: "set_allof_unevaluated_intersection", parameters: schema } };
  const call = { function: { name: "set_allof_unevaluated_intersection", arguments: '{"extra":"20"}' } };
  const normalized = processed("", request("Set allOf unevaluated intersection.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { extra: 20 });
});

await test("152 anyOf sibling object schemas apply after branch coercion", () => {
  const schema = {
    type: "object",
    properties: {
      kind: { type: "string" },
      count: { type: "integer" },
    },
    additionalProperties: false,
    anyOf: [
      { properties: { kind: { const: "metric" } } },
      { properties: { kind: { const: "label" } } },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "anyof_sibling_object", schema } },
  };
  const { message } = processed('{kind: "metric", count: "7", extra: "drop"}', req);
  assert.deepEqual(JSON.parse(message.content), { kind: "metric", count: 7 });

  const tool = { type: "function", function: { name: "set_anyof_sibling_object", parameters: schema } };
  const call = { function: { name: "set_anyof_sibling_object", arguments: '{"kind":"label","count":"8","extra":"drop"}' } };
  const normalized = processed("", request("Set anyOf sibling object.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { kind: "label", count: 8 });
});

await test("153 oneOf sibling object schemas apply defaults and coercion", () => {
  const schema = {
    type: "object",
    properties: {
      kind: { type: "string" },
      active: { type: "boolean" },
      mode: { type: "string", default: "auto" },
    },
    oneOf: [
      { required: ["kind"], properties: { kind: { const: "alpha" } } },
      { required: ["kind"], properties: { kind: { const: "beta" } } },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "oneof_sibling_object", schema } },
  };
  const { message } = processed('{kind: "alpha", active: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { kind: "alpha", active: true, mode: "auto" });

  const tool = { type: "function", function: { name: "set_oneof_sibling_object", parameters: schema } };
  const call = { function: { name: "set_oneof_sibling_object", arguments: '{"kind":"beta","active":"false"}' } };
  const normalized = processed("", request("Set oneOf sibling object.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { kind: "beta", active: false, mode: "auto" });
});

await test("154 discriminator union sibling schemas apply after mapped branch", () => {
  const schema = {
    type: "object",
    discriminator: { propertyName: "type" },
    properties: {
      type: { type: "string" },
      count: { type: "integer" },
    },
    additionalProperties: false,
    oneOf: [
      { properties: { type: { const: "counter" } } },
      { properties: { type: { const: "note" } } },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "discriminator_sibling_object", schema } },
  };
  const { message } = processed('{type: "counter", count: "11", extra: "drop"}', req);
  assert.deepEqual(JSON.parse(message.content), { type: "counter", count: 11 });

  const tool = { type: "function", function: { name: "set_discriminator_sibling_object", parameters: schema } };
  const call = { function: { name: "set_discriminator_sibling_object", arguments: '{"type":"note","count":"12","extra":"drop"}' } };
  const normalized = processed("", request("Set discriminator sibling object.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { type: "note", count: 12 });
});

await test("155 scalar union sibling enum constrains branch coercion", () => {
  const schema = {
    type: "object",
    properties: {
      value: {
        anyOf: [
          { type: "integer" },
          { type: "string" },
        ],
        enum: [42, "ready"],
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "scalar_union_sibling_enum", schema } },
  };
  const valid = processed('{value: "42"}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { value: 42 });
  const invalid = processed('{value: "43"}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { value: "43" });

  const tool = { type: "function", function: { name: "set_scalar_union_sibling_enum", parameters: schema } };
  const validCall = { function: { name: "set_scalar_union_sibling_enum", arguments: '{"value":"ready"}' } };
  const normalizedValid = processed("", request("Set scalar union sibling enum.", { tools: [tool] }), [validCall]).message;
  assert.deepEqual(args(normalizedValid.tool_calls[0]), { value: "ready" });

  const invalidCall = { function: { name: "set_scalar_union_sibling_enum", arguments: '{"value":"43"}' } };
  const normalizedInvalid = processed("", request("Set scalar union sibling enum.", { tools: [tool] }), [invalidCall]).message;
  assert.deepEqual(args(normalizedInvalid.tool_calls[0]), { value: "43" });
});

await test("156 numeric coercion respects not constraints", () => {
  const schema = {
    type: "object",
    properties: {
      blocked: { type: "integer", not: { const: 0 } },
      allowed: { type: "integer", not: { const: 0 } },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "numeric_not_guard", schema } },
  };
  const { message } = processed('{blocked: "0", allowed: "5"}', req);
  assert.deepEqual(JSON.parse(message.content), { blocked: "0", allowed: 5 });

  const tool = { type: "function", function: { name: "set_numeric_not_guard", parameters: schema } };
  const call = { function: { name: "set_numeric_not_guard", arguments: '{"blocked":"0","allowed":"6"}' } };
  const normalized = processed("", request("Set numeric not guard.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { blocked: "0", allowed: 6 });
});

await test("157 string coercion respects not constraints", () => {
  const schema = {
    type: "object",
    properties: {
      blocked: { type: "string", not: { pattern: "^1" } },
      allowed: { type: "string", not: { pattern: "^1" } },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "string_not_guard", schema } },
  };
  const { message } = processed('{blocked: 123, allowed: 456}', req);
  assert.deepEqual(JSON.parse(message.content), { blocked: 123, allowed: "456" });

  const tool = { type: "function", function: { name: "set_string_not_guard", parameters: schema } };
  const call = { function: { name: "set_string_not_guard", arguments: '{"blocked":123,"allowed":456}' } };
  const normalized = processed("", request("Set string not guard.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { blocked: 123, allowed: "456" });
});

await test("158 boolean coercion respects not constraints", () => {
  const schema = {
    type: "object",
    properties: {
      blocked: { type: "boolean", not: { const: true } },
      allowed: { type: "boolean", not: { const: true } },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "boolean_not_guard", schema } },
  };
  const { message } = processed('{blocked: "true", allowed: "false"}', req);
  assert.deepEqual(JSON.parse(message.content), { blocked: "true", allowed: false });

  const tool = { type: "function", function: { name: "set_boolean_not_guard", parameters: schema } };
  const call = { function: { name: "set_boolean_not_guard", arguments: '{"blocked":"true","allowed":"false"}' } };
  const normalized = processed("", request("Set boolean not guard.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { blocked: "true", allowed: false });
});

await test("159 array coercion respects not constraints", () => {
  const schema = {
    type: "object",
    properties: {
      blocked: { type: "array", items: { type: "integer" }, not: { contains: { const: 0 } } },
      allowed: { type: "array", items: { type: "integer" }, not: { contains: { const: 0 } } },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "array_not_guard", schema } },
  };
  const { message } = processed('{blocked: "0,1", allowed: "2,3"}', req);
  assert.deepEqual(JSON.parse(message.content), { blocked: "0,1", allowed: [2, 3] });

  const tool = { type: "function", function: { name: "set_array_not_guard", parameters: schema } };
  const call = { function: { name: "set_array_not_guard", arguments: '{"blocked":"0,1","allowed":"4,5"}' } };
  const normalized = processed("", request("Set array not guard.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { blocked: "0,1", allowed: [4, 5] });
});

await test("160 const coercion respects sibling type constraints", () => {
  const schema = {
    type: "object",
    properties: {
      blocked: { type: "string", const: 7 },
      allowed: { type: "integer", const: 7 },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "const_type_guard", schema } },
  };
  const { message } = processed('{blocked: "7", allowed: "7"}', req);
  assert.deepEqual(JSON.parse(message.content), { blocked: "7", allowed: 7 });

  const tool = { type: "function", function: { name: "set_const_type_guard", parameters: schema } };
  const call = { function: { name: "set_const_type_guard", arguments: '{"blocked":"7","allowed":"7"}' } };
  const normalized = processed("", request("Set const type guard.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { blocked: "7", allowed: 7 });
});

await test("161 enum coercion respects sibling type constraints", () => {
  const schema = {
    type: "object",
    properties: {
      blocked: { type: "string", enum: [7] },
      allowed: { type: "integer", enum: [7] },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "enum_type_guard", schema } },
  };
  const { message } = processed('{blocked: "7", allowed: "7"}', req);
  assert.deepEqual(JSON.parse(message.content), { blocked: "7", allowed: 7 });

  const tool = { type: "function", function: { name: "set_enum_type_guard", parameters: schema } };
  const call = { function: { name: "set_enum_type_guard", arguments: '{"blocked":"7","allowed":"7"}' } };
  const normalized = processed("", request("Set enum type guard.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { blocked: "7", allowed: 7 });
});

await test("162 const coercion respects sibling validation constraints", () => {
  const schema = {
    type: "object",
    properties: {
      blocked: { type: "string", const: "ABCD", maxLength: 3 },
      allowed: { type: "string", const: "ABC", maxLength: 3 },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "const_validation_guard", schema } },
  };
  const { message } = processed('{blocked: "abcd", allowed: "abc"}', req);
  assert.deepEqual(JSON.parse(message.content), { blocked: "abcd", allowed: "ABC" });

  const tool = { type: "function", function: { name: "set_const_validation_guard", parameters: schema } };
  const call = { function: { name: "set_const_validation_guard", arguments: '{"blocked":"abcd","allowed":"abc"}' } };
  const normalized = processed("", request("Set const validation guard.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { blocked: "abcd", allowed: "ABC" });
});

await test("163 enum coercion respects sibling validation constraints", () => {
  const schema = {
    type: "object",
    properties: {
      blocked: { type: "string", enum: ["ABCD"], maxLength: 3 },
      allowed: { type: "string", enum: ["ABC"], maxLength: 3 },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "enum_validation_guard", schema } },
  };
  const { message } = processed('{blocked: "abcd", allowed: "abc"}', req);
  assert.deepEqual(JSON.parse(message.content), { blocked: "abcd", allowed: "ABC" });

  const tool = { type: "function", function: { name: "set_enum_validation_guard", parameters: schema } };
  const call = { function: { name: "set_enum_validation_guard", arguments: '{"blocked":"abcd","allowed":"abc"}' } };
  const normalized = processed("", request("Set enum validation guard.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { blocked: "abcd", allowed: "ABC" });
});

await test("164 draft-07 dependency arrays reject incompatible union branches", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        properties: {
          card: { type: "string" },
          cvc: { type: "string" },
          flag: { type: "string" },
        },
        dependencies: { card: ["cvc"] },
      },
      {
        properties: {
          card: { type: "string" },
          flag: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "dependency_array_union", schema } },
  };
  const { message } = processed('{card: "4111", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { card: "4111", flag: true });

  const tool = { type: "function", function: { name: "set_dependency_array_union", parameters: schema } };
  const call = { function: { name: "set_dependency_array_union", arguments: '{"card":"4222","flag":"false"}' } };
  const normalized = processed("", request("Set dependency array union.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { card: "4222", flag: false });
});

await test("165 draft-07 schema dependencies coerce dependent fields", () => {
  const schema = {
    type: "object",
    properties: {
      kind: { type: "string" },
    },
    dependencies: {
      kind: {
        properties: {
          count: { type: "integer" },
        },
      },
    },
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "schema_dependency_coercion", schema } },
  };
  const { message } = processed('{kind: "metric", count: "7"}', req);
  assert.deepEqual(JSON.parse(message.content), { kind: "metric", count: 7 });

  const tool = { type: "function", function: { name: "set_schema_dependency_coercion", parameters: schema } };
  const call = { function: { name: "set_schema_dependency_coercion", arguments: '{"kind":"metric","count":"8"}' } };
  const normalized = processed("", request("Set schema dependency coercion.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { kind: "metric", count: 8 });
});

await test("166 allOf preserves draft-07 dependency arrays", () => {
  const schema = {
    type: "object",
    anyOf: [
      {
        allOf: [
          {
            properties: {
              card: { type: "string" },
              cvc: { type: "string" },
              flag: { type: "string" },
            },
            dependencies: { card: ["cvc"] },
          },
        ],
      },
      {
        properties: {
          card: { type: "string" },
          flag: { type: "boolean" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "allof_dependency_array", schema } },
  };
  const { message } = processed('{card: "4111", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { card: "4111", flag: true });

  const tool = { type: "function", function: { name: "set_allof_dependency_array", parameters: schema } };
  const call = { function: { name: "set_allof_dependency_array", arguments: '{"card":"4222","flag":"false"}' } };
  const normalized = processed("", request("Set allOf dependency array.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { card: "4222", flag: false });
});

await test("167 allOf preserves draft-07 schema dependencies", () => {
  const schema = {
    allOf: [
      {
        type: "object",
        dependencies: {
          kind: {
            properties: {
              count: { type: "integer" },
            },
          },
        },
      },
      {
        properties: {
          kind: { type: "string" },
        },
      },
    ],
  };
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { name: "allof_schema_dependency", schema } },
  };
  const { message } = processed('{kind: "metric", count: "9"}', req);
  assert.deepEqual(JSON.parse(message.content), { kind: "metric", count: 9 });

  const tool = { type: "function", function: { name: "set_allof_schema_dependency", parameters: schema } };
  const call = { function: { name: "set_allof_schema_dependency", arguments: '{"kind":"metric","count":"10"}' } };
  const normalized = processed("", request("Set allOf schema dependency.", { tools: [tool] }), [call]).message;
  assert.deepEqual(args(normalized.tool_calls[0]), { kind: "metric", count: 10 });
});

await test("168 direct json_schema anyOf objects are recognized", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        anyOf: [
          { properties: { count: { type: "integer" } } },
          { properties: { count: { type: "string" } } },
        ],
      },
    },
  };
  const { message } = processed('{count: "7"}', req);
  assert.deepEqual(JSON.parse(message.content), { count: 7 });
});

await test("169 direct json_schema oneOf objects are recognized", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        oneOf: [
          { required: ["kind"], properties: { kind: { const: "metric" }, flag: { type: "boolean" } } },
          { required: ["kind"], properties: { kind: { const: "label" }, flag: { type: "string" } } },
        ],
      },
    },
  };
  const { message } = processed('{kind: "metric", flag: "true"}', req);
  assert.deepEqual(JSON.parse(message.content), { kind: "metric", flag: true });
});

await test("170 direct json_schema allOf objects are recognized", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        allOf: [
          { properties: { count: { type: "integer" } } },
          { properties: { label: { type: "string" } } },
        ],
      },
    },
  };
  const { message } = processed('{count: "8", label: 9}', req);
  assert.deepEqual(JSON.parse(message.content), { count: 8, label: "9" });
});

await test("171 direct json_schema refs are recognized", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the object." }],
    tools: [],
    response_format: {
      type: "json_schema",
      json_schema: {
        $defs: {
          metric: {
            type: "object",
            properties: {
              count: { type: "integer" },
            },
          },
        },
        $ref: "#/$defs/metric",
      },
    },
  };
  const { message } = processed('{count: "10"}', req);
  assert.deepEqual(JSON.parse(message.content), { count: 10 });
});

await test("172 text response_format json metadata does not trigger JSON retry", async () => {
  let calls = 0;
  const upstream = await startUpstreamServer((req, res) => {
    if (req.url === "/v1/chat/completions") {
      readBody(req).then(() => {
        calls += 1;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(response(calls === 1 ? "{broken" : '{"ok":true}')));
      });
      return;
    }
    res.statusCode = 404;
    res.end("{}");
  });
  const app = buildServer({
    upstream: `http://127.0.0.1:${upstream.port}/`,
    policy: loadPolicy(null, { retry_malformed_json: true, max_retries: 2 }),
    timeoutSec: 10,
  });
  try {
    await app.listen({ host: "127.0.0.1", port: 0 });
    const address = app.server.address();
    const payload = {
      model: "gemma-test",
      messages: [{ role: "user", content: "Return plain text." }],
      tools: [],
      response_format: { type: "text", description: "metadata mentions json but does not request it" },
    };
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    assert.equal(calls, 1);
    assert.equal(json.choices[0].message.content, "{broken");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("173 direct json_schema string validation keywords are recognized", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the string." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { minLength: 3 } },
  };
  const { message, stats } = processed('"abc"', req);
  assert.equal(message.content, '"abc"');
  assert.ok(stats.repairs.includes("repaired_json_content"));
});

await test("174 direct json_schema numeric validation keywords are recognized", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the number." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { minimum: 5 } },
  };
  const { message, stats } = processed('"7"', req);
  assert.equal(message.content, "7");
  assert.ok(stats.repairs.includes("repaired_json_content"));
});

await test("175 direct json_schema array validation keywords are recognized", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the value." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { minItems: 1 } },
  };
  const { message, stats } = processed('"item"', req);
  assert.equal(message.content, '"item"');
  assert.ok(stats.repairs.includes("repaired_json_content"));
});

await test("176 direct json_schema object validation keywords are recognized", () => {
  const req = {
    model: "gemma-test",
    messages: [{ role: "user", content: "Return the value." }],
    tools: [],
    response_format: { type: "json_schema", json_schema: { required: ["count"] } },
  };
  const { message, stats } = processed('"value"', req);
  assert.equal(message.content, '"value"');
  assert.ok(stats.repairs.includes("repaired_json_content"));
});

await test("177 idn-hostname format constrains schema branches", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { host: { type: "string", format: "idn-hostname" }, count: { type: "integer" } } },
          { type: "object", properties: { host: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "idn_host", schema } } };
  const valid = processed('{payload: {host: "münich.example", count: "5"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { host: "münich.example", count: 5 } });
  const invalid = processed('{payload: {host: "bad host", count: "6"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { host: "bad host", count: "6" } });
});

await test("178 idn-email format constrains schema branches", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { contact: { type: "string", format: "idn-email" }, count: { type: "integer" } } },
          { type: "object", properties: { contact: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "idn_email", schema } } };
  const valid = processed('{payload: {contact: "team@münich.example", count: "7"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { contact: "team@münich.example", count: 7 } });
  const invalid = processed('{payload: {contact: "not email", count: "8"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { contact: "not email", count: "8" } });
});

await test("179 IRI formats constrain schema branches", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { link: { type: "string", format: "iri" }, count: { type: "integer" } } },
          { type: "object", properties: { link: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "iri_format", schema } } };
  const valid = processed('{payload: {link: "https://例え.テスト/path", count: "9"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { link: "https://例え.テスト/path", count: 9 } });
  const invalid = processed('{payload: {link: "https://exa mple.com", count: "10"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { link: "https://exa mple.com", count: "10" } });
});

await test("180 uri-template format constrains schema branches", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { template: { type: "string", format: "uri-template" }, count: { type: "integer" } } },
          { type: "object", properties: { template: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "uri_template", schema } } };
  const valid = processed('{payload: {template: "https://example.com/{id}", count: "11"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { template: "https://example.com/{id}", count: 11 } });
  const invalid = processed('{payload: {template: "https://example.com/{bad var}", count: "12"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { template: "https://example.com/{bad var}", count: "12" } });
});

await test("181 relative-json-pointer format constrains schema branches", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { pointer: { type: "string", format: "relative-json-pointer" }, count: { type: "integer" } } },
          { type: "object", properties: { pointer: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "relative_pointer", schema } } };
  const valid = processed('{payload: {pointer: "1/name", count: "13"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { pointer: "1/name", count: 13 } });
  const invalid = processed('{payload: {pointer: "01/name", count: "14"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { pointer: "01/name", count: "14" } });
});

await test("182 contentEncoding constrains schema branches", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { data: { type: "string", contentEncoding: "base64" }, count: { type: "integer" } } },
          { type: "object", properties: { data: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "content_encoding", schema } } };
  const valid = processed('{payload: {data: "eyJrIjoxfQ==", count: "15"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { data: "eyJrIjoxfQ==", count: 15 } });
  const invalid = processed('{payload: {data: "not base64!", count: "16"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { data: "not base64!", count: "16" } });
});

await test("183 contentMediaType constrains JSON content branches", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { data: { type: "string", contentMediaType: "application/json" }, count: { type: "integer" } } },
          { type: "object", properties: { data: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "content_media_type", schema } } };
  const valid = processed('{payload: {data: "{\\"k\\":1}", count: "17"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { data: "{\"k\":1}", count: 17 } });
  const invalid = processed('{payload: {data: "{bad", count: "18"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { data: "{bad", count: "18" } });
});

await test("184 contentSchema validates decoded JSON content", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          {
            type: "object",
            properties: {
              data: {
                type: "string",
                contentMediaType: "application/json",
                contentSchema: { type: "object", required: ["kind"], properties: { kind: { const: "metric" } } },
              },
              count: { type: "integer" },
            },
          },
          { type: "object", properties: { data: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "content_schema", schema } } };
  const valid = processed('{payload: {data: "{\\"kind\\":\\"metric\\"}", count: "19"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { data: "{\"kind\":\"metric\"}", count: 19 } });
  const invalid = processed('{payload: {data: "{\\"kind\\":\\"note\\"}", count: "20"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { data: "{\"kind\":\"note\"}", count: "20" } });
});

await test("185 JSON repair closes missing root array delimiters", () => {
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return array." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "root_array", schema: { type: "array", items: { type: "integer" } } } } };
  const { message } = processed('["1", "2"', req);
  assert.deepEqual(JSON.parse(message.content), [1, 2]);
});

await test("186 JSON repair inserts missing nested array delimiters before object close", () => {
  const schema = { type: "object", properties: { values: { type: "array", items: { type: "integer" } } } };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "nested_array", schema } } };
  const { message } = processed('{values: ["1", "2"}', req);
  assert.deepEqual(JSON.parse(message.content), { values: [1, 2] });
});

await test("187 jsonc fences are treated as JSON repair candidates", () => {
  const schema = { type: "object", properties: { value: { type: "integer" } } };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "jsonc_fence", schema } } };
  const { message } = processed("```jsonc\n// generated value\n{value: \"3\"}\n```", req);
  assert.deepEqual(JSON.parse(message.content), { value: 3 });
});

await test("188 tilde JSON fences are treated as JSON repair candidates", () => {
  const schema = { type: "object", properties: { value: { type: "integer" } } };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "tilde_json", schema } } };
  const { message } = processed("~~~json\n{\"value\":\"4\"}\n~~~", req);
  assert.deepEqual(JSON.parse(message.content), { value: 4 });
});

await test("189 tilde Python fences can be extracted when parseable", () => {
  const content = "~~~python\ndef add(a, b):\n    return a + b\n~~~\nDone.";
  const { message, stats } = processed(content, request("Write Python.", { tools: [] }));
  assert.equal(message.content, "def add(a, b):\n    return a + b");
  assert.ok(stats.repairs.includes("extracted_python_code"));
});

await test("190 tilde TypeScript fences can be extracted when parseable", () => {
  const content = "~~~ts\nexport const double = (n: number): number => n * 2;\n~~~";
  const { message, stats } = processed(content, request("Write TypeScript.", { tools: [] }));
  assert.equal(message.content, "export const double = (n: number): number => n * 2;");
  assert.ok(stats.repairs.includes("extracted_typescript_code"));
});

await test("191 local JSON Schema anchor refs are resolved", () => {
  const schema = {
    type: "object",
    $defs: { metric: { $anchor: "metricValue", type: "integer" } },
    properties: { count: { $ref: "#metricValue" } },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "anchor_ref", schema } } };
  const { message } = processed('{count: "7"}', req);
  assert.deepEqual(JSON.parse(message.content), { count: 7 });
});

await test("192 local JSON Schema id fragment refs are resolved", () => {
  const schema = {
    type: "object",
    $defs: { metric: { $id: "#metricCount", type: "integer" } },
    properties: { count: { $ref: "#metricCount" } },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "id_ref", schema } } };
  const { message } = processed('{count: "8"}', req);
  assert.deepEqual(JSON.parse(message.content), { count: 8 });
});

await test("193 date-time format rejects impossible calendar dates", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { ts: { type: "string", format: "date-time" }, count: { type: "integer" } } },
          { type: "object", properties: { ts: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "datetime_guard", schema } } };
  const valid = processed('{payload: {ts: "2024-02-29T10:00:00Z", count: "9"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { ts: "2024-02-29T10:00:00Z", count: 9 } });
  const invalid = processed('{payload: {ts: "2024-02-31T10:00:00Z", count: "10"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { ts: "2024-02-31T10:00:00Z", count: "10" } });
});

await test("194 time format rejects invalid timezone offsets", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { time: { type: "string", format: "time" }, count: { type: "integer" } } },
          { type: "object", properties: { time: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "time_guard", schema } } };
  const valid = processed('{payload: {time: "12:30:00+02:30", count: "11"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { time: "12:30:00+02:30", count: 11 } });
  const invalid = processed('{payload: {time: "12:30:00+24:00", count: "12"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { time: "12:30:00+24:00", count: "12" } });
});

await test("195 email format rejects invalid hostnames", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { email: { type: "string", format: "email" }, count: { type: "integer" } } },
          { type: "object", properties: { email: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "email_guard", schema } } };
  const valid = processed('{payload: {email: "agent@example.com", count: "13"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { email: "agent@example.com", count: 13 } });
  const invalid = processed('{payload: {email: "agent@bad_domain.com", count: "14"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { email: "agent@bad_domain.com", count: "14" } });
});

await test("196 uri-reference format rejects whitespace", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { href: { type: "string", format: "uri-reference" }, count: { type: "integer" } } },
          { type: "object", properties: { href: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "uri_ref_guard", schema } } };
  const valid = processed('{payload: {href: "/docs/page", count: "15"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { href: "/docs/page", count: 15 } });
  const invalid = processed('{payload: {href: "bad path", count: "16"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { href: "bad path", count: "16" } });
});

await test("197 base64 format rejects impossible padding", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { data: { type: "string", format: "byte" }, count: { type: "integer" } } },
          { type: "object", properties: { data: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "base64_guard", schema } } };
  const valid = processed('{payload: {data: "YQ==", count: "17"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { data: "YQ==", count: 17 } });
  const invalid = processed('{payload: {data: "====", count: "18"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { data: "====", count: "18" } });
});

await test("198 contentEncoding base64url constrains branches", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { data: { type: "string", contentEncoding: "base64url" }, count: { type: "integer" } } },
          { type: "object", properties: { data: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "base64url_guard", schema } } };
  const valid = processed('{payload: {data: "eyJrIjoxfQ", count: "19"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { data: "eyJrIjoxfQ", count: 19 } });
  const invalid = processed('{payload: {data: "not-url?", count: "20"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { data: "not-url?", count: "20" } });
});

await test("199 duration format keeps week durations exclusive", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { duration: { type: "string", format: "duration" }, count: { type: "integer" } } },
          { type: "object", properties: { duration: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "duration_guard", schema } } };
  const valid = processed('{payload: {duration: "P2W", count: "21"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { duration: "P2W", count: 21 } });
  const invalid = processed('{payload: {duration: "P1Y2W", count: "22"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { duration: "P1Y2W", count: "22" } });
});

await test("200 JSON tool_uses containers are parsed with exact tool names", () => {
  const { message } = processed('{"tool_uses":[{"tool_name":"get_weather","input":{"location":"Oslo"}}]}', request("Call the declared weather tool."));
  assert.equal(message.tool_calls.length, 1);
  assert.equal(message.tool_calls[0].function.name, "get_weather");
  assert.equal(args(message.tool_calls[0]).location, "Oslo");
});

await test("201 JSON tool_use single containers are parsed with exact tool names", () => {
  const { message } = processed('{"tool_use":{"tool_name":"calculator","input":{"expression":"2+2"}}}', request("Call the declared calculator tool."));
  assert.equal(message.tool_calls.length, 1);
  assert.equal(message.tool_calls[0].function.name, "calculator");
  assert.equal(args(message.tool_calls[0]).expression, "2+2");
});

await test("202 Responses tool_choice function objects and request controls pass through", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    readBody(req).then((payload) => {
      assert.deepEqual(payload.tool_choice, { type: "function", function: { name: "web_search" } });
      assert.equal(payload.store, false);
      assert.equal(payload.truncation, "auto");
      assert.deepEqual(payload.include, ["message.output_text.logprobs"]);
      assert.equal(payload.background, false);
      assert.equal(payload.safety_identifier, "user-safe-id");
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(response("ok")));
    }).catch((error) => {
      res.statusCode = 500;
      res.end(String(error.stack ?? error));
    });
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemma-test",
        input: "Search.",
        tools: [{ type: "function", name: "web_search", input_schema: { type: "object", properties: { query: { type: "string" } } } }],
        tool_choice: { type: "function", function: { name: "web_search" } },
        store: false,
        truncation: "auto",
        include: ["message.output_text.logprobs"],
        background: false,
        safety_identifier: "user-safe-id",
      }),
    });
    assert.equal(res.status, 200);
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("203 JSON repair accepts trailing semicolon after structured output", () => {
  const schema = { type: "object", properties: { value: { type: "integer" } } };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "trailing_semicolon", schema } } };
  const { message } = processed('{"value":"23"};', req);
  assert.deepEqual(JSON.parse(message.content), { value: 23 });
});

await test("204 UUID format accepts modern v7 UUIDs", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { id: { type: "string", format: "uuid" }, count: { type: "integer" } } },
          { type: "object", properties: { id: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "uuid_v7", schema } } };
  const { message } = processed('{payload: {id: "01890f2f-8b6b-7cc2-a7b0-9f9c6e7c9f01", count: "24"}}', req);
  assert.deepEqual(JSON.parse(message.content), { payload: { id: "01890f2f-8b6b-7cc2-a7b0-9f9c6e7c9f01", count: 24 } });
});

await test("205 date-time format accepts lowercase t and z", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { ts: { type: "string", format: "date-time" }, count: { type: "integer" } } },
          { type: "object", properties: { ts: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "datetime_lowercase", schema } } };
  const { message } = processed('{payload: {ts: "2024-02-29t10:00:00z", count: "25"}}', req);
  assert.deepEqual(JSON.parse(message.content), { payload: { ts: "2024-02-29t10:00:00z", count: 25 } });
});

await test("206 Responses maps content_filter finish_reason to incomplete", async () => {
  const upstream = await startUpstreamServer((_req, res) => {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ choices: [{ finish_reason: "content_filter", message: { role: "assistant", content: "blocked" } }] }));
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", input: "Hello" }),
    });
    const body = await res.json();
    assert.equal(body.status, "incomplete");
    assert.deepEqual(body.incomplete_details, { reason: "content_filter" });
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("207 JSON tool calls preserve call_id", () => {
  const { message } = processed('{"tool_calls":[{"call_id":"call_fixed","name":"calculator","arguments":{"expression":"6*7"}}]}', request("Call calculator."));
  assert.equal(message.tool_calls[0].id, "call_fixed");
  assert.equal(args(message.tool_calls[0]).expression, "6*7");
});

await test("208 JSON tool calls accept tool_input arguments", () => {
  const { message } = processed('{"name":"calculator","tool_input":{"expression":"7*8"}}', request("Call calculator."));
  assert.equal(args(message.tool_calls[0]).expression, "7*8");
});

await test("209 JSON tool calls accept input_json arguments", () => {
  const { message } = processed('{"name":"calculator","input_json":"{\\"expression\\":\\"8*9\\"}"}', request("Call calculator."));
  assert.equal(args(message.tool_calls[0]).expression, "8*9");
});

await test("210 JSON tool calls accept arguments_json arguments", () => {
  const { message } = processed('{"name":"calculator","arguments_json":{"expression":"9*10"}}', request("Call calculator."));
  assert.equal(args(message.tool_calls[0]).expression, "9*10");
});

await test("211 Responses computer_call_output serializes object output as user context", async () => {
  const payload = await captureResponsesChatPayload({
    model: "gemma-test",
    input: [{ type: "computer_call_output", call_id: "cu_1", output: { screenshot: "frame-1", status: "ok" } }],
  });
  assert.deepEqual(payload.messages, [{ role: "user", content: "{\"screenshot\":\"frame-1\",\"status\":\"ok\"}" }]);
});

await test("212 Responses computer_call serializes action as assistant context", async () => {
  const payload = await captureResponsesChatPayload({
    model: "gemma-test",
    input: [{ type: "computer_call", call_id: "cu_2", action: { type: "click", x: 10, y: 20 } }],
  });
  assert.deepEqual(payload.messages, [{ role: "assistant", content: "{\"type\":\"click\",\"x\":10,\"y\":20}" }]);
});

await test("213 Responses generic call outputs serialize result context", async () => {
  const payload = await captureResponsesChatPayload({
    model: "gemma-test",
    input: [{ type: "web_search_call_output", call_id: "ws_1", result: { title: "Result", url: "https://example.com" } }],
  });
  assert.deepEqual(payload.messages, [{ role: "user", content: "{\"title\":\"Result\",\"url\":\"https://example.com\"}" }]);
});

await test("214 Responses audio content parts preserve references", async () => {
  const payload = await captureResponsesChatPayload({
    model: "gemma-test",
    input: [{ role: "user", content: [{ type: "input_audio", file_id: "aud_123" }] }],
  });
  assert.deepEqual(payload.messages, [{ role: "user", content: "[audio: aud_123]" }]);
});

await test("215 Responses video content parts preserve references", async () => {
  const payload = await captureResponsesChatPayload({
    model: "gemma-test",
    input: [{ role: "user", content: [{ type: "input_video", url: "https://example.com/clip.mp4" }] }],
  });
  assert.deepEqual(payload.messages, [{ role: "user", content: "[video: https://example.com/clip.mp4]" }]);
});

await test("216 Responses file_data content parts preserve references", async () => {
  const payload = await captureResponsesChatPayload({
    model: "gemma-test",
    input: [{ role: "user", content: [{ type: "input_file", filename: "report.pdf", file_data: "data:application/pdf;base64,AAAA" }] }],
  });
  assert.deepEqual(payload.messages, [{ role: "user", content: "[file: report.pdf (data:application/pdf;base64,AAAA)]" }]);
});

await test("217 Responses file_url content parts preserve references", async () => {
  const payload = await captureResponsesChatPayload({
    model: "gemma-test",
    input: [{ role: "user", content: [{ type: "input_file", filename: "report.pdf", file_url: "https://example.com/report.pdf" }] }],
  });
  assert.deepEqual(payload.messages, [{ role: "user", content: "[file: report.pdf (https://example.com/report.pdf)]" }]);
});

await test("218 direct chat tool_choice function objects map upstream", () => {
  const req = { ...request("Use calculator."), tool_choice: { type: "function", function: { name: "calculator" } } };
  const out = prepareUpstreamPayload(req, loadPolicy());
  assert.deepEqual(out.tool_choice, { type: "function", function: { name: "calculator" } });
});

await test("219 function syntax accepts colon argument separators", () => {
  const { message } = processed('get_weather(location: "Paris", units: "celsius")', request("Call weather."));
  assert.equal(args(message.tool_calls[0]).location, "Paris");
  assert.equal(args(message.tool_calls[0]).units, "celsius");
});

await test("220 function syntax preserves commas inside quoted arguments", () => {
  const { message } = processed('get_weather(location="Paris, France", units="celsius")', request("Call weather."));
  assert.equal(args(message.tool_calls[0]).location, "Paris, France");
});

await test("221 function syntax parses array argument values", () => {
  const tools = [{ type: "function", function: { name: "save_items", parameters: { type: "object", properties: { items: { type: "array", items: { type: "string" } } } } } }];
  const { message } = processed('save_items(items=["alpha","beta"])', request("Call save_items.", { tools }));
  assert.deepEqual(args(message.tool_calls[0]).items, ["alpha", "beta"]);
});

await test("222 function syntax parses nested object argument values", () => {
  const tools = [{
    type: "function",
    function: {
      name: "save_items",
      parameters: {
        type: "object",
        properties: {
          options: { type: "object", properties: { limit: { type: "integer" } } },
        },
      },
    },
  }];
  const { message } = processed('save_items(options={limit: "2"})', request("Call save_items.", { tools }));
  assert.deepEqual(args(message.tool_calls[0]).options, { limit: 2 });
});

await test("223 percent-encoded local JSON Pointer refs are resolved", () => {
  const schema = {
    type: "object",
    $defs: { count: { type: "integer" } },
    properties: { count: { $ref: "#/%24defs/count" } },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "encoded_pointer", schema } } };
  const { message } = processed('{count: "26"}', req);
  assert.deepEqual(JSON.parse(message.content), { count: 26 });
});

await test("224 uri format rejects whitespace", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { href: { type: "string", format: "uri" }, count: { type: "integer" } } },
          { type: "object", properties: { href: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "uri_guard", schema } } };
  const invalid = processed('{payload: {href: "https://example.com/a b", count: "27"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { href: "https://example.com/a b", count: "27" } });
});

await test("225 time format accepts lowercase z timezone", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { time: { type: "string", format: "time" }, count: { type: "integer" } } },
          { type: "object", properties: { time: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "time_lower_z", schema } } };
  const { message } = processed('{payload: {time: "12:30:00z", count: "28"}}', req);
  assert.deepEqual(JSON.parse(message.content), { payload: { time: "12:30:00z", count: 28 } });
});

await test("226 idn-email format rejects invalid local dot placement", () => {
  const schema = {
    type: "object",
    properties: {
      payload: {
        anyOf: [
          { type: "object", properties: { email: { type: "string", format: "idn-email" }, count: { type: "integer" } } },
          { type: "object", properties: { email: { type: "string" }, count: { type: "string" } } },
        ],
      },
    },
  };
  const req = { model: "gemma-test", messages: [{ role: "user", content: "Return object." }], tools: [], response_format: { type: "json_schema", json_schema: { name: "idn_email_guard", schema } } };
  const valid = processed('{payload: {email: "user@例え.テスト", count: "29"}}', req).message;
  assert.deepEqual(JSON.parse(valid.content), { payload: { email: "user@例え.テスト", count: 29 } });
  const invalid = processed('{payload: {email: ".user@例え.テスト", count: "30"}}', req).message;
  assert.deepEqual(JSON.parse(invalid.content), { payload: { email: ".user@例え.テスト", count: "30" } });
});

await test("227 image source content parts preserve base64 references", async () => {
  const payload = await captureResponsesChatPayload({
    model: "gemma-test",
    input: [{ role: "user", content: [{ type: "input_image", source: { type: "base64", media_type: "image/png", data: "AAAA" } }] }],
  });
  assert.deepEqual(payload.messages, [{ role: "user", content: "[image: image/png;base64,AAAA]" }]);
});

await test("228 output_image URL content parts preserve references", async () => {
  const payload = await captureResponsesChatPayload({
    model: "gemma-test",
    input: [{ role: "user", content: [{ type: "output_image", url: "https://example.com/out.png" }] }],
  });
  assert.deepEqual(payload.messages, [{ role: "user", content: "[image: https://example.com/out.png]" }]);
});

await test("229 explicit JSON response_format retries non-JSON prose", async () => {
  let calls = 0;
  const upstream = await startUpstreamServer((_req, res) => {
    calls += 1;
    res.setHeader("content-type", "application/json");
    const content = calls === 1 ? "I cannot provide JSON." : '{"ok":true}';
    res.end(JSON.stringify(response(content)));
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(null, { retry_malformed_json: true, max_retries: 1 }), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...request("Return JSON.", { tools: [] }), response_format: { type: "json_schema", json_schema: { name: "ok", schema: { type: "object", properties: { ok: { type: "boolean" } } } } } }),
    });
    const body = await res.json();
    assert.equal(calls, 2);
    assert.deepEqual(JSON.parse(body.choices[0].message.content), { ok: true });
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("230 jsonc fences repair without response_format metadata", () => {
  const { message } = processed("```jsonc\n// note\n{value: \"31\"}\n```", request("Return JSON.", { tools: [] }));
  assert.deepEqual(JSON.parse(message.content), { value: "31" });
});

await test("231 tilde JSON fences repair without response_format metadata", () => {
  const { message } = processed("~~~json\n{\"value\":\"32\"}\n~~~", request("Return JSON.", { tools: [] }));
  assert.deepEqual(JSON.parse(message.content), { value: "32" });
});

await test("232 json5 fences repair bare keys and trailing commas", () => {
  const { message } = processed("```json5\n{value: \"33\",}\n```", request("Return JSON.", { tools: [] }));
  assert.deepEqual(JSON.parse(message.content), { value: "33" });
});

await test("233 legacy completions maps max_completion_tokens to chat max_tokens", async () => {
  const payload = await captureCompletionsChatPayload({ model: "gemma-test", prompt: "Hello", max_completion_tokens: 34 });
  assert.equal(payload.max_tokens, 34);
});

await test("234 legacy completions maps max_output_tokens to chat max_tokens", async () => {
  const payload = await captureCompletionsChatPayload({ model: "gemma-test", prompt: "Hello", max_output_tokens: 35 });
  assert.equal(payload.max_tokens, 35);
});

await test("235 singular tool_call containers are parsed", () => {
  const { message } = processed('{"tool_call":{"name":"calculator","arguments":{"expression":"10*10"}}}', request("Call calculator."));
  assert.equal(args(message.tool_calls[0]).expression, "10*10");
});

await test("236 object-valued tool_calls containers are parsed", () => {
  const { message } = processed('{"tool_calls":{"name":"calculator","arguments":{"expression":"11*11"}}}', request("Call calculator."));
  assert.equal(args(message.tool_calls[0]).expression, "11*11");
});

await test("237 object-valued function_calls containers are parsed", () => {
  const { message } = processed('{"function_calls":{"name":"calculator","arguments":{"expression":"12*12"}}}', request("Call calculator."));
  assert.equal(args(message.tool_calls[0]).expression, "12*12");
});

await test("238 Responses streaming converts chat text deltas to Responses SSE", async () => {
  const upstream = await startUpstreamServer((req, res) => {
    readBody(req).then((payload) => {
      assert.equal(payload.stream, true);
      res.setHeader("content-type", "text/event-stream");
      res.end([
        'data: {"model":"gemma-test","choices":[{"delta":{"content":"Hel"}}]}',
        "",
        'data: {"choices":[{"delta":{"content":"lo"},"finish_reason":"stop"}]}',
        "",
        "data: [DONE]",
        "",
      ].join("\n"));
    }).catch((error) => {
      res.statusCode = 500;
      res.end(String(error.stack ?? error));
    });
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", input: "Say hello.", stream: true }),
    });
    assert.match(res.headers.get("content-type"), /text\/event-stream/);
    const text = await res.text();
    assert.match(text, /event: response\.output_text\.delta/);
    assert.match(text, /"delta":"Hel"/);
    assert.match(text, /"output_text":"Hello"/);
    assert.match(text, /event: response\.completed/);
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("239 Responses streaming maps length finish to incomplete", async () => {
  const upstream = await startUpstreamServer((_req, res) => {
    res.setHeader("content-type", "text/event-stream");
    res.end('data: {"choices":[{"delta":{"content":"Too long"},"finish_reason":"length"}]}\n\ndata: [DONE]\n\n');
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", input: "Say hello.", stream: true }),
    });
    const text = await res.text();
    assert.match(text, /event: response\.incomplete/);
    assert.match(text, /"incomplete_details":\{"reason":"max_output_tokens"\}/);
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("240 Responses text and reasoning controls pass through", async () => {
  const payload = await captureResponsesChatPayload({
    model: "gemma-test",
    input: "Hello",
    text: { verbosity: "low" },
    reasoning: { effort: "medium", summary: "auto", generate_summary: "concise" },
    top_k: 32,
  }, loadPolicy(null, { enforce_sampler: false }));
  assert.equal(payload.verbosity, "low");
  assert.equal(payload.reasoning_effort, "medium");
  assert.equal(payload.reasoning_summary, "auto");
  assert.equal(payload.reasoning_generate_summary, "concise");
  assert.equal(payload.top_k, 32);
});

await test("241 camelCase toolCalls containers are parsed", () => {
  const { message } = processed('{"toolCalls":{"name":"calculator","arguments":{"expression":"13*13"}}}', request("Call calculator."));
  assert.equal(args(message.tool_calls[0]).expression, "13*13");
});

await test("242 camelCase functionCalls containers are parsed", () => {
  const { message } = processed('{"functionCalls":{"name":"calculator","arguments":{"expression":"14*14"}}}', request("Call calculator."));
  assert.equal(args(message.tool_calls[0]).expression, "14*14");
});

await test("243 recipient_name tool call aliases require exact tool names", () => {
  const { message } = processed('{"recipient_name":"calculator","arguments":{"expression":"15*15"}}', request("Call calculator."));
  assert.equal(message.tool_calls[0].function.name, "calculator");
  assert.equal(args(message.tool_calls[0]).expression, "15*15");
});

await test("244 payload tool arguments are parsed", () => {
  const { message } = processed('{"name":"calculator","payload":{"expression":"16*16"}}', request("Call calculator."));
  assert.equal(args(message.tool_calls[0]).expression, "16*16");
});

await test("245 Responses streaming emits output_text done events", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"content":"Done"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n');
  assert.match(text, /event: response\.output_text\.done/);
  assert.match(text, /"text":"Done"/);
});

await test("246 Responses streaming parses multi-line SSE data fields", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[\ndata: {"delta":{"content":"A"},"finish_reason":"stop"}\ndata: ]}\n\ndata: [DONE]\n\n');
  assert.match(text, /"output_text":"A"/);
});

await test("247 Responses streaming maps final usage chunks", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"content":"A"}}]}\n\ndata: {"choices":[],"usage":{"prompt_tokens":2,"completion_tokens":3,"total_tokens":5}}\n\ndata: [DONE]\n\n');
  const done = lastSseResponse(text);
  assert.deepEqual(done.usage, { input_tokens: 2, output_tokens: 3, total_tokens: 5 });
});

await test("248 Responses streaming preserves system fingerprints", async () => {
  const text = await captureResponsesStreamText('data: {"system_fingerprint":"fp_test","choices":[{"delta":{"content":"A"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n');
  assert.equal(lastSseResponse(text).system_fingerprint, "fp_test");
});

await test("249 Responses streaming preserves previous_response_id metadata", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"content":"A"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n', { previous_response_id: "resp_prev" });
  assert.equal(lastSseResponse(text).previous_response_id, "resp_prev");
});

await test("250 Responses streaming preserves parallel_tool_calls metadata", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"content":"A"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n', { parallel_tool_calls: false });
  assert.equal(lastSseResponse(text).parallel_tool_calls, false);
});

await test("251 Responses streaming preserves truncation metadata", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"content":"A"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n', { truncation: "auto" });
  assert.equal(lastSseResponse(text).truncation, "auto");
});

await test("252 Responses streaming preserves max_output_tokens metadata", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"content":"A"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n', { max_output_tokens: 12 });
  assert.equal(lastSseResponse(text).max_output_tokens, 12);
});

await test("253 Responses streaming preserves store metadata", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"content":"A"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n', { store: false });
  assert.equal(lastSseResponse(text).store, false);
});

await test("254 Responses streaming preserves tool_choice metadata", async () => {
  const toolChoice = { type: "function", name: "calculator" };
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"content":"A"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n', { tool_choice: toolChoice });
  assert.deepEqual(lastSseResponse(text).tool_choice, toolChoice);
});

await test("255 non-streaming Responses preserves service_tier metadata", async () => {
  const upstream = await startUpstreamServer((_req, res) => {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ service_tier: "default", choices: [{ message: { role: "assistant", content: "ok" } }] }));
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", input: "Hello" }),
    });
    assert.equal((await res.json()).service_tier, "default");
  } finally {
    await app.close();
    await upstream.close();
  }
});

await test("256 Responses streaming aggregates simple tool-call deltas", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_a","function":{"name":"calculator","arguments":"{\\"expression\\":\\"2+2\\"}"}}]},"finish_reason":"tool_calls"}]}\n\ndata: [DONE]\n\n');
  const call = lastSseResponse(text).output.find((item) => item.type === "function_call");
  assert.deepEqual({ id: call.call_id, name: call.name, arguments: call.arguments }, { id: "call_a", name: "calculator", arguments: "{\"expression\":\"2+2\"}" });
});

await test("257 Responses streaming joins tool-call argument chunks", async () => {
  const text = await captureResponsesStreamText([
    'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_b","function":{"name":"calculator","arguments":"{\\"expression\\":"}}]}}]}',
    "",
    'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"\\"3+3\\"}"}}]},"finish_reason":"tool_calls"}]}',
    "",
    "data: [DONE]",
    "",
  ].join("\n"));
  const call = lastSseResponse(text).output.find((item) => item.type === "function_call");
  assert.equal(call.arguments, "{\"expression\":\"3+3\"}");
});

await test("258 Responses streaming preserves multiple tool-call indexes", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_c","function":{"name":"calculator","arguments":"{}"}},{"index":1,"id":"call_d","function":{"name":"web_search","arguments":"{}"}}]},"finish_reason":"tool_calls"}]}\n\ndata: [DONE]\n\n');
  const calls = lastSseResponse(text).output.filter((item) => item.type === "function_call");
  assert.deepEqual(calls.map((call) => call.name), ["calculator", "web_search"]);
});

await test("259 Responses streaming emits output_item added events for tool calls", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_e","function":{"name":"calculator","arguments":"{}"}}]},"finish_reason":"tool_calls"}]}\n\ndata: [DONE]\n\n');
  assert.match(text, /event: response\.output_item\.added/);
});

await test("260 Responses streaming emits refusal delta and done events", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"refusal":"No"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n');
  assert.match(text, /event: response\.refusal\.delta/);
  assert.match(text, /event: response\.refusal\.done/);
  assert.equal(lastSseResponse(text).output[0].content[0].refusal, "No");
});

await test("261 Responses streaming maps content_filter finish to incomplete", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"refusal":"Blocked"},"finish_reason":"content_filter"}]}\n\ndata: [DONE]\n\n');
  assert.equal(lastSseResponse(text).status, "incomplete");
  assert.deepEqual(lastSseResponse(text).incomplete_details, { reason: "content_filter" });
});

await test("262 Responses streaming response.done carries final response", async () => {
  const text = await captureResponsesStreamText('data: {"choices":[{"delta":{"content":"Final"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n');
  const done = sseEvents(text).find((event) => event.event === "response.done");
  assert.equal(done.data.response.output_text, "Final");
});

await test("263 non-streaming Responses preserves request metadata", async () => {
  const upstream = await startUpstreamServer((_req, res) => {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ system_fingerprint: "fp_meta", choices: [{ message: { role: "assistant", content: "ok" } }] }));
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", input: "Hello", previous_response_id: "resp_old", parallel_tool_calls: false, truncation: "auto", max_output_tokens: 9, store: false }),
    });
    const body = await res.json();
    assert.equal(body.previous_response_id, "resp_old");
    assert.equal(body.parallel_tool_calls, false);
    assert.equal(body.truncation, "auto");
    assert.equal(body.max_output_tokens, 9);
    assert.equal(body.store, false);
    assert.equal(body.system_fingerprint, "fp_meta");
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

async function captureResponsesChatPayload(body, policy = loadPolicy()) {
  let captured = null;
  const upstream = await startUpstreamServer((req, res) => {
    readBody(req).then((payload) => {
      captured = payload;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(response("ok")));
    }).catch((error) => {
      res.statusCode = 500;
      res.end(String(error.stack ?? error));
    });
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy, timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    assert.equal(res.status, 200);
    await res.arrayBuffer();
    return captured;
  } finally {
    await app.close();
    await upstream.close();
  }
}

async function captureCompletionsChatPayload(body) {
  let captured = null;
  const upstream = await startUpstreamServer((req, res) => {
    readBody(req).then((payload) => {
      captured = payload;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(response("ok")));
    }).catch((error) => {
      res.statusCode = 500;
      res.end(String(error.stack ?? error));
    });
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    assert.equal(res.status, 200);
    await res.arrayBuffer();
    return captured;
  } finally {
    await app.close();
    await upstream.close();
  }
}

async function captureResponsesStreamText(upstreamBody, requestOverrides = {}) {
  const upstream = await startUpstreamServer((_req, res) => {
    res.setHeader("content-type", "text/event-stream");
    res.end(upstreamBody);
  });
  const app = buildServer({ upstream: `http://127.0.0.1:${upstream.port}/`, policy: loadPolicy(), timeoutSec: 10 });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${address.port}/v1/responses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gemma-test", input: "Hello", stream: true, ...requestOverrides }),
    });
    assert.equal(res.status, 200);
    return await res.text();
  } finally {
    await app.close();
    await upstream.close();
  }
}

function sseEvents(text) {
  const events = [];
  let event = "message";
  let data = [];
  const flush = () => {
    if (!data.length) return;
    events.push({ event, data: JSON.parse(data.join("\n")) });
    event = "message";
    data = [];
  };
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) {
      flush();
      continue;
    }
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
  }
  flush();
  return events;
}

function lastSseResponse(text) {
  return sseEvents(text).at(-1).data.response;
}
