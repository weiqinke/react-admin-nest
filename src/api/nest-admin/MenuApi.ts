import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;

/** 获取菜单接口 */
export const getAllMenusItem = () => {
  return request(`${BASE_URL}menus/getAllMenus`, 'get', {});
};

/** 添加菜单接口 */
export const addMenuItem = (payload: any) => {
  return request(`${BASE_URL}menus/addMenuItem`, 'post', payload);
};
