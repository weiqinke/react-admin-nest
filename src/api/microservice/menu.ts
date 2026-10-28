import {
  createMenu,
  deleteMenu,
  getMenuPermissions,
  getMenus,
  getMyMenus,
  getPermissions,
  setMenuPermissions,
  updateMenu,
  updateMenuStatus
} from "@/api/goadmin";

/** 角色授权页仍用权限码扁平列表（非菜单树）。 */
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

/** 管理端菜单树；失败时回退到当前用户菜单树。 */
export async function findAdminMenus() {
  try {
    const res = await getMenus();
    if (res.data?.code === 0) {
      const list = res.data?.data?.list || [];
      return { ...res, data: { ...res.data, data: list } };
    }
  } catch {
    // fall through
  }
  const fallback = await getMyMenus();
  const list = fallback.data?.data?.list || [];
  return { ...fallback, data: { ...fallback.data, data: list } };
}

export const createMenuItem = (payload: Record<string, any> = {}) => {
  const body: Record<string, any> = {
    title: payload.title,
    segment: payload.segment,
    icon: payload.icon ?? "",
    remark: payload.remark ?? "",
    sort: Number(payload.sort ?? 0),
    is_hot: Number(payload.is_hot ?? 0),
    has_update: Number(payload.has_update ?? 0),
    visible_in_menu: Number(payload.visible_in_menu ?? 1)
  };
  if (payload.parent_id != null && payload.parent_id !== "") {
    body.parent_id = String(payload.parent_id);
  }
  if (Array.isArray(payload.permission_codes)) {
    body.permission_codes = payload.permission_codes;
  }
  return createMenu(body);
};

export const updateMenuItem = (id: string, payload: Record<string, any> = {}) => {
  const body: Record<string, any> = {};
  for (const key of ["title", "segment", "icon", "remark", "sort", "is_hot", "has_update", "visible_in_menu"] as const) {
    if (payload[key] !== undefined) body[key] = payload[key];
  }
  if (body.sort != null) body.sort = Number(body.sort);
  if (body.is_hot != null) body.is_hot = Number(body.is_hot);
  if (body.has_update != null) body.has_update = Number(body.has_update);
  if (body.visible_in_menu != null) body.visible_in_menu = Number(body.visible_in_menu);
  return updateMenu(String(id), body);
};

export const setMenuItemStatus = (id: string, status: 0 | 1) => updateMenuStatus(String(id), status);

export const deleteMenuItem = (id: string) => deleteMenu(String(id));

export async function findMenuPermissions(id: string) {
  const res = await getMenuPermissions(String(id));
  const data = res.data?.data || {};
  const permission_codes = data.permission_codes || data.list || [];
  return { ...res, data: { ...res.data, data: { permission_codes } } };
}

export const saveMenuPermissions = (id: string, permission_codes: string[] = []) =>
  setMenuPermissions(String(id), permission_codes.map(code => String(code)));
