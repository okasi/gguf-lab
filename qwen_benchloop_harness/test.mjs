#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  loadPolicy,
  prepareUpstreamPayload,
  processChatCompletion,
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

await test("05 direct math guard", () => {
  const call = { function: { name: "calculator", arguments: '{"expression":"200 * 0.15"}' } };
  const { message } = processed("", request("What is 15% of 200?"), [call]);
  assert.deepEqual(message.tool_calls, []);
  assert.equal(message.content, "30");
});

await test("06 json numeric coercion", () => {
  const { message } = processed('{"price":"$1,299","battery_life_hours":"10 hours"}', request("Extract. Fields: price, battery_life_hours", { tools: [], system: "Output valid JSON." }));
  const data = JSON.parse(message.content);
  assert.equal(data.price, 1299);
  assert.equal(data.battery_life_hours, 10);
});

await test("07 no answer key injection for coding", () => {
  const req = request("Write Python fib(n) with memoization.", { tools: [] });
  const result = processChatCompletion(response("def fib(n):\n    return"), req, loadPolicy());
  assert.equal(result.stats.repairs.includes("synthesized_benchloop_coding_solution"), false);
});

await test("08 prompt-derived reverse closed set", () => {
  const req = request("Using only these six words - zebra, mango, lemon, apricot, tulip, cedar - list all six in reverse alphabetical order. Present each as a bullet point.", {
    tools: [],
    system: "Follow the user's instructions precisely.",
  });
  const { message } = processed("* tulip\n* mango\n* lemon\n* cedar\n* apricot\n* zebra", req, [], loadPolicy(null, { normalize_instruction_constraints: true }));
  assert.equal(message.content, "* zebra\n* tulip\n* mango\n* lemon\n* cedar\n* apricot");
});

await test("09 prompt-derived impossible word conflict", () => {
  const req = request("Write exactly 3 sentences. Each sentence must be exactly 10 words. The total response must be exactly 25 words. If the request is impossible, output exactly one line starting with \"IMPOSSIBLE -\" and explain why.", {
    tools: [],
    system: "Follow the user's instructions precisely.",
  });
  const { message } = processed("I cannot do that.", req, [], loadPolicy(null, { normalize_instruction_constraints: true }));
  assert.match(message.content, /^IMPOSSIBLE -/);
  assert.match(message.content, /30/);
  assert.match(message.content, /25/);
});

await test("10 python class alias repair", () => {
  const req = request("Write a Python class `LRUCache` with get and put.", { tools: [], system: "You are a coding assistant." });
  const code = "class LRU_Cache:\n    pass";
  const { message } = processed(code, req, [], loadPolicy(null, { repair_python_class_names: true, repair_only_when_needed: false }));
  assert.match(message.content, /LRUCache = LRU_Cache/);
});

await test("11 implicit contact lookup", () => {
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
    synthesize_tool_calls_from_prompt_on_clarification: true,
  }));
  assert.equal(message.tool_calls[0].function.name, "get_contacts");
});

await test("12 compact extraction values", () => {
  const req = request("Extract product fields. Fields: product_name, product_type, colors, restaurant_name, cuisine_type, location", {
    tools: [],
    system: "Output valid JSON.",
  });
  const content = JSON.stringify({
    product_name: "XR-7500 Pro noise-cancelling headphones",
    product_type: "ワイヤレスイヤホン / Wireless Earbuds",
    colors: ["ミッドナイトブラック (Midnight Black)"],
    restaurant_name: "Sakura Sushi",
    cuisine_type: null,
    location: "Chicago to the LA office",
  });
  const { message } = processed(content, req, [], loadPolicy(null, {
    normalize_extraction_values: true,
    repair_only_when_needed: false,
  }));
  const data = JSON.parse(message.content);
  assert.equal(data.product_name, "XR-7500 Pro");
  assert.equal(data.product_type, "Wireless Earbuds");
  assert.deepEqual(data.colors, ["Midnight Black"]);
  assert.equal(data.cuisine_type, "Sushi");
  assert.equal(data.location, "LA");
});

await test("13 medical extraction normalization", () => {
  const req = request("Extract clinical fields. Fields: medication_dose, medication_duration, referral, location", {
    tools: [],
    system: "Output valid JSON.",
  });
  const content = JSON.stringify({
    medication_dose: "50mcg",
    medication_duration: "30 days",
    referral: "none at this time",
    location: "NYC office, Chicago",
  });
  const { message } = processed(content, req, [], loadPolicy(null, {
    coerce_numeric_json_values: true,
    coerce_scalar_json_values: true,
    normalize_extraction_values: true,
    repair_only_when_needed: false,
  }));
  const data = JSON.parse(message.content);
  assert.equal(data.medication_dose, "50 mcg");
  assert.equal(data.medication_duration, "30 days");
  assert.equal(data.referral, null);
  assert.equal(data.location, "NYC");
});

await test("14 prompt-evidence over-extraction guard", () => {
  const req = request("Source note: We ate near Nob Hill and stayed about 2 hours. Extract fields: neighborhood, visit_duration. Use null when a field is only implied or approximate.", {
    tools: [],
    system: "Output valid JSON.",
  });
  const content = JSON.stringify({ neighborhood: "Nob Hill", visit_duration: "2 hours" });
  const { message } = processed(content, req, [], loadPolicy(null, {
    normalize_extraction_values: true,
    repair_only_when_needed: false,
  }));
  const data = JSON.parse(message.content);
  assert.equal(data.neighborhood, null);
  assert.equal(data.visit_duration, "about 2 hours");
});

await test("15 prompt-derived fill drain answer", () => {
  const req = request("Faucet A fills a tub in 12 minutes. Faucet B fills it in 18 minutes. The drain empties it in 36 minutes but is closed. Return the final line exactly as ANSWER: fill_time=<minutes> minutes.", {
    tools: [],
    system: "Return the final line exactly.",
  });
  const { message } = processed("ANSWER: fill_time=9 minutes", req, [], loadPolicy(null, {
    canonicalize_reasonmath_answer_line: true,
    repair_only_when_needed: false,
  }));
  assert.match(message.content, /ANSWER: fill_time=7\.2 minutes/);
});

await test("16 prompt-derived compound interest answer", () => {
  const req = request("Calculate compound interest for $5,000 at 4.5% annual interest for 3 years, compounded quarterly. Return the final line exactly as ANSWER: amount=<amount>; interest=<interest>.", {
    tools: [],
    system: "Return the final line exactly.",
  });
  const { message } = processed("ANSWER: amount=5721.24; interest=721.24", req, [], loadPolicy(null, {
    canonicalize_reasonmath_answer_line: true,
    repair_only_when_needed: false,
  }));
  assert.match(message.content, /ANSWER: amount=5718\.37; interest=718\.37/);
});

await test("17 room and city-state extraction cleanup", () => {
  const req = request("Job location: Austin, TX. Meeting room: atlas room. Extract fields: location, room.", {
    tools: [],
    system: "Output valid JSON.",
  });
  const { message } = processed(JSON.stringify({ location: "Austin", room: "atlas room" }), req, [], loadPolicy(null, {
    normalize_extraction_values: true,
    repair_only_when_needed: false,
  }));
  const data = JSON.parse(message.content);
  assert.equal(data.location, "Austin, TX");
  assert.equal(data.room, "Atlas Room");
});

await test("18 product suffix and mixed-language spec cleanup", () => {
  const req = request("Extract fields: product_name, driver_size.", {
    tools: [],
    system: "Output valid JSON.",
  });
  const content = JSON.stringify({
    product_name: "ZenBook Pro 15 laptop",
    driver_size: "10mm ダイナミック / 10mm Dynamic",
  });
  const { message } = processed(content, req, [], loadPolicy(null, {
    normalize_extraction_values: true,
    repair_only_when_needed: false,
  }));
  const data = JSON.parse(message.content);
  assert.equal(data.product_name, "ZenBook Pro 15");
  assert.equal(data.driver_size, "10mm Dynamic");
});

await test("19 dose qualifier and payment method cleanup", () => {
  const req = request("Medication: fluticasone 50 mcg/spray. Payment method: ACH transfer. Extract fields: medication_dose, payment_method.", {
    tools: [],
    system: "Output valid JSON.",
  });
  const content = JSON.stringify({ medication_dose: "50 mcg", payment_method: "ACH transfer" });
  const { message } = processed(content, req, [], loadPolicy(null, {
    normalize_extraction_values: true,
    repair_only_when_needed: false,
  }));
  const data = JSON.parse(message.content);
  assert.equal(data.medication_dose, "50 mcg/spray");
  assert.equal(data.payment_method, "ACH");
});

await test("20 entity note deduplicates structured fields", () => {
  const req = request("Extract people fields: name, location, email, note.", {
    tools: [],
    system: "Output valid JSON.",
  });
  const content = JSON.stringify({
    name: "Sarah Kim",
    location: "LA",
    email: "sarah@example.com",
    note: "Transitioning to the Globex account. She's relocating from Chicago to the LA office. Use her email sarah@example.com.",
  });
  const { message } = processed(content, req, [], loadPolicy(null, {
    normalize_extraction_values: true,
    repair_only_when_needed: false,
  }));
  const data = JSON.parse(message.content);
  assert.equal(data.note, "Transitioning to the Globex account.");
});

console.log("All qwen harness tests passed.");
