import { request } from "@/api/request";
import { getAccessToken } from "@/api/session";

function apiBase() {
  return typeof REACT_APP_API_URL === "string" ? REACT_APP_API_URL : "";
}

function frontendCallbackUrl() {
  return `${window.location.origin}/oauth/callback`;
}

/** 浏览器跳转：发起 GitHub 等 OAuth 登录（公开接口）。 */
export function oauthAuthorizeUrl(provider = "github", redirect = frontendCallbackUrl()) {
  const qs = new URLSearchParams({ redirect });
  return `${apiBase()}/api/oauth/${encodeURIComponent(provider)}/authorize?${qs}`;
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
  return `${apiBase()}/api/oauth/${encodeURIComponent(provider)}/bind?${qs}`;
}

export const listOAuthBindings = () => request("/api/oauth/bindings", "GET");

export const unbindOAuth = (provider: string) => request(`/api/oauth/${encodeURIComponent(provider)}`, "DELETE");
