import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;

/** 获取菜单接口 */
export const getallnotices = () => {
  return request(`${BASE_URL}notices/getallnotices`, 'get', {});
};
