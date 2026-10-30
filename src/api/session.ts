const ACCESS_TOKEN = "token";
const REFRESH_TOKEN = "refresh_token";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN) || "";
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN) || "";
}

/** 写入登录 / 刷新返回的双 token。用户 id 保持字符串，避免雪花精度丢失。 */
export function saveLoginSession(data: { token?: string; refresh_token?: string; expires_at?: string; refresh_expires_at?: string; user?: any }) {
  if (data?.token) localStorage.setItem(ACCESS_TOKEN, data.token);
  if (data?.refresh_token) localStorage.setItem(REFRESH_TOKEN, data.refresh_token);
  if (data?.expires_at) localStorage.setItem("expires_at", data.expires_at);
  if (data?.refresh_expires_at) localStorage.setItem("refresh_expires_at", data.refresh_expires_at);

  const user = data?.user;
  if (!user) return;

  if (user.id != null) localStorage.setItem("uid", String(user.id));
  const nick = user.profile?.nickname || user.username || "";
  if (nick) localStorage.setItem("nick", nick);
  if (user.profile?.avatar) localStorage.setItem("avatar", user.profile.avatar);
  localStorage.setItem("loginState", "1");
  localStorage.setItem("permissions", JSON.stringify(user.permissions || []));
  localStorage.setItem("roles", JSON.stringify(user.roles || []));
  localStorage.setItem("active_roles", JSON.stringify(user.active_roles || []));
}

export function clearSession() {
  [ACCESS_TOKEN, REFRESH_TOKEN, "expires_at", "refresh_expires_at", "uid", "nick", "avatar", "loginState", "permissions", "roles", "active_roles"].forEach(key =>
    localStorage.removeItem(key)
  );
}
