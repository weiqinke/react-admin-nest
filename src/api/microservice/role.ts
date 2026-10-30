import {
  assignRole,
  createRole as goCreateRole,
  deleteRole as goDeleteRole,
  getPermissions,
  getRolePermissions,
  getRoles,
  getUsers,
  revokeRole,
  setRolePermissions,
  updateRole as goUpdateRole
} from "@/api/goadmin";

function roleCodeOf(payload: any = {}) {
  return payload.code || payload.roleCode || payload.role_code || payload.id;
}

function bizCode(err: any) {
  return Number(err?.code ?? err?.data?.code ?? 0);
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

export const removeRole = (payload: any = {}) => goDeleteRole(roleCodeOf(payload));

/** 从用户列表筛出拥有该角色的 user id。 */
export async function findRoleUsers(payload: any = {}) {
  const code = String(roleCodeOf(payload) || "");
  const res = await getUsers();
  const list = (res.data?.data?.list || []).filter(user => (user.roles || []).map(String).includes(code)).map(user => String(user.id));
  return { ...res, data: { ...res.data, data: list } };
}

/**
 * 按勾选结果批量 assign/revoke。
 * 40902（角色互斥）不中断整批，汇总到 failures。
 */
export async function updateRoleUsers(payload: any = {}) {
  const code = String(roleCodeOf(payload) || "");
  const nextIds: string[] = (payload.uids || payload.user_ids || []).map(id => String(id));
  const next = new Set<string>(nextIds);
  const users = (await getUsers()).data?.data?.list || [];
  const current = users.filter(user => (user.roles || []).map(String).includes(code)).map(user => String(user.id));

  const failures: { user_id: string; action: "assign" | "revoke"; code: number; message: string }[] = [];
  let assigned = 0;
  let revoked = 0;
  const opts = { skipErrorMessage: true };

  for (const userId of nextIds) {
    if (current.includes(userId)) continue;
    try {
      await assignRole({ user_id: userId, role_code: code }, opts);
      assigned += 1;
    } catch (err: any) {
      failures.push({
        user_id: userId,
        action: "assign",
        code: bizCode(err),
        message: err?.message || "授予失败"
      });
    }
  }

  for (const userId of current) {
    if (next.has(userId)) continue;
    try {
      await revokeRole({ user_id: userId, role_code: code }, opts);
      revoked += 1;
    } catch (err: any) {
      failures.push({
        user_id: userId,
        action: "revoke",
        code: bizCode(err),
        message: err?.message || "撤销失败"
      });
    }
  }

  const conflictCount = failures.filter(item => item.code === 40902).length;
  return {
    data: {
      code: 0,
      message: "ok",
      data: {
        assigned,
        revoked,
        failures,
        conflictCount,
        roles: nextIds
      }
    },
    status: 200
  };
}

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

/** 全量权限码候选项（供角色授权弹窗）。 */
export async function findPermissionOptions() {
  const res = await getPermissions();
  const list = (res.data?.data?.list || []).map(item => ({
    code: String(item.code),
    name: item.name ? `${item.name} (${item.code})` : String(item.code)
  }));
  return { ...res, data: { ...res.data, data: list } };
}
