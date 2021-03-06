import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;

/***
 * 获取指定时间段的登录日志
 * **/
export const findalllogs = (payload: any) => {
  return request(`${BASE_URL}Accountlog/findalllogs`, 'post', payload);
};

/***
 * 获取指定时间段的登录日志地址信息
 * **/
export const updateAllIpAddrs = () => {
  return request(`${BASE_URL}Accountlog/updateAllIpAddrs`, 'get', {});
};
