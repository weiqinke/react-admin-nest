import { request } from "@/api/request";
const BASE_URL = REACT_APP_API_URL;

/**
 * 获取当前用户所有文章
 * @param payload
 * @returns
 */

export const articles = (payload: any) => {
  return request(`${BASE_URL}articles`, "get", payload);
};

export const findallarticle = (payload: any) => {
  return request(`${BASE_URL}articles/findallarticle`, "get", payload);
};
/**获取一个文章主体 */
export const onearticlebody = (payload: any) => {
  return request(`${BASE_URL}articles/onearticlebody`, "get", payload);
};
export const onearticle = (payload: any) => {
  return request(`${BASE_URL}articles/onearticle`, "post", payload);
};
