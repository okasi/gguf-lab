#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  loadPolicy,
  prepareUpstreamPayload,
  processChatCompletion,
  runChatCompletionHarness,
} from "./processor.mjs";

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
];

function request(user, { tools = TOOLS, system = "You are helpful." } = {}) {
  return {
    model: "qwopus3.6-35b-a3b-v1",
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    tools: structuredClone(tools),
    temperature: 0,
  };
}

function response(content, toolCalls = []) {
  return { choices: [{ message: { role: "assistant", content, tool_calls: toolCalls } }] };
}

function processed(content, req, toolCalls = [], policy = loadPolicy()) {
  const result = processChatCompletion(response(content, toolCalls), req, policy);
  return { message: result.body.choices[0].message, stats: result.stats };
}

async function test(name, fn) {
  await fn();
  console.log(`PASS ${name}`);
}

await test("01 qwopus sampler override", () => {
  const req = request("hello");
  const out = prepareUpstreamPayload(req, loadPolicy());
  assert.equal(out.temperature, 0.85);
  assert.equal(out.top_p, 0.95);
  assert.equal(out.top_k, 20);
});

await test("02 qwen tool_call tag", () => {
  const { message } = processed('<tool_call>{"name":"get_weather","arguments":{"location":"Berlin"}}</tool_call>', request("Weather in Berlin?"));
  assert.equal(message.tool_calls[0].function.name, "get_weather");
});

await test("02b schema-bound tool argument coercion only", () => {
  const tools = [{
    type: "function",
    function: {
      name: "set_timer",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: { minutes: { type: "integer" } },
        required: ["minutes"],
      },
    },
  }];
  const { message } = processed('<tool_call>{"name":"set_timer","arguments":{"minutes":"15 minutes"}}</tool_call>', request("Set a timer.", { tools }));
  const args = JSON.parse(message.tool_calls[0].function.arguments);
  assert.equal(args.minutes, 15);
});

await test("03 strip qwen think blocks", () => {
  const content = "<think>private</think>\nFinal answer.";
  const { message } = processed(content, request("Say final.", { tools: [] }));
  assert.equal(message.content, "Final answer.");
});

await test("03b strip orphan qwen think close", () => {
  const content = "private reasoning that llama.cpp already started parsing</think>\nFinal answer.";
  const { message } = processed(content, request("Say final.", { tools: [] }));
  assert.equal(message.content, "Final answer.");
});

await test("04 strip im_end token", () => {
  const imEnd = "<|im_end|>";
  const { message } = processed(`Done answer${imEnd}`, request("Say done.", { tools: [] }));
  assert.equal(message.content, "Done answer");
});

await test("05 no direct answer injection", () => {
  const call = { function: { name: "calculator", arguments: '{"expression":"200 * 0.15"}' } };
  const { message } = processed("", request("What is 15% of 200?"), [call]);
  assert.equal(message.tool_calls[0].function.name, "calculator");
  assert.equal(message.content, "");
});

await test("06 no extraction value coercion by default", () => {
  const { message } = processed('{"price":"$1,299","battery_life_hours":"10 hours"}', request("Extract. Fields: price, battery_life_hours", { tools: [], system: "Output valid JSON." }));
  const data = JSON.parse(message.content);
  assert.equal(data.price, "$1,299");
  assert.equal(data.battery_life_hours, "10 hours");
});

await test("07 no answer key injection for coding", () => {
  const req = request("Write Python fib(n) with memoization.", { tools: [] });
  const result = processChatCompletion(response("def fib(n):\n    return"), req, loadPolicy());
  assert.equal(result.stats.repairs.includes("synthesized_benchloop_coding_solution"), false);
});

await test("08 removed instruction normalizer stays inert", () => {
  const req = request("Using only these six words - zebra, mango, lemon, apricot, tulip, cedar - list all six in reverse alphabetical order. Present each as a bullet point.", {
    tools: [],
    system: "Follow the user's instructions precisely.",
  });
  const original = "* tulip\n* mango\n* lemon\n* cedar\n* apricot\n* zebra";
  const { message } = processed(original, req);
  assert.equal(message.content, original);
});

await test("09 removed reasonmath canonicalizer stays inert", () => {
  const req = request("Faucet A fills a tub in 12 minutes. Faucet B fills it in 18 minutes. The drain empties it in 36 minutes but is closed. Return the final line exactly as ANSWER: fill_time=<minutes> minutes.", {
    tools: [],
    system: "Return the final line exactly.",
  });
  const { message } = processed("ANSWER: fill_time=9 minutes", req, [], loadPolicy(null, {
    repair_only_when_needed: false,
  }));
  assert.equal(message.content, "ANSWER: fill_time=9 minutes");
});

await test("10 no python class alias repair", () => {
  const req = request("Write a Python class `LRUCache` with get and put.", { tools: [], system: "You are a coding assistant." });
  const code = "class LRU_Cache:\n    pass";
  const { message } = processed(code, req, [], loadPolicy(null, { repair_only_when_needed: false }));
  assert.equal(message.content, code);
});

await test("11 no implicit contact lookup synthesis", () => {
  const tools = TOOLS.concat([{
    type: "function",
    function: {
      name: "get_contacts",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  }]);
  const req = request("I need to let Sarah know the meeting moved to 3pm.", { tools });
  const { message } = processed("I need Sarah's contact information first.", req, [], loadPolicy(null, {
    repair_only_when_needed: false,
  }));
  assert.deepEqual(message.tool_calls, []);
  assert.equal(message.content, "I need Sarah's contact information first.");
});

await test("12 removed extraction normalizer stays inert", () => {
  const req = request("Extract product fields. Fields: product_name, product_type, colors, restaurant_name, cuisine_type, location", {
    tools: [],
    system: "Output valid JSON.",
  });
  const content = JSON.stringify({
    product_name: "XR-7500 Pro noise-cancelling headphones",
    product_type: "Japanese label / Wireless Earbuds",
    colors: ["Midnight Black"],
    restaurant_name: "Kumo Sushi",
    cuisine_type: null,
    location: "Chicago to the LA office",
  });
  const { message } = processed(content, req, [], loadPolicy(null, {
    repair_only_when_needed: false,
  }));
  const data = JSON.parse(message.content);
  assert.equal(data.product_name, "XR-7500 Pro noise-cancelling headphones");
  assert.equal(data.product_type, "Japanese label / Wireless Earbuds");
  assert.equal(data.cuisine_type, null);
  assert.equal(data.location, "Chicago to the LA office");
});

await test("13 removed final numeric normalizer stays inert", () => {
  const req = {
    model: "qwopus3.6-35b-a3b-v1",
    messages: [
      { role: "system", content: "You are helpful." },
      { role: "user", content: "What is the final portfolio value?" },
      { role: "tool", content: "{\"cash\":100,\"portfolio_value\":3948}" },
    ],
    tools: [],
  };
  const { message } = processed("The total is about $3.9k.", req);
  assert.equal(message.content, "The total is about $3.9k.");
});

await test("14 active policies disable value coercion", () => {
  for (const policyPath of [
    "configs/qwopus35_optimized_policy.json",
    "configs/qwopus27_coder_q4_optimized_policy.json",
  ]) {
    const policy = loadPolicy(policyPath);
    assert.equal(policy.coerce_numeric_json_values, undefined, policyPath);
    assert.equal(policy.coerce_scalar_json_values, undefined, policyPath);
    assert.equal(policy.normalize_instruction_constraints, undefined, policyPath);
    assert.equal(policy.normalize_extraction_values, undefined, policyPath);
    assert.equal(policy.canonicalize_reasonmath_answer_line, undefined, policyPath);
    assert.equal(policy.normalize_final_numeric_answers, undefined, policyPath);
  }
});

await test("15 truncated reasoning retry only raises token budget", async () => {
  const req = request("Give a short answer.", { tools: [] });
  req.max_tokens = 8;
  const seen = [];
  const policy = loadPolicy(null, {
    retry_truncated_reasoning: true,
    retry_empty: true,
    max_retries: 2,
    retry_max_tokens_cap: 32,
  });
  const body = await runChatCompletionHarness({
    requestPayload: req,
    policy,
    upstreamJson: async (_path, payload) => {
      seen.push(structuredClone(payload));
      if (seen.length === 1) {
        return { choices: [{ finish_reason: "length", message: { role: "assistant", content: "", reasoning_content: "thinking..." } }] };
      }
      return response("Done.", []);
    },
  });
  assert.equal(body.choices[0].message.content, "Done.");
  assert.equal(seen[0].max_tokens, 8);
  assert.equal(seen[1].max_tokens, 16);
  assert.deepEqual(seen[0].messages, seen[1].messages);
});

console.log("All qwen harness tests passed.");
