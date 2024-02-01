import { request } from "@/api/request";

const BASE_URL = REACT_APP_API_URL;

/** 获取所有菜单 */
export const menuFind = (payload: any) => {
  return request(`${BASE_URL}menu/find`, "GET", payload);
};

/** 添加菜单 */
export const createMenuItem = (payload: any) => {
  return request(`${BASE_URL}menu/create`, "POST", payload);
};

/**修改菜单属性 */
export const updateMenuItem = (payload: any) => {
  return request(`${BASE_URL}menu/update`, "POST", payload);
};
