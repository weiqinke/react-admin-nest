import {
  createPermission,
  deletePermission,
  getPermission,
  getPermissions,
  updatePermission
} from "@/api/goadmin";

export async function findPermissions() {
  const res = await getPermissions();
  const list = (res.data?.data?.list || []).map((item: any) => ({
    ...item,
    code: String(item.code),
    name: item.name || item.code
  }));
  return { ...res, data: { ...res.data, data: list } };
}

export const findPermission = (code: string) => getPermission(String(code));

export const createPermissionItem = (payload: { code: string; name: string }) =>
  createPermission({
    code: payload.code,
    name: payload.name || payload.code
  });

export const updatePermissionItem = (code: string, payload: { name: string }) =>
  updatePermission(String(code), { name: payload.name });

export const removePermissionItem = (code: string) => deletePermission(String(code));
