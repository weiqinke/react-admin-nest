import {
  assignRoleBatch,
  checkRoleConstraints,
  copyRole as goCopyRole,
  createRole as goCreateRole,
  deleteRole as goDeleteRole,
  diffRolePermissions,
  getPermissions,
  getRolePermissions,
  getRoleScopeDepts as goGetRoleScopeDepts,
  getRoles,
  getUsers,
  revokeRoleBatch,
  setRolePermissions,
  setRoleScopeDepts as goSetRoleScopeDepts,
  updateRole as goUpdateRole
} from "@/api/goadmin";

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
    inherits: payload.inherits,
    data_scope: payload.data_scope
  });

export const updateRole = (payload: any = {}) =>
  goUpdateRole(roleCodeOf(payload), {
    name: payload.name,
    inherits: payload.inherits,
    data_scope: payload.data_scope
  });

export const removeRole = (payload: any = {}) => goDeleteRole(roleCodeOf(payload));

async function listUsersInScope() {
  const pageSize = 100;
  const first = await getUsers({ page: 1, page_size: pageSize });
  const payload = first.data?.data || {};
  const list = [...(payload.list || [])];
  const total = Number(payload.total || list.length);
  const pages = Math.min(Math.ceil(total / pageSize) || 1, 10);
  for (let page = 2; page <= pages; page += 1) {
    const next = await getUsers({ page, page_size: pageSize });
    list.push(...(next.data?.data?.list || []));
  }
  return { first, list };
}

/** 从用户列表筛出拥有该角色的 user id。 */
export async function findRoleUsers(payload: any = {}) {
  const code = String(roleCodeOf(payload) || "");
  const { first, list } = await listUsersInScope();
  const ids = list.filter(user => (user.roles || []).map(String).includes(code)).map(user => String(user.id));
  return { ...first, data: { ...first.data, data: ids } };
}

/**
 * 按勾选结果批量 assign/revoke（走 assign-batch / revoke-batch）。
 * 失败用户落在 skipped，不中断整批。
 */
export async function updateRoleUsers(payload: any = {}) {
  const code = String(roleCodeOf(payload) || "");
  const nextIds: string[] = (payload.uids || payload.user_ids || []).map(id => String(id));
  const next = new Set<string>(nextIds);
  const users = (await listUsersInScope()).list;
  const current = users.filter(user => (user.roles || []).map(String).includes(code)).map(user => String(user.id));

  const toAssign = nextIds.filter(userId => !current.includes(userId));
  const toRevoke = current.filter(userId => !next.has(userId));
  const hours = Number(payload.hours || 0) || undefined;

  let assigned = 0;
  let revoked = 0;
  const failures: { user_id: string; action: "assign" | "revoke"; code: number; message: string }[] = [];

  if (toAssign.length) {
    const res = await assignRoleBatch({ role_code: code, user_ids: toAssign, hours });
    const data = res.data?.data || {};
    assigned = (data.assigned || []).length;
    for (const userId of data.skipped || []) {
      failures.push({ user_id: String(userId), action: "assign", code: 0, message: "授予跳过（可能已拥有或互斥）" });
    }
  }

  if (toRevoke.length) {
    const res = await revokeRoleBatch({ role_code: code, user_ids: toRevoke });
    const data = res.data?.data || {};
    revoked = (data.revoked || []).length;
    for (const userId of data.skipped || []) {
      failures.push({ user_id: String(userId), action: "revoke", code: 0, message: "撤销跳过" });
    }
  }

  return {
    data: {
      code: 0,
      message: "ok",
      data: {
        assigned,
        revoked,
        failures,
        conflictCount: failures.filter(item => /互斥|40902/.test(item.message)).length,
        roles: nextIds
      }
    },
    status: 200
  };
}

export const previewRoleDiff = (left: string, right: string) => diffRolePermissions(left, right);

export const previewRoleConstraints = (payload: { user_id?: string; role_codes: string[] }) => checkRoleConstraints(payload);

/** 角色直接绑定的权限码。 */
export async function findRolePermissions(payload: any = {}) {
  const res = await getRolePermissions(roleCodeOf(payload));
  const data = res.data?.data || {};
  const permission_codes = (data.permission_codes || data.list || data.permissions || []).map((code: string) => String(code));
  return { ...res, data: { ...res.data, data: { permission_codes } } };
}

export const saveRolePermissions = (payload: any = {}) => {
  const codes = (payload.permission_codes || payload.mids || payload.menus || []).map(code => String(code));
  return setRolePermissions(roleCodeOf(payload), codes);
};

export const giveRoleMenus = (payload: any = {}) => {
  const codes = (payload.menus || payload.permission_codes || []).map(code => String(code));
  return setRolePermissions(payload.roleCode || payload.code, codes);
};

/** 全量权限码候选项（供角色授权弹窗）。 */
export async function findPermissionOptions() {
  const res = await getPermissions();
  const list = (res.data?.data?.list || []).map(item => ({
    code: String(item.code),
    name: item.name ? `${item.name} (${item.code})` : String(item.code)
  }));
  return { ...res, data: { ...res.data, data: list } };
}

export const copyRole = (sourceCode: string, payload: { code: string; name: string }) => goCopyRole(sourceCode, payload);

export const getRoleScopeDepts = (code: string) => goGetRoleScopeDepts(code);

export const setRoleScopeDepts = (code: string, department_ids: string[]) => goSetRoleScopeDepts(code, department_ids);
