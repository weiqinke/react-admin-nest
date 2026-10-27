import { encryptPassword } from "./crypto";
import { request } from "./request";

const enc = encodeURIComponent;

function compact(query: Record<string, any>) {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ""));
}

async function withEncryptedPassword(payload: any) {
  if (!payload?.password || payload.password_encrypted) return payload;
  const keyRes = await getPublicKey();
  const password_encrypted = await encryptPassword(keyRes.data.data.public_key, payload.password);
  const body = { ...payload, password_encrypted };
  delete body.password;
  return body;
}

export const getHealth = () => request("/health", "GET");

export const getCaptcha = () => request("/api/captcha", "GET");

export const getPublicKey = () => request("/api/crypto/public-key", "GET");

export async function register(payload) {
  return request("/api/register", "POST", await withEncryptedPassword(payload));
}

export async function login(payload) {
  const body = await withEncryptedPassword(payload);
  if (Array.isArray(body.active_roles) && body.active_roles.length === 0) delete body.active_roles;
  return request("/api/login", "POST", body);
}

export const refreshToken = (refresh_token: string) => request("/api/token/refresh", "POST", { refresh_token });

export const logout = (refresh_token?: string, options?: any) => request("/api/logout", "POST", refresh_token ? { refresh_token } : {}, options);

export const getMe = () => request("/api/me", "GET");

/** 当前用户可渲染菜单树。登录即可，不要求 menu:read。data 为 { list }。 */
export const getMyMenus = () => request("/api/me/menus", "GET");

export const getMyProfile = () => request("/api/me/profile", "GET");

export const updateMyProfile = payload => request("/api/me/profile", "PUT", payload);

export const getLoginLogs = (query: any = {}) => request("/api/login/logs", "GET", compact(query));

export const getLoginStats = (query: any = {}) => request("/api/login/stats", "GET", compact(query));

export const getUsers = () => request("/api/users", "GET");

export const getUserProfile = (id: string) => request(`/api/users/${enc(id)}/profile`, "GET");

export const updateUserProfile = (id: string, payload) => request(`/api/users/${enc(id)}/profile`, "PUT", payload);

export const getPermissions = () => request("/api/permissions", "GET");

export const getPermission = (code: string) => request(`/api/permissions/${enc(code)}`, "GET");

export const createPermission = payload => request("/api/permissions", "POST", payload);

export const updatePermission = (code: string, payload) => request(`/api/permissions/${enc(code)}`, "PUT", payload);

export const deletePermission = (code: string) => request(`/api/permissions/${enc(code)}`, "DELETE");

export const getRoles = () => request("/api/roles", "GET");

export const getRole = (code: string) => request(`/api/roles/${enc(code)}`, "GET");

export const createRole = payload => request("/api/roles", "POST", payload);

export const updateRole = (code: string, payload) => request(`/api/roles/${enc(code)}`, "PUT", payload);

export const deleteRole = (code: string) => request(`/api/roles/${enc(code)}`, "DELETE");

export const getRolePermissions = (code: string) => request(`/api/roles/${enc(code)}/permissions`, "GET");

export const grantRolePermissions = (code: string, payload) => request(`/api/roles/${enc(code)}/permissions`, "POST", payload);

export const setRolePermissions = (code: string, permission_codes: string[]) =>
  request(`/api/roles/${enc(code)}/permissions`, "PUT", { permission_codes });

export const revokeRolePermission = (code: string, perm: string) => request(`/api/roles/${enc(code)}/permissions/${enc(perm)}`, "DELETE");

export const getConstraints = () => request("/api/roles/constraints", "GET");

export const createConstraint = payload => request("/api/roles/constraints", "POST", payload);

export const updateConstraint = (code: string, payload) => request(`/api/roles/constraints/${enc(code)}`, "PUT", payload);

export const deleteConstraint = (code: string) => request(`/api/roles/constraints/${enc(code)}`, "DELETE");

export const assignRole = (payload: { user_id: string; role_code: string }) => request("/api/rbac/assign", "POST", payload);

export const revokeRole = (payload: { user_id: string; role_code: string }) => request("/api/rbac/revoke", "POST", payload);

export const getAccessStats = (query: any = {}) => request("/api/stats/access", "GET", compact(query));

export const getAccessLogs = (query: any = {}) => request("/api/stats/access/logs", "GET", compact(query));

export const getAccessDaily = (query: any = {}) => request("/api/stats/access/daily", "GET", compact(query));

export const getAccessUsers = (query: any = {}) => request("/api/stats/access/users", "GET", compact(query));

export const getServerStats = () => request("/api/stats/server", "GET");
