import { request } from "@/api/request";
import { getAccessToken } from "@/api/session";

function frontendCallbackUrl() {
  return `${window.location.origin}/oauth/callback`;
}

/**
 * OAuth 是浏览器整页跳转，必须走当前站点同源路径（由 Nginx/Vite 反代 /api）。
 * 不能用 REACT_APP_API_URL：生产构建未设 DEPLOY_API_ORIGIN 时会写成 http://127.0.0.1:8080。
 */
function oauthPath(provider: string, action: "authorize" | "bind") {
  return `/api/oauth/${encodeURIComponent(provider)}/${action}`;
}

/** 浏览器跳转：发起 GitHub 等 OAuth 登录（公开接口）。 */
export function oauthAuthorizeUrl(provider = "github", redirect = frontendCallbackUrl()) {
  const qs = new URLSearchParams({ redirect });
  return `${oauthPath(provider, "authorize")}?${qs}`;
}

/**
 * 浏览器跳转：已登录绑定。
 * Auth 中间件支持 ?token=（与 WebSocket 一致），因为 location 跳转带不上 Bearer。
 */
export function oauthBindUrl(provider = "github", redirect = frontendCallbackUrl()) {
  const qs = new URLSearchParams({
    redirect,
    token: getAccessToken()
  });
  return `${oauthPath(provider, "bind")}?${qs}`;
}

export const listOAuthBindings = () => request("/api/oauth/bindings", "GET");

export const unbindOAuth = (provider: string) => request(`/api/oauth/${encodeURIComponent(provider)}`, "DELETE");
