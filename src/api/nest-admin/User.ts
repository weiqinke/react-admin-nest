import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;

/** 获取菜单列表接口 */
export const getMenuList = (payload: any) => {
  return request(`${BASE_URL}user/menu`, 'GET', payload);
};
/** 获取通知列表接口 */
export const getNoticeList = (payload: any) => {
  return request(`${BASE_URL}user/notice`, 'GET', payload);
};

/** 登录接口 */
export const apiLogin = (payload: any) => {
  return request(`${BASE_URL}user/login`, 'POST', payload);
};

/** 登出接口 */
export const apiLogout = (payload: any) => {
  return request(`${BASE_URL}user/logout`, 'POST', payload);
};
