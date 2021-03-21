import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;

/** nest获取所有角色接口 */
export const getallrole = (payload: any) => {
  return request(`${BASE_URL}role/getallrole`, 'get', payload);
};

/** nest添加角色接口 */
export const addrole = (payload: any) => {
  return request(`${BASE_URL}role/addrole`, 'post', payload);
};

/** nest更新角色接口 */
export const updaterole = (payload: any) => {
  return request(`${BASE_URL}role/updaterole`, 'post', payload);
};

/** nest禁用角色接口 */
export const deleterole = (payload: any) => {
  return request(`${BASE_URL}role/deleterole`, 'post', payload);
};

/** nest角色接口 */
export const getUsersByRoleCode = (payload: any) => {
  return request(`${BASE_URL}role/getUsersByRoleCode`, 'post', payload);
};


/** nest角色分配人接口 */
export const giveUser = (payload: any) => {
  return request(`${BASE_URL}role/giveUser`, 'post', payload);
};

