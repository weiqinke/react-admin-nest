import axios from "axios";
import { reportApiError } from "./feedback";
import { expireSession, getAccessToken, getRefreshToken, refreshAccessToken } from "./session";
import { promptStepUp } from "@/utils/stepUp";

const PUBLIC_PATHS = [
  "/health",
  "/api/captcha",
  "/api/crypto/public-key",
  "/api/register",
  "/api/login",
  "/api/token/refresh",
  "/api/site",
  "/api/password/forgot",
  "/api/password/reset",
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
  if (code === 40302) {
    const reason = body?.data?.disable_reason;
    return reason ? `账号已禁用：${reason}` : "账号已禁用";
  }
  if (code === 40303) return "注册已关闭";
  if (code === 40304) {
    const wait = body?.data?.retry_after;
    return wait ? `用户名已锁定，请 ${wait} 秒后再试` : "用户名已锁定";
  }
  if (code === 40305) return "密码已过期，请联系管理员重置或登录后立即改密";
  if (code === 40306) return "需要双因素验证码";
  if (code === 40307) return "须先修改密码后才能继续操作";
  if (code === 40308) return "请先阅读并确认必读公告";
  if (code === 40309) return "邮件功能未启用";
  if (code === 40310) return "敏感操作需要二次确认";
  if (code === 40904) return "受保护，不能修改（不能停用自己或改受保护资源）";
  if (code === 40905) return serverMessage && serverMessage !== "in use" ? serverMessage : "仍被引用，无法删除";
  if (code === 42901) {
    const wait = body?.data?.retry_after;
    return wait ? `请求过于频繁，请 ${wait} 秒后再试` : "请求过于频繁";
  }
  if (code === 40002) return "验证码错误，请重新获取";
  if (code === 40003) return "密码加密无效，请重试";
  if (code === 40005) return "用户名需为 3-32 位字母、数字或下划线";
  if (code === 40006) return "密码长度需为 6-64 位";
  if (code === 40103) return "登录已失效，请重新登录";
  if (code === 40901) return serverMessage === "conflict" ? "资源冲突：同级 segment 可能已存在" : serverMessage;
  if (code === 40902) return serverMessage || "角色约束冲突";
  if (code === 40903) return "动态职责分离冲突，请指定激活角色";
  if (code === 40906) return "用户名已存在";
  if (code === 40105) return "OAuth 状态无效或已过期，请重试";
  if (code === 40106) return "OAuth 换票失败，请重试";
  if (code === 40402) return "该第三方登录未启用";
  if (code === 40907) return "该第三方账号已绑定其他用户";
  if (code === 50301 || body?.httpStatus === 503) {
    return body?.data?.maintenance_message || serverMessage || "系统维护中";
  }
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
          const text = response?.status === 503 ? "系统维护中，请稍后再试" : "请求错误";
          notifyError(response?.config, text);
          return Promise.reject(toApiError({ code: response.status, message: text }, response.status));
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

      // Step-up：弹窗确认后带令牌重试一次
      if (body.code === 40310 && !config._stepUpRetry && !isPublic(config.url)) {
        const confirmation = await promptStepUp("敏感操作需要二次确认");
        if (confirmation) {
          config._stepUpRetry = true;
          config.headers = config.headers || {};
          config.headers["X-Confirmation-Token"] = confirmation;
          return service(config);
        }
      }

      if (body.code === 40307) {
        localStorage.setItem("must_change_password", "1");
        window.dispatchEvent(new CustomEvent("auth:must-change-password"));
      }

      if (body.code === 40308) {
        window.dispatchEvent(new CustomEvent("announcements:refresh"));
      }

      if (body.code === 40103 || ((body.code === 40101 || body.code === 40102) && !isPublic(config.url) && !getRefreshToken())) {
        expireSession();
      }

      // 登录页自己处理 40306，避免重复 toast
      if (!(body.code === 40306 && requestPath(config.url) === "/api/login")) {
        notifyError(config, errorText(body));
      }
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
