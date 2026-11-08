import { reportApiError } from "@/api/feedback";
import { expireSession, getAccessToken, getRefreshToken, refreshAccessToken } from "@/api/session";

type StreamHandlers = {
  onMeta?: (event: { conversation_id?: string }) => void;
  onDelta?: (content: string) => void;
};

const REFRESH_CODES = new Set([40101, 40102, 40104]);

function apiOrigin() {
  return typeof REACT_APP_API_URL === "string" ? REACT_APP_API_URL : "";
}

function fail(text: string): never {
  reportApiError(text);
  throw new Error(text);
}

async function readErrorBody(resp: Response) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

function eventData(rawEvent: string) {
  return rawEvent
    .split("\n")
    .filter(line => line.startsWith("data:"))
    .map(line => line.slice(5).trimStart())
    .join("\n");
}

/** 对话 POST 的 SSE。校验失败仍是 JSON，只提示一次，再抛出让页面收回已写入的内容。 */
export async function streamAiChat(path: string, body: Record<string, string>, handlers: StreamHandlers, attempt = 0): Promise<unknown> {
  const base = apiOrigin();
  const token = getAccessToken();
  let resp: Response;
  try {
    resp = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });
  } catch {
    fail("网络请求失败");
  }

  const type = (resp.headers.get("content-type") || "").toLowerCase();
  if (type.includes("json")) {
    const payload = await readErrorBody(resp);
    const code = payload?.code;
    if (REFRESH_CODES.has(code) && attempt === 0 && getRefreshToken()) {
      try {
        await refreshAccessToken(base);
      } catch {
        expireSession();
        fail("登录已失效，请重新登录");
      }
      return streamAiChat(path, body, handlers, attempt + 1);
    }
    if (code === 40101 || code === 40102 || code === 40103) expireSession();
    const message = typeof payload?.message === "string" && payload.message ? payload.message : "请求失败";
    fail(message);
  }

  if (!resp.body) fail("网络请求失败");
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let conversation: unknown = null;
  let sawDone = false;
  while (true) {
    let chunk: ReadableStreamReadResult<Uint8Array>;
    try {
      chunk = await reader.read();
    } catch {
      fail("网络请求失败");
    }
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    buffer = buffer.replace(/\r\n/g, "\n");
    let splitAt = buffer.indexOf("\n\n");
    while (splitAt >= 0) {
      const data = eventData(buffer.slice(0, splitAt));
      buffer = buffer.slice(splitAt + 2);
      if (data) {
        let event: { type?: string; content?: string; message?: string; conversation?: unknown; conversation_id?: string } | null = null;
        try {
          event = JSON.parse(data);
        } catch {
          event = null;
        }
        if (event?.type === "meta") handlers.onMeta?.(event);
        else if (event?.type === "delta" && typeof event.content === "string") handlers.onDelta?.(event.content);
        else if (event?.type === "done") {
          sawDone = true;
          conversation = event.conversation;
        } else if (event?.type === "error") {
          const message = typeof event.message === "string" && event.message ? event.message : "请求失败";
          fail(message);
        }
      }
      splitAt = buffer.indexOf("\n\n");
    }
  }
  if (!sawDone || !conversation) fail("网络请求失败");
  return conversation;
}
