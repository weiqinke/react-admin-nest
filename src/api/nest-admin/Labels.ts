import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;
/**
 * 获取当前用户所有标签
 * @param payload
 * @returns
 */
export const getalllabelsbyuser = (payload: any) => {
  return request(`${BASE_URL}labels/getalllabelsbyuser`, 'get', payload);
};

//添加
export const addnewlabelbyuser = (payload: any) => {
  return request(`${BASE_URL}labels/addnewlabelbyuser`, 'post', payload);
};

//更新
export const putlabelbyuser = (payload: any) => {
  return request(`${BASE_URL}labels/putlabelbyuser`, 'put', payload);
};

//删除
export const deletelabelbyuser = (payload: any) => {
  return request(`${BASE_URL}labels/addnewlabelbyuser`, 'delete', payload);
};
