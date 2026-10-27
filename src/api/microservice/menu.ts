import { createPermission, getPermissions, updatePermission } from "@/api/goadmin";
import { removedApi } from "@/api/removed";

/** goadmin 不做菜单树。这里把权限码铺成扁平树，供角色授权页使用。 */
export async function menuFind() {
  const res = await getPermissions();
  const list = (res.data?.data?.list || []).map(item => ({
    id: item.code,
    key: item.code,
    value: item.code,
    name: item.name ? `${item.name} (${item.code})` : item.code,
    title: item.name ? `${item.name} (${item.code})` : item.code,
    parentUid: 0,
    sort: 0
  }));
  return { ...res, data: { ...res.data, data: list } };
}

export const createMenuItem = (payload: any = {}) => {
  const code = payload.code || payload.url || payload.name;
  if (!code) return removedApi("菜单");
  return createPermission({ code, name: payload.name || code });
};

export const updateMenuItem = (payload: any = {}) => {
  const code = payload.code || payload.id;
  if (!code || !payload.name) return removedApi("菜单");
  return updatePermission(String(code), { name: payload.name });
};
