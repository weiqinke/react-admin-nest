import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;

/** nest获取所有角色接口 */
export const GetAllRole = (payload: any) => {
  return request(`${BASE_URL}role/getallrole`, 'get', payload);
};

/** nest获取所有角色接口 */
export const addrole = (payload: any) => {
  return request(`${BASE_URL}role/addrole`, 'post', payload);
};
