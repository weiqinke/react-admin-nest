import { request } from "@/api/request";

const BASE_URL = REACT_APP_API_URL;

/** 用户登录 */
export const login = (payload: any) => {
  return request(`${BASE_URL}user/login`, "POST", payload);
};

/** 用户注册 */
export const register = (payload: any) => {
  return request(`${BASE_URL}user/register`, "POST", payload);
};

/** nest用户菜单接口 */
export const userMenus = (payload: any) => {
  return request(`${BASE_URL}user/menus`, "GET", payload);
};

/** 创建一个用户 */
export const createUser = payload => {
  return request(`${BASE_URL}user/create`, "POST", payload);
};

/** 获取所有用户 */
export const findUsers = payload => {
  return request(`${BASE_URL}user/findall`, "GET", payload);
};

/** 更新用户 */
export const updateUser = (payload: any) => {
  return request(`${BASE_URL}user/update`, "POST", payload);
};

/** 获取用户信息 */
export const userinfo = (payload: any) => {
  return request(`${BASE_URL}user/userinfo`, "GET", payload);
};

/** OAuth2 获取code */
export const userOAuth2 = payload => {
  return request(`${BASE_URL}user/oauth2`, "POST", payload);
};
