import { assignRole, createRole, deleteRole, getRolePermissions, getRoles, revokeRole, setRolePermissions, updateRole } from "@/api/goadmin";
import { removedApi } from "@/api/removed";

export const getallrole = () => getRoles();

export const addrole = payload => createRole(payload);

export const updaterole = (payload: any = {}) => {
  if (payload && Object.prototype.hasOwnProperty.call(payload, "banned") && !payload.name) {
    return removedApi("角色启用/禁用");
  }
  return updateRole(payload.code || payload.id, { name: payload.name, inherits: payload.inherits });
};

export const deleterole = (payload: any = {}) => deleteRole(payload.code || payload.id);

export const getUsersByRoleCode = () => removedApi("按角色查用户");

export const getMenusByRoleCode = (payload: any = {}) => getRolePermissions(payload.code || payload.roleCode);

export const giveUser = (payload: any = {}) => {
  if (payload.revoke) return revokeRole({ user_id: String(payload.user_id), role_code: payload.role_code });
  return assignRole({ user_id: String(payload.user_id || payload.uid), role_code: payload.role_code || payload.roleCode });
};

export const giveRoleMenus = (payload: any = {}) => {
  const codes = (payload.menus || payload.permission_codes || []).map(code => String(code));
  return setRolePermissions(payload.roleCode || payload.code, codes);
};

export const findAllMenu = () => removedApi("菜单");

export const roleMenu = () => removedApi("菜单");
