import { request } from "@/api/request";

const BASE_URL = process.env.REACT_APP_API_URL;

/** 获取菜单接口 */
export const getUserMenus = () => {
  return request(`${BASE_URL}menus/getUserMenus`, 'GET', {});
};

/** 添加菜单接口 */
export const addMenuItem = (payload: any) => {
  return request(`${BASE_URL}menus/addMenuItem`, 'POST', payload);
};

/** 编辑菜单接口 */
export const editMenuItem = (payload: any) => {
  return request(`${BASE_URL}menus/editMenuItem`, 'POST', payload);
};

/** 删除菜单接口 */
export const delMenuItem = (payload: any) => {
  return request(`${BASE_URL}menus/delMenuItem`, 'POST', payload);
};

/** 删除菜单接口 */
export const getAllMenus = (payload) => {
  return request(`${BASE_URL}menus/getAllMenus`, 'GET', payload);
};
