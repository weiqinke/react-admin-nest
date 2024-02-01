import { request } from "@/api/request";

const BASE_URL = REACT_APP_API_URL;

/** 获取所有角色 */
export const findRoles = (payload: any) => {
  return request(`${BASE_URL}role/findRoles`, "GET", payload);
};

/** 创建角色 */
export const createRole = payload => {
  return request(`${BASE_URL}role/create`, "POST", payload);
};

/** 更新角色 */
export const updateRole = payload => {
  return request(`${BASE_URL}role/updateRole`, "POST", payload);
};

/** 获取角色下的人员 */
export const findRoleUsers = payload => {
  return request(`${BASE_URL}role/findRoleUsers`, "GET", payload);
};

/** 更新角色下的人员 */
export const updateRoleUsers = payload => {
  return request(`${BASE_URL}role/user/update`, "POST", payload);
};

/** 获取角色下的菜单 */
export const findRoleMenus = payload => {
  return request(`${BASE_URL}role/menu`, "GET", payload);
};

/** 更新角色下的菜单 */
export const updateRoleMenus = payload => {
  return request(`${BASE_URL}role/menu/update`, "POST", payload);
};
