import http from "node:http";

const listenPort = Number(process.env.PROXY_PORT || 18081);
const upstream = process.env.UPSTREAM || "http://127.0.0.1:18080";
const upstreamUrl = new URL(upstream);

function stripLeadingThoughtMarkers(content) {
  if (typeof content !== "string" || content.length === 0) {
    return { content, extracted: "" };
  }

  let remaining = content;
  let extracted = "";
  let changed = true;

  while (changed) {
    changed = false;
    const leadingWhitespace = remaining.match(/^\s+/);
    if (leadingWhitespace) {
      remaining = remaining.slice(leadingWhitespace[0].length);
      changed = true;
    }

    const emptyThink = remaining.match(/^<think>\s*<\/think>\s*/i);
    if (emptyThink) {
      remaining = remaining.slice(emptyThink[0].length);
      changed = true;
      continue;
    }

    const thinkBlock = remaining.match(/^<think>\s*([\s\S]*?)\s*<\/think>\s*/i);
    if (thinkBlock) {
      extracted += (extracted ? "\n" : "") + thinkBlock[1].trim();
      remaining = remaining.slice(thinkBlock[0].length);
      changed = true;
      continue;
    }

    const channelBlock = remaining.match(/^<\|channel\>thought\s*<channel\|>\s*/i);
    if (channelBlock) {
      remaining = remaining.slice(channelBlock[0].length);
      changed = true;
      continue;
    }

    const altChannelBlock = remaining.match(/^<\|channel\|>thought\s*<\|?channel\|?>\s*/i);
    if (altChannelBlock) {
      remaining = remaining.slice(altChannelBlock[0].length);
      changed = true;
    }
  }

  return { content: remaining, extracted };
}

function sanitizeChoice(choice) {
  const message = choice?.message;
  if (message && typeof message.content === "string") {
    const stripped = stripLeadingThoughtMarkers(message.content);
    if (stripped.content !== message.content) {
      message.content = stripped.content;
      if (stripped.extracted && !message.reasoning_content) {
        message.reasoning_content = stripped.extracted;
      }
    }
  }

  if (choice?.delta && typeof choice.delta.content === "string") {
    const stripped = stripLeadingThoughtMarkers(choice.delta.content);
    choice.delta.content = stripped.content;
    if (stripped.extracted && !choice.delta.reasoning_content) {
      choice.delta.reasoning_content = stripped.extracted;
    }
  }
}

function sanitizeJsonResponse(payload) {
  if (!payload || !Array.isArray(payload.choices)) {
    return payload;
  }
  for (const choice of payload.choices) {
    sanitizeChoice(choice);
  }
  return payload;
}

function forward(req, res, body) {
  const headers = { ...req.headers };
  delete headers.host;
  headers["content-length"] = Buffer.byteLength(body);

  const options = {
    protocol: upstreamUrl.protocol,
    hostname: upstreamUrl.hostname,
    port: upstreamUrl.port,
    path: req.url,
    method: req.method,
    headers,
  };

  const upstreamReq = http.request(options, (upstreamRes) => {
    const chunks = [];
    upstreamRes.on("data", (chunk) => chunks.push(chunk));
    upstreamRes.on("end", () => {
      const raw = Buffer.concat(chunks);
      const responseHeaders = { ...upstreamRes.headers };
      const contentType = String(responseHeaders["content-type"] || "");

      if (contentType.includes("application/json") && raw.length > 0) {
        try {
          const payload = sanitizeJsonResponse(JSON.parse(raw.toString("utf8")));
          const out = Buffer.from(JSON.stringify(payload), "utf8");
          responseHeaders["content-length"] = String(out.length);
          res.writeHead(upstreamRes.statusCode || 200, responseHeaders);
          res.end(out);
          return;
        } catch {
          // Fall through to the unmodified response if upstream returned non-JSON.
        }
      }

      res.writeHead(upstreamRes.statusCode || 200, responseHeaders);
      res.end(raw);
    });
  });

  upstreamReq.on("error", (err) => {
    const payload = JSON.stringify({ error: { message: err.message } });
    res.writeHead(502, { "content-type": "application/json", "content-length": Buffer.byteLength(payload) });
    res.end(payload);
  });

  upstreamReq.end(body);
}

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => forward(req, res, Buffer.concat(chunks)));
});

server.listen(listenPort, "127.0.0.1", () => {
  console.log(`benchloop thought-strip proxy listening on http://127.0.0.1:${listenPort}, upstream ${upstream}`);
});
