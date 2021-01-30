import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;

/** 获取用户权限接口 */
export const apiGetRoleList = (payload: any) => {
  return request(`${BASE_URL}permission/role`, 'GET', payload);
};
