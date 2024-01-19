import { request } from "@/api/request";

const BASE_URL = REACT_APP_API_URL;

/** 获取系统通知接口 */
export const findLastTypePlacard = (payload: any) => {
  return request(`${BASE_URL}placard/findLastTypePlacard`, "GET", payload);
};

/** 获取系统通知列表接口 */
export const getPlacardListByType = (payload: any) => {
  return request(`${BASE_URL}placard/getPlacardListByType`, "GET", payload);
};

/** 获取所有公告和通知 */
export const getAllPlacard = (payload: any) => {
  return request(`${BASE_URL}placard/getAllPlacard`, "GET", payload);
};

/** 添加一个公告 */
export const addPlacard = (payload: any) => {
  return request(`${BASE_URL}placard/addPlacard`, "POST", payload);
};
/** 发布一个公告 */
export const broadcastPlacard = (payload: any) => {
  return request(`${BASE_URL}placard/broadcastPlacard`, "POST", payload);
};

/** 已读一个公告 */
export const readOnePlacard = (payload: any) => {
  return request(`${BASE_URL}placard/readOnePlacard`, "PUT", payload);
};

/** 删除一个公告 */
export const deleteOnePlacard = (payload: any) => {
  return request(`${BASE_URL}placard`, "DELETE", payload);
};
