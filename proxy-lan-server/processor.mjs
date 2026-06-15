import fs from "fs";
import path from "path";
import {
  loadPolicy,
  prepareUpstreamPayload,
  processChatCompletion,
  retryReasonForProcessed,
} from "./proxy.mjs";

export { loadPolicy, prepareUpstreamPayload, processChatCompletion };

function writeJsonl(logJsonl, payload) {
  if (!logJsonl) return;
  fs.mkdirSync(path.dirname(logJsonl), { recursive: true });
  fs.appendFileSync(logJsonl, `${JSON.stringify({ ts: Date.now() / 1000, ...payload })}\n`, "utf8");
}

function payloadForRetry(payload, retryReason) {
  const next = structuredClone(payload ?? {});
  if (retryReason === "empty_response") {
    next.max_tokens = Math.max(Number(next.max_tokens ?? 0), 512);
  }
  return next;
}

export async function runChatCompletionHarness({ upstreamJson, requestPayload, policy, logJsonl, path: requestPath = "/v1/chat/completions" }) {
  const upstreamPayload = prepareUpstreamPayload(requestPayload, policy);
  let attemptPayload = upstreamPayload;
  const attempts = [];
  let finalBody = null;
  let parseStats = {};
  const maxAttempts = Math.max(1, Number(policy.max_retries ?? 0) + 1);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const result = await upstreamJson(requestPath, attemptPayload);
    const attemptInfo = {
      attempt: attempt + 1,
      status: result?.error ? 502 : 200,
      max_tokens: attemptPayload.max_tokens ?? attemptPayload.max_output_tokens ?? null,
    };
    if (result?.error) {
      attempts.push({ ...attemptInfo, retry_reason: "upstream_error" });
      if (attempt < maxAttempts - 1) continue;
      throw new Error(result.error?.message || String(result.error));
    }

    const processed = processChatCompletion(result, requestPayload, policy);
    parseStats = processed.stats || {};
    const retryReason = retryReasonForProcessed(processed.body, requestPayload, parseStats, policy);
    attempts.push({ ...attemptInfo, retry_reason: retryReason ?? "" });
    if (retryReason && attempt < maxAttempts - 1) {
      attemptPayload = payloadForRetry(attemptPayload, retryReason);
      continue;
    }

    finalBody = processed.body;
    break;
  }

  writeJsonl(logJsonl, {
    path: requestPath,
    model: requestPayload.model,
    attempts,
    parse: parseStats,
  });

  return finalBody ?? { error: { message: "Gemma harness produced no response" } };
}
