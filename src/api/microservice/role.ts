import { assignRole, createRole as goCreateRole, getRolePermissions, getRoles, getUsers, revokeRole, setRolePermissions, updateRole as goUpdateRole } from "@/api/goadmin";

function roleCodeOf(payload: any = {}) {
  return payload.code || payload.roleCode || payload.role_code || payload.id;
}

export async function findRoles() {
  const res = await getRoles();
  return { ...res, data: { ...res.data, data: res.data?.data?.list || [] } };
}

export const createRole = (payload: any = {}) =>
  goCreateRole({
    code: payload.code || payload.name,
    name: payload.name,
    inherits: payload.inherits
  });

export const updateRole = (payload: any = {}) =>
  goUpdateRole(roleCodeOf(payload), {
    name: payload.name,
    inherits: payload.inherits
  });

export async function findRoleUsers(payload: any = {}) {
  const code = roleCodeOf(payload);
  const res = await getUsers();
  const list = (res.data?.data?.list || []).filter(user => (user.roles || []).includes(code)).map(user => user.id);
  return { ...res, data: { ...res.data, data: list } };
}

export async function updateRoleUsers(payload: any = {}) {
  const code = String(roleCodeOf(payload) || "");
  const nextIds: string[] = (payload.uids || payload.user_ids || []).map(id => String(id));
  const next = new Set<string>(nextIds);
  const users = (await getUsers()).data?.data?.list || [];
  const current = users.filter(user => (user.roles || []).includes(code)).map(user => String(user.id));
  for (const userId of nextIds) {
    if (!current.includes(userId)) await assignRole({ user_id: userId, role_code: code });
  }
  for (const userId of current) {
    if (!next.has(userId)) await revokeRole({ user_id: userId, role_code: code });
  }
  return { data: { code: 0, message: "ok", data: { user_id: "", roles: nextIds } }, status: 200 };
}

export async function findRoleMenus(payload: any = {}) {
  const res = await getRolePermissions(roleCodeOf(payload));
  const data = res.data?.data || {};
  const list = data.list || data.permissions || [];
  return { ...res, data: { ...res.data, data: list } };
}

export const updateRoleMenus = (payload: any = {}) => {
  const codes = (payload.mids || payload.menus || payload.permission_codes || []).map(code => String(code));
  return setRolePermissions(roleCodeOf(payload), codes);
};
