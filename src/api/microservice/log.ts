import { request } from "@/api/request";

const BASE_URL = REACT_APP_API_URL;

/** 获取用户登录日志 */
export const loginlog = (payload: any) => {
  return request(`${BASE_URL}logs/loginlog`, "GET", payload);
};

/** 获取用户消息 */
export const userNotice = (payload: any) => {
  return request(`${BASE_URL}logs/userNotice`, "GET", payload);
};

/** 获取用户未读通知 */
export const userPlacard = (payload: any) => {
  return request(`${BASE_URL}logs/placard/user`, "GET", payload);
};

/** 获取所有通知 */
export const getPlacard = (payload: any) => {
  return request(`${BASE_URL}logs/placard`, "GET", payload);
};

/** 创建通知 */
export const createPlacard = (payload: any) => {
  return request(`${BASE_URL}logs/placard/create`, "POST", payload);
};

/** 更新通知 */
export const updatePlacard = (payload: any) => {
  return request(`${BASE_URL}logs/placard/update`, "POST", payload);
};

/** 推送通知 */
export const pushPlacard = (payload: any) => {
  return request(`${BASE_URL}logs/placard/push`, "POST", payload);
};

/** 推送通知 */
export const submitPlacard = (payload: any) => {
  return request(`${BASE_URL}logs/placard/submit`, "POST", payload);
};

/** 接口调用数量 */
export const apiCount = (payload: any) => {
  return request(`${BASE_URL}logs/apicount`, "GET", payload);
};
