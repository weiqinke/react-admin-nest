import { getPublicKey } from "./auth";
import { encryptPassword } from "./crypto";
import { request } from "./request";

export { getCaptcha, getPublicKey, login, register } from "./auth";

const enc = encodeURIComponent;

function compact(query: Record<string, any>) {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ""));
}

export const getHealth = () => request("/health", "GET");

export const refreshToken = (refresh_token: string) => request("/api/token/refresh", "POST", { refresh_token });

export const logout = (refresh_token?: string, options?: any) => request("/api/logout", "POST", refresh_token ? { refresh_token } : {}, options);

export const getMe = (options?: { signal?: AbortSignal }) => request("/api/me", "GET", {}, options);

/** 当前用户可渲染菜单树。登录即可，不要求 menu:read。data 为 { list }。 */
export const getMyMenus = () => request("/api/me/menus", "GET");

/** 管理端全量菜单树（含禁用 / is_public 等）。data 为 { list }。 */
export const getMenus = () => request("/api/menus", "GET");

export const getMenu = (id: string) => request(`/api/menus/${enc(id)}`, "GET");

export const createMenu = (payload: Record<string, any>) => request("/api/menus", "POST", payload);

export const updateMenu = (id: string, payload: Record<string, any>) => request(`/api/menus/${enc(id)}`, "PUT", payload);

export const updateMenuStatus = (id: string, status: 0 | 1) => request(`/api/menus/${enc(id)}/status`, "PUT", { status });

export const deleteMenu = (id: string) => request(`/api/menus/${enc(id)}`, "DELETE");

/** 菜单直接绑定的权限码。data 为 { permission_codes: string[] }。 */
export const getMenuPermissions = (id: string) => request(`/api/menus/${enc(id)}/permissions`, "GET");

export const setMenuPermissions = (id: string, permission_codes: string[]) => request(`/api/menus/${enc(id)}/permissions`, "PUT", { permission_codes });

export const getMyProfile = (options?: { signal?: AbortSignal }) => request("/api/me/profile", "GET", {}, options);

export const updateMyProfile = payload => request("/api/me/profile", "PUT", payload);

export const getLoginLogs = (query: any = {}) => request("/api/login/logs", "GET", compact(query));

export const getLoginStats = (query: any = {}, options: any = {}) => request("/api/login/stats", "GET", compact(query), options);

export const getUsers = (query: Record<string, any> = {}) => request("/api/users", "GET", compact(query));

/** 管理员建账号。密码只以 RSA-OAEP 密文提交，默认角色 user、状态启用。 */
export async function createManagedUser(payload: { username: string; password: string }) {
  const keyRes = await getPublicKey();
  const password_encrypted = await encryptPassword(keyRes.data.data.public_key, payload.password);
  return request("/api/users", "POST", { username: payload.username, password_encrypted });
}

/** 启用或停用。停用会踢掉该用户的全部会话；不能停用自己。 */
export const setManagedUserStatus = (id: string, status: 0 | 1) => request(`/api/users/${enc(id)}/status`, "PUT", { status });

/** 重置密码。成功后该用户全部会话失效，响应里没有明文。 */
export async function resetManagedUserPassword(id: string, password: string) {
  const keyRes = await getPublicKey();
  const password_encrypted = await encryptPassword(keyRes.data.data.public_key, password);
  return request(`/api/users/${enc(id)}/password`, "PUT", { password_encrypted });
}

/** 解除登录锁定，并清掉该用户名的失败次数。 */
export const unlockManagedUser = (id: string) => request(`/api/users/${enc(id)}/unlock`, "PUT", {});

/** 强制下次登录改密。可选踢掉该用户全部会话。 */
export const forcePasswordChange = (id: string, payload: { revoke_sessions?: boolean } = {}) => request(`/api/users/${enc(id)}/force-password-change`, "POST", payload);

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

/** 复制角色（含权限）。需要 role:write。 */
export const copyRole = (sourceCode: string, payload: { code: string; name: string }) => request(`/api/roles/${enc(sourceCode)}/copy`, "POST", payload);

/** custom 数据范围部门。需要 role:read / role:write。 */
export const getRoleScopeDepts = (code: string) => request(`/api/rbac/roles/${enc(code)}/scope-depts`, "GET");

export const setRoleScopeDepts = (code: string, department_ids: string[]) => request(`/api/rbac/roles/${enc(code)}/scope-depts`, "PUT", { department_ids });

export const getRolePermissions = (code: string) => request(`/api/roles/${enc(code)}/permissions`, "GET");

export const grantRolePermissions = (code: string, payload) => request(`/api/roles/${enc(code)}/permissions`, "POST", payload);

export const setRolePermissions = (code: string, permission_codes: string[]) => request(`/api/roles/${enc(code)}/permissions`, "PUT", { permission_codes });

export const revokeRolePermission = (code: string, perm: string) => request(`/api/roles/${enc(code)}/permissions/${enc(perm)}`, "DELETE");

export const getConstraints = () => request("/api/roles/constraints", "GET");

export const createConstraint = payload => request("/api/roles/constraints", "POST", payload);

export const updateConstraint = (code: string, payload) => request(`/api/roles/constraints/${enc(code)}`, "PUT", payload);

export const deleteConstraint = (code: string) => request(`/api/roles/constraints/${enc(code)}`, "DELETE");

export const assignRole = (payload: { user_id: string; role_code: string; hours?: number }, options?: any) => request("/api/rbac/assign", "POST", payload, options);

export const revokeRole = (payload: { user_id: string; role_code: string }, options?: any) => request("/api/rbac/revoke", "POST", payload, options);

/** 批量授予角色。data: { assigned, skipped } */
export const assignRoleBatch = (payload: { role_code?: string; code?: string; user_ids: string[]; hours?: number }) => request("/api/rbac/assign-batch", "POST", payload);

/** 批量撤销角色。data: { revoked, skipped } */
export const revokeRoleBatch = (payload: { role_code?: string; code?: string; user_ids: string[] }) => request("/api/rbac/revoke-batch", "POST", payload);

/** 试算角色组合是否触发 SSD/DSD。data: { ok, violations[] } */
export const checkRoleConstraints = (payload: { user_id?: string; role_codes: string[] }) => request("/api/rbac/constraints/check", "POST", payload);

/** 两角色权限差集。data: { only_left, only_right, both } */
export const diffRolePermissions = (left: string, right: string) => request("/api/roles/diff", "GET", { left, right });

export const getAccessStats = (query: any = {}) => request("/api/stats/access", "GET", compact(query));

export const getAccessLogs = (query: any = {}) => request("/api/stats/access/logs", "GET", compact(query));

export const getAccessDaily = (query: any = {}) => request("/api/stats/access/daily", "GET", compact(query));

export const getAccessUsers = (query: any = {}) => request("/api/stats/access/users", "GET", compact(query));

export const getServerStats = () => request("/api/stats/server", "GET");

export const uploadWsScreenshot = (file: Blob, requestId: string) => {
  const form = new FormData();
  form.append("file", file, "screen.jpg");
  form.append("request_id", requestId);
  return request("/api/ws/screenshots", "POST", form);
};
