import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;

/** 获取消息接口 */
export const getallnotices = () => {
  return request(`${BASE_URL}notices/getallnotices`, 'get', {});
};
/** 发送消息接口 */
export const sendToOne = (payload: any) => {
  return request(`${BASE_URL}notices/sendToOne`, 'post', payload);
};
/** 获取我的消息 */
export const getUidNotices = () => {
  return request(`${BASE_URL}notices/getUidNotices`, 'get', {});
};
