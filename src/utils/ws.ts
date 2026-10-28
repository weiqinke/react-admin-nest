import { refreshAccessToken } from "@/api/axios-interceptors";
import { getAccessToken } from "@/api/session";

export type WsStatus = "idle" | "connecting" | "connected" | "reconnecting" | "offline";

export type SocketEvent = {
  v?: number;
  type: string;
  request_id?: string;
  data?: any;
  payload?: any;
  name?: string;
};

type Listener = (event: SocketEvent) => void;

const MAX_BACKOFF = 10000;

function wsUrl(token: string) {
  const configured = (import.meta.env.VITE_WS_URL as string | undefined)?.trim();
  // 开发环境 HTTP 走 Vite 代理（基址为空），WebSocket 直连 goadmin，避免代理中途断开。
  const raw = configured || REACT_APP_WS_ORIGIN || REACT_APP_API_URL || window.location.origin;
  const base = new URL(raw || "/", window.location.origin);
  if (base.protocol === "http:") base.protocol = "ws:";
  else if (base.protocol === "https:") base.protocol = "wss:";
  if (!configured) {
    base.pathname = "/gows";
    base.search = "";
  }
  base.searchParams.set("token", token);
  return base.toString();
}

function WebsocketManager(this: any) {
  this.socket = null;
  this.MySocketID = null;
  this.status = "idle" as WsStatus;
  this.catchUpItems = [];
  this.listeners = new Set<Listener>();
  this.rooms = new Set<string>();
  this.manualClose = false;
  this.authRecovering = false;
  this.reconnectAttempt = 0;
  this.heartbeatTimer = 0;
  this.reconnectTimer = 0;
  this.closeTimer = 0;
}

export const webSocketManager = new (WebsocketManager as any)();

WebsocketManager.prototype.setStatus = function (status: WsStatus, extra: Record<string, any> = {}) {
  this.status = status;
  const data = { status, attempt: this.reconnectAttempt, ...extra };
  this.dispatchEventHandle({ type: "connection.status", data, payload: data });
};

WebsocketManager.prototype.clearTimers = function () {
  window.clearInterval(this.heartbeatTimer);
  window.clearTimeout(this.reconnectTimer);
  this.heartbeatTimer = 0;
  this.reconnectTimer = 0;
};

WebsocketManager.prototype.create = function () {
  this.manualClose = false;
  window.clearTimeout(this.closeTimer);
  if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;
  const token = getAccessToken();
  if (!token) {
    this.setStatus("offline", { last_error: "missing token" });
    return;
  }
  this.setStatus(this.reconnectAttempt > 0 ? "reconnecting" : "connecting");
  let socket: WebSocket;
  try {
    socket = new WebSocket(wsUrl(token));
  } catch (error) {
    this.setStatus("offline", { last_error: error instanceof Error ? error.message : "invalid websocket url" });
    return;
  }
  this.socket = socket;

  socket.onopen = () => {
    this.heartbeatTimer = window.setInterval(() => {
      this.postMessage({ type: "ping" });
    }, 30000);
  };

  socket.onmessage = event => {
    let frame: any;
    try {
      frame = JSON.parse(event.data);
    } catch {
      return;
    }
    const type = frame?.type;
    const payload = frame?.payload ?? {};
    if (type === "welcome") {
      this.MySocketID = payload.conn_id || null;
      this.reconnectAttempt = 0;
      this.setStatus("connected");
      this.rooms.forEach((room: string) => {
        this.postMessage({ type: "room.join", data: { room } });
      });
      this.postMessage({ type: "subscribe.list" });
    }
    if (type === "auth.expired") {
      this.recoverAuth();
    }
    if (type === "presence.catch_up" && Array.isArray(payload.items)) {
      this.catchUpItems = payload.items;
    }
    if (type === "pong") return;
    this.dispatchEventHandle({
      v: frame?.v,
      type,
      request_id: frame?.request_id,
      data: payload,
      payload
    });
  };

  socket.onclose = () => {
    this.clearTimers();
    if (this.socket === socket) this.socket = null;
    if (this.manualClose || this.authRecovering) return;
    this.MySocketID = null;
    this.scheduleReconnect();
  };

  socket.onerror = () => undefined;
};

WebsocketManager.prototype.scheduleReconnect = function () {
  this.reconnectAttempt += 1;
  const delay = Math.min(1000 * 2 ** (this.reconnectAttempt - 1), MAX_BACKOFF);
  this.setStatus("reconnecting");
  this.reconnectTimer = window.setTimeout(() => this.create(), delay);
};

WebsocketManager.prototype.recoverAuth = async function () {
  if (this.authRecovering) return;
  this.authRecovering = true;
  this.clearTimers();
  try {
    this.socket?.close();
  } catch {
    /* 关闭中的连接忽略 */
  }
  try {
    await refreshAccessToken(REACT_APP_API_URL);
    this.reconnectAttempt = 0;
    this.authRecovering = false;
    this.socket = null;
    this.create();
  } catch {
    this.authRecovering = false;
    this.manualClose = true;
    this.socket = null;
    this.MySocketID = null;
    this.setStatus("offline", { last_error: "auth expired" });
  }
};

WebsocketManager.prototype.postMessage = function (message: SocketEvent) {
  const data = message.data ?? message.payload ?? {};
  if (message.type === "room.join" && data.room) this.rooms.add(data.room);
  if (message.type === "room.leave" && data.room) this.rooms.delete(data.room);
  if (this.socket?.readyState !== WebSocket.OPEN) {
    console.error("===发送数据失败===");
    return;
  }
  this.socket.send(
    JSON.stringify({
      v: 1,
      type: message.type,
      request_id: message.request_id,
      payload: data
    })
  );
};

WebsocketManager.prototype.addEventHandler = function (fn: Listener) {
  this.listeners.add(fn);
  return () => this.listeners.delete(fn);
};

WebsocketManager.prototype.removeEventHandler = function (fn: Listener) {
  this.listeners.delete(fn);
};

WebsocketManager.prototype.dispatchEventHandle = function (event: SocketEvent) {
  this.listeners.forEach((fn: Listener) => fn(event));
};

WebsocketManager.prototype.close = function () {
  this.manualClose = true;
  window.clearTimeout(this.closeTimer);
  // 开发环境 React 会先卸载再挂上。推迟到下一个任务，若期间又 create 则取消关闭。
  this.closeTimer = window.setTimeout(() => {
    if (!this.manualClose) return;
    this.authRecovering = false;
    this.reconnectAttempt = 0;
    this.clearTimers();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.MySocketID = null;
    this.setStatus("idle");
  }, 0);
};
