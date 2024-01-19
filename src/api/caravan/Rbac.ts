import { request } from "@/api/request";

const BASE_URL = REACT_APP_API_URL;

/** nest获取所有角色接口 */
export const getallrole = (payload: any) => {
  return request(`${BASE_URL}role/getallrole`, "GET", payload);
};

/** nest添加角色接口 */
export const addrole = (payload: any) => {
  return request(`${BASE_URL}role/addrole`, "POST", payload);
};

/** nest更新角色接口 */
export const updaterole = (payload: any) => {
  return request(`${BASE_URL}role/updaterole`, "POST", payload);
};

/** nest禁用角色接口 */
export const deleterole = (payload: any) => {
  return request(`${BASE_URL}role/deleterole`, "POST", payload);
};

/** nest角色接口 */
export const getUsersByRoleCode = (payload: any) => {
  return request(`${BASE_URL}role/getUsersByRoleCode`, "POST", payload);
};

/** nest角色接口 */
export const getMenusByRoleCode = (payload: any) => {
  return request(`${BASE_URL}role/getMenusByRoleCode`, "POST", payload);
};

/** nest角色分配人接口 */
export const giveUser = (payload: any) => {
  return request(`${BASE_URL}role/giveUser`, "POST", payload);
};

/** nest角色分配人接口 */
export const giveRoleMenus = (payload: any) => {
  return request(`${BASE_URL}role/giveRoleMenus`, "POST", payload);
};

/** nest角色分配人接口 */
export const findAllMenu = (payload: any) => {
  return request(`${BASE_URL}role/findAllMenu`, "POST", payload);
};
