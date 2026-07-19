import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ADAPTER = path.join(ROOT, "lan-adapter.js");
const HARNESS = path.join(ROOT, "proxy.mjs");

test("LAN adapter serves every public protocol and failure path", async () => {
  const requests = [];
  let audioBody = "";
  const upstream = await startServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/v1/models") {
      return sendJson(res, 200, { object: "list", data: [{ id: "lan-model", object: "model" }] });
    }
    const body = await readJson(req);
    requests.push({ path: req.url, body });
    if (body.messages?.some((message) => message.content === "trigger failure")) {
      return sendJson(res, 503, { error: { message: "upstream unavailable" } });
    }
    if (body.stream === true) {
      res.writeHead(200, { "content-type": "text/event-stream" });
      return res.end('data: {"choices":[{"delta":{"content":"streamed"}}]}\n\ndata: [DONE]\n\n');
    }
    if (req.url === "/v1/completions" || req.url === "/completion") {
      return sendJson(res, 200, {
        id: "cmpl_test",
        model: "lan-model",
        choices: [{ text: "completed", finish_reason: "stop" }],
      });
    }
    const tool = body.tools?.[0]?.function;
    return sendJson(res, 200, {
      id: "chatcmpl_test",
      model: "lan-model",
      choices: [{
        finish_reason: tool ? "tool_calls" : "stop",
        message: {
          role: "assistant",
          content: tool ? "" : "hello",
          ...(tool ? {
            tool_calls: [{
              id: "call_test",
              type: "function",
              function: { name: tool.name, arguments: '{"value":"ok"}' },
            }],
          } : {}),
        },
      }],
      usage: { prompt_tokens: 2, completion_tokens: 1, total_tokens: 3 },
    });
  });
  const audio = await startServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/v1/models") {
      return sendJson(res, 200, { object: "list", data: [{ id: "whisper-v3:turbo", object: "model" }] });
    }
    audioBody = (await readBuffer(req)).toString("utf8");
    return sendJson(res, 200, { text: "transcribed" });
  });
  const ports = [await freePort(), await freePort()];
  const adapter = await startAdapter({
    ADAPTER_PORTS: ports.join(","),
    AUDIO_MODEL_ALIASES: "whisper-v3:turbo,whisper-1",
    AUDIO_MODEL_ALIAS: "whisper-v3:turbo",
    AUDIO_UPSTREAM: audio.url,
    DEFAULT_MAX_TOKENS: "321",
    DEFAULT_MIN_P: "0.01",
    DEFAULT_TEMPERATURE: "0.7",
    DEFAULT_TOP_K: "17",
    DEFAULT_TOP_P: "0.9",
    LLAMA_UPSTREAM: upstream.url,
    MODEL_ALIAS: "lan-model",
    MODEL_METADATA_JSON: JSON.stringify({ family: "gemma-4", context_size: 131072 }),
    PUBLIC_MODEL_ALIASES: "public-model",
  }, ports);

  try {
    for (const port of ports) {
      const health = await fetchJson(`http://127.0.0.1:${port}/health`);
      assert.equal(health.status, "ok");
      assert.equal(health.model, "lan-model");
      assert.equal(health.harness, null);
    }

    const preflight = await fetch(`http://127.0.0.1:${ports[0]}/v1/chat/completions`, { method: "OPTIONS" });
    assert.equal(preflight.status, 200);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "*");

    const models = await fetchJson(`http://127.0.0.1:${ports[0]}/v1/models`);
    assert.deepEqual(
      models.data.map((model) => model.id).sort(),
      ["lan-model", "public-model", "whisper-1", "whisper-v3:turbo"].sort(),
    );
    assert.equal(models.metadata.model.context_length, 131072);

    const chat = await postJson(ports[0], "/v1/chat/completions", {
      model: "public-model",
      messages: [{ role: "user", content: "hello" }],
    });
    assert.equal(chat.model, "public-model");
    assert.equal(chat.choices[0].message.content, "hello");
    const chatRequest = requests.find((item) => item.path === "/v1/chat/completions");
    assert.deepEqual(
      pick(chatRequest.body, ["model", "temperature", "top_p", "top_k", "min_p", "max_tokens"]),
      { model: "lan-model", temperature: 0.7, top_p: 0.9, top_k: 17, min_p: 0.01, max_tokens: 321 },
    );

    const stream = await fetch(`http://127.0.0.1:${ports[0]}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "public-model", messages: [{ role: "user", content: "stream" }], stream: true }),
    });
    assert.match(stream.headers.get("content-type"), /text\/event-stream/);
    assert.match(await stream.text(), /streamed/);
    assert.equal(requests.at(-1).body.stream, true);

    const completion = await postJson(ports[0], "/v1/completions", { model: "public-model", prompt: "complete" });
    assert.equal(completion.model, "public-model");
    assert.equal(completion.choices[0].text, "completed");
    assert.equal((await postJson(ports[0], "/completion", { model: "public-model", prompt: "complete" })).model, "public-model");

    const response = await postJson(ports[0], "/v1/responses", {
      model: "public-model",
      instructions: "Be concise.",
      input: "hello",
    });
    assert.equal(response.output_text, "hello");
    assert.equal((await fetchJson(`http://127.0.0.1:${ports[0]}/v1/responses/${response.id}`)).id, response.id);

    const anthropic = await postJson(ports[0], "/v1/messages", {
      model: "public-model",
      max_tokens: 30,
      messages: [{ role: "user", content: "use tool" }],
      tools: [{
        name: "echo",
        input_schema: { type: "object", properties: { value: { type: "string" } } },
      }],
    });
    assert.equal(anthropic.stop_reason, "tool_use");
    assert.deepEqual(anthropic.content.find((item) => item.type === "tool_use").input, { value: "ok" });

    const form = new FormData();
    form.set("model", "whisper-1");
    form.set("file", new Blob(["audio"]), "sample.wav");
    const audioResponse = await fetch(`http://127.0.0.1:${ports[0]}/v1/audio/transcriptions`, {
      method: "POST",
      body: form,
    });
    assert.deepEqual(await audioResponse.json(), { text: "transcribed" });
    assert.match(audioBody, /whisper-v3:turbo/);
    assert.doesNotMatch(audioBody, /\r?\n\r?\nwhisper-1\r?\n/);

    const invalid = await fetch(`http://127.0.0.1:${ports[0]}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });
    assert.equal(invalid.status, 400);
    assert.match((await invalid.json()).error.message, /Invalid JSON/);

    const failed = await fetch(`http://127.0.0.1:${ports[0]}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "trigger failure" }] }),
    });
    assert.equal(failed.status, 503);
    assert.equal((await failed.json()).error.message, "upstream unavailable");

    assert.equal((await fetch(`http://127.0.0.1:${ports[0]}/missing`)).status, 404);
  } finally {
    await adapter.close();
    await Promise.all([upstream.close(), audio.close()]);
  }
});

test("LAN adapter loads the shared harness and preserves streaming", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lan-adapter-test-"));
  const policyPath = path.join(tempDir, "policy.json");
  const logPath = path.join(tempDir, "harness.jsonl");
  fs.writeFileSync(policyPath, JSON.stringify({
    max_retries: 0,
    passthrough_response: false,
    repair_json_on_passthrough: false,
    repair_schema_json_on_passthrough: false,
    respect_client_sampler: true,
  }));
  const upstream = await startServer(async (req, res) => {
    const body = await readJson(req);
    if (body.stream) {
      res.writeHead(200, { "content-type": "text/event-stream" });
      return res.end('data: {"choices":[{"delta":{"content":"streamed"}}]}\n\ndata: [DONE]\n\n');
    }
    return sendJson(res, 200, {
      choices: [{
        message: {
          role: "assistant",
          content: '<tool_call>{"name":"echo","arguments":{"value":"ok"}}</tool_call>',
        },
      }],
    });
  });
  const port = await freePort();
  const adapter = await startAdapter({
    HARNESS_LOG_JSONL: logPath,
    HARNESS_MODEL_ALIASES: "harness-model",
    HARNESS_MODULE: HARNESS,
    HARNESS_POLICY: policyPath,
    LLAMA_UPSTREAM: upstream.url,
    MODEL_ALIAS: "lan-model",
    PUBLIC_MODEL_ALIASES: "harness-model",
  }, [port]);

  try {
    const health = await fetchJson(`http://127.0.0.1:${port}/health`);
    assert.equal(health.harness.mode, "selected_models");

    const completion = await postJson(port, "/v1/chat/completions", {
      model: "harness-model",
      messages: [{ role: "user", content: "echo" }],
      tools: [{
        type: "function",
        function: {
          name: "echo",
          parameters: { type: "object", properties: { value: { type: "string" } } },
        },
      }],
    });
    assert.equal(completion.choices[0].message.tool_calls[0].function.name, "echo");
    assert.equal(JSON.parse(completion.choices[0].message.tool_calls[0].function.arguments).value, "ok");
    assert.equal(fs.existsSync(logPath), true);

    const stream = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "harness-model", messages: [{ role: "user", content: "stream" }], stream: true }),
    });
    assert.match(stream.headers.get("content-type"), /text\/event-stream/);
    assert.match(await stream.text(), /streamed/);
  } finally {
    await adapter.close();
    await upstream.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

async function startAdapter(env, ports) {
  const child = spawn(process.execPath, [ADAPTER], {
    cwd: ROOT,
    env: {
      ...process.env,
      ADAPTER_HOST: "127.0.0.1",
      ADAPTER_PORTS: ports.join(","),
      AUDIO_UPSTREAM: "",
      HARNESS_LOG_JSONL: "",
      HARNESS_MODEL_ALIASES: "",
      HARNESS_MODULE: "",
      HARNESS_POLICY: "",
      PUBLIC_MODEL_ALIASES: "",
      ...env,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  child.once("exit", (code) => {
    if (code && !output.includes("SIGTERM")) output += `\nadapter exited with ${code}`;
  });
  try {
    await Promise.all(ports.map((port) => waitForHealth(port, child, () => output)));
  } catch (error) {
    child.kill("SIGTERM");
    throw error;
  }
  return {
    close: async () => {
      if (child.exitCode != null) return;
      child.kill("SIGTERM");
      await Promise.race([
        new Promise((resolve) => child.once("exit", resolve)),
        new Promise((resolve) => setTimeout(resolve, 2_000)),
      ]);
    },
  };
}

async function waitForHealth(port, child, output) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode != null) throw new Error(output());
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`adapter did not start on port ${port}\n${output()}`);
}

async function startServer(handler) {
  const server = http.createServer((req, res) => {
    Promise.resolve(handler(req, res)).catch((error) => {
      sendJson(res, 500, { error: { message: error.message } });
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  return {
    port,
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function freePort() {
  const server = await startServer((_req, res) => res.end());
  const { port } = server;
  await server.close();
  return port;
}

async function readBuffer(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function readJson(req) {
  const buffer = await readBuffer(req);
  return buffer.length ? JSON.parse(buffer.toString("utf8")) : {};
}

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function fetchJson(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200);
  return response.json();
}

async function postJson(port, route, body) {
  const response = await fetch(`http://127.0.0.1:${port}${route}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  assert.equal(response.status, 200);
  return response.json();
}

function pick(value, keys) {
  return Object.fromEntries(keys.map((key) => [key, value[key]]));
}
