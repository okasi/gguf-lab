# Gemma 4 Harness Clients

This repo's Gemma 4 harness is a general OpenAI-compatible adapter for local
Gemma 4 serving. Fastify is only the HTTP implementation. Treat BenchLoop,
OpenClaw/ClawBench, Hermes Agent, opencode, and similar tools as clients, not
targets for special-case behavior.

## Endpoint

When the harness is running on the Mac at `http://127.0.0.1:8092/v1`, local
clients can use that base URL directly. Containers should usually reach it
through `host.docker.internal`.

## OpenClaw / ClawBench

```yaml
gemma-4-12b-harness:
  api_key: "sk-local-placeholder"
  base_url: http://host.docker.internal:8092/v1
  api_type: openai-completions
  thinking_level: off
  temperature: 1
  max_tokens: 256
```

Use `openai-completions` as the default because llama.cpp's OpenAI-compatible
server natively serves chat completions. The harness also supports
non-streaming `/v1/responses` by translating the request shape to chat
completions, which is useful for clients that can be configured with
`api_type: openai-responses`.

## Hermes Agent / opencode

Use each client's OpenAI-compatible provider settings with:

- Base URL: `http://127.0.0.1:8092/v1`
- API key: any local placeholder value
- Model: the alias printed by `scripts/run_gemma4_12b_promoted_serve.sh`

## Safe Harness Boundary

- Allowed: CORS preflight handling, `/v1/models`, `/v1/chat/completions`,
  streaming chat pass-through, non-streaming `/v1/responses` protocol
  adaptation, JSON/code/tool-call shape normalization.
- Not allowed: prompt-derived answers, prompt-to-tool-call synthesis,
  direct-answer guards, benchmark task/rubric rewrites, or client-specific
  website/action heuristics.

For cheaper smoke tests, prefer ClawBench's `v1-lite` suite before attempting
full V1 or V2 runs.
