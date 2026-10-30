import axios from "axios";

const ACCESS_TOKEN = "token";
const REFRESH_TOKEN = "refresh_token";

export type UserState = {
  uid?: string;
  exp?: number;
  [key: string]: any;
};

type SessionListener = (state: UserState) => void;
type AuthExpiredHandler = () => void;

const listeners = new Set<SessionListener>();
let onAuthExpired: AuthExpiredHandler | null = null;

function decodeJwtPayload(token: string) {
  const part = token.split(".")[1];
  if (!part) return {};
  try {
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
  } catch {
    return {};
  }
}

/** 从当前 access token 读登录态。刷新写入新 token 后，下次读取就是新的过期时间。 */
export function getUserState(): UserState {
  const token = getAccessToken();
  if (!token) return {};
  const claims = decodeJwtPayload(token);
  const storedUid = window.localStorage.getItem("uid");
  const uid = storedUid || claims.uid || claims.user_id || (claims.sub != null ? String(claims.sub) : "");
  let exp = claims.exp;
  if (!exp) {
    const expiresAt = window.localStorage.getItem("expires_at");
    if (expiresAt) {
      const ms = new Date(expiresAt).getTime();
      if (!Number.isNaN(ms)) exp = Math.floor(ms / 1000);
    }
  }
  return { ...claims, uid: uid ? String(uid) : "", exp };
}

function emitSession() {
  const state = getUserState();
  listeners.forEach(listener => listener(state));
}

export function subscribeSession(listener: SessionListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** 登录失效时由应用入口注册，用路由跳转，不在这里改 location。 */
export function setAuthExpiredHandler(handler: AuthExpiredHandler) {
  onAuthExpired = handler;
}

export function expireSession() {
  clearSession();
  onAuthExpired?.();
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN) || "";
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN) || "";
}

/** 写入登录 / 刷新返回的双 token。用户 id 保持字符串，避免雪花精度丢失。 */
export function saveLoginSession(data: { token?: string; refresh_token?: string; expires_at?: string; refresh_expires_at?: string; session_id?: string; user?: any }) {
  if (data?.token) localStorage.setItem(ACCESS_TOKEN, data.token);
  if (data?.refresh_token) localStorage.setItem(REFRESH_TOKEN, data.refresh_token);
  if (data?.expires_at) localStorage.setItem("expires_at", data.expires_at);
  if (data?.refresh_expires_at) localStorage.setItem("refresh_expires_at", data.refresh_expires_at);
  const sessionId = data?.session_id ?? data?.user?.session_id;
  if (sessionId) localStorage.setItem("session_id", String(sessionId));

  const user = data?.user;
  if (user) {
    if (user.id != null) localStorage.setItem("uid", String(user.id));
    const nick = user.profile?.nickname || user.username || "";
    if (nick) localStorage.setItem("nick", nick);
    if (user.profile?.avatar) localStorage.setItem("avatar", user.profile.avatar);
    localStorage.setItem("loginState", "1");
    localStorage.setItem("permissions", JSON.stringify(user.permissions || []));
    localStorage.setItem("roles", JSON.stringify(user.roles || []));
    localStorage.setItem("active_roles", JSON.stringify(user.active_roles || []));
  }

  emitSession();
}

export function clearSession() {
  [ACCESS_TOKEN, REFRESH_TOKEN, "expires_at", "refresh_expires_at", "session_id", "uid", "nick", "avatar", "loginState", "permissions", "roles", "active_roles"].forEach(key =>
    localStorage.removeItem(key)
  );
  emitSession();
}

let refreshing: Promise<string> | null = null;

/** 用独立 axios 调刷新接口，避免再走进带拦截器的实例。 */
export function refreshAccessToken(baseURL?: string) {
  if (!refreshing) {
    const refresh_token = getRefreshToken();
    const raw = axios.create({
      baseURL,
      timeout: 20000,
      validateStatus: () => true
    });
    refreshing = raw
      .post("/api/token/refresh", { refresh_token })
      .then(res => {
        const body = res.data;
        if (!body || body.code !== 0 || !body.data?.token) {
          const error: any = new Error(body?.message || "登录已失效，请重新登录");
          error.code = body?.code ?? 40103;
          error.data = body?.data ?? null;
          error.httpStatus = res.status;
          throw error;
        }
        saveLoginSession(body.data);
        return body.data.token as string;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}
