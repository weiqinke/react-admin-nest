import axios from "axios";
import { reportApiError } from "./feedback";
import { expireSession, getAccessToken, getRefreshToken, refreshAccessToken } from "./session";

const PUBLIC_PATHS = [
  "/health",
  "/api/captcha",
  "/api/crypto/public-key",
  "/api/register",
  "/api/login",
  "/api/token/refresh",
  "/api/site",
  "/version",
  "/api/oauth/github/authorize",
  "/api/oauth/github/callback",
  "/api/oauth/gitee/authorize",
  "/api/oauth/gitee/callback"
];
const REFRESH_CODES = new Set([40101, 40102, 40104]);

function requestPath(url?: string) {
  if (!url) return "";
  try {
    if (url.startsWith("http")) return new URL(url).pathname;
  } catch {
    /* 相对路径继续按原字符串处理 */
  }
  return url.split("?")[0];
}

function isPublic(url?: string) {
  return PUBLIC_PATHS.includes(requestPath(url));
}

function errorText(body: any) {
  const code = body?.code;
  const serverMessage = body?.message || "请求失败";
  if (code === 40301 && body?.data?.permission) return `无权限：${body.data.permission}`;
  if (code === 40302) return "账号已禁用";
  if (code === 40303) return "注册已关闭";
  if (code === 40905) return serverMessage && serverMessage !== "in use" ? serverMessage : "仍被引用，无法删除";
  if (code === 42901) {
    const wait = body?.data?.retry_after;
    return wait ? `请求过于频繁，请 ${wait} 秒后再试` : "请求过于频繁";
  }
  if (code === 40002) return "验证码错误，请重新获取";
  if (code === 40003) return "密码加密无效，请重试";
  if (code === 40103) return "登录已失效，请重新登录";
  if (code === 40901) return serverMessage === "conflict" ? "资源冲突：同级 segment 可能已存在" : serverMessage;
  if (code === 40902) return serverMessage || "角色约束冲突";
  if (code === 40903) return "动态职责分离冲突，请指定激活角色";
  if (code === 40906) return "用户名已存在";
  if (code === 40105) return "OAuth 状态无效或已过期，请重试";
  if (code === 40106) return "OAuth 换票失败，请重试";
  if (code === 40402) return "该第三方登录未启用";
  if (code === 40907) return "该第三方账号已绑定其他用户";
  return serverMessage;
}

function toApiError(body: any, httpStatus?: number) {
  const error: any = new Error(errorText(body));
  error.code = body?.code;
  error.data = body?.data ?? null;
  error.httpStatus = httpStatus;
  return error;
}

function notifyError(config: any, text: string) {
  if (!config?.skipErrorMessage) reportApiError(text);
}

const reqCommon = {
  onFulfilled(config) {
    config.headers = config.headers || {};
    if (!config.headers["X-Request-ID"] && typeof crypto?.randomUUID === "function") {
      config.headers["X-Request-ID"] = crypto.randomUUID();
    }
    if (isPublic(config.url)) {
      delete config.headers.Authorization;
      return config;
    }
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  onRejected(error) {
    return Promise.reject(error);
  }
};

function createResponseHandler(service) {
  return {
    async onFulfilled(response) {
      const body = response?.data;
      if (!body || typeof body.code !== "number") {
        if (response?.status >= 400) {
          notifyError(response?.config, "请求错误");
          return Promise.reject(toApiError({ code: response.status, message: "请求错误" }, response.status));
        }
        return response;
      }
      if (body.code === 0) return response;

      const config = response.config || {};
      const canRefresh = REFRESH_CODES.has(body.code) && !config._retry && !isPublic(config.url) && getRefreshToken();
      if (canRefresh) {
        config._retry = true;
        try {
          const token = await refreshAccessToken(service.defaults.baseURL);
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
          if (requestPath(config.url) === "/api/logout") {
            const latest = getRefreshToken();
            config.data = latest ? { refresh_token: latest } : {};
          }
          return service(config);
        } catch (error) {
          expireSession();
          notifyError(config, errorText({ code: 40103, message: "登录已失效，请重新登录" }));
          return Promise.reject(error);
        }
      }

      if (body.code === 40103 || ((body.code === 40101 || body.code === 40102) && !isPublic(config.url) && !getRefreshToken())) {
        expireSession();
      }

      notifyError(config, errorText(body));
      return Promise.reject(toApiError(body, response.status));
    },
    onRejected(error) {
      if (axios.isCancel(error) || error?.code === "ERR_CANCELED") return Promise.reject(error);
      notifyError(error?.config, "网络请求失败");
      return Promise.reject(error);
    }
  };
}

export function attachInterceptors(service) {
  const responseHandler = createResponseHandler(service);
  service.interceptors.request.use(reqCommon.onFulfilled, reqCommon.onRejected);
  service.interceptors.response.use(responseHandler.onFulfilled, responseHandler.onRejected);
}
