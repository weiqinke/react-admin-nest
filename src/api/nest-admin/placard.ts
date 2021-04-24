import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;

/** 获取系统通知接口 */
export const findLastTypePlacard = (payload: any) => {
  return request(`${BASE_URL}placard/findLastTypePlacard`, 'GET', payload);
};

/** 获取系统通知列表接口 */
export const findLastTypePlacardList = (payload: any) => {
  return request(`${BASE_URL}placard/findLastTypePlacardList`, 'GET', payload);
};

/** 管理所有公告 */
export const findAllTypePlacardList = (payload: any) => {
  return request(`${BASE_URL}placard/findAllTypePlacardList`, 'get', payload);
};
/** 添加一个公告 */
export const addPlacard = (payload: any) => {
  return request(`${BASE_URL}placard/addPlacard`, 'post', payload);
};
/** 发布一个公告 */
export const broadcastPlacard = (payload: any) => {
  return request(`${BASE_URL}placard/broadcastPlacard`, 'post', payload);
};

/** 已读一个公告 */
export const readOnePlacard = (payload: any) => {
  return request(`${BASE_URL}placard/readOnePlacard`, 'put', payload);
};
