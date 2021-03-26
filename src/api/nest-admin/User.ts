import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;
/** 获取菜单列表接口 */
export const getMenuList = (payload: any) => {
  return request(`${BASE_URL}user/menu`, 'GET', payload);
};
/** 获取通知列表接口 */
export const getNoticeList = (payload: any) => {
  return request(`${BASE_URL}`, 'GET', payload);
};
/** 获取通知列表接口 */
export const getNoticeList2 = (payload: any) => {
  return request(`${BASE_URL}`, 'GET', payload);
};

/** 登录接口 */
export const apiLogin = (payload: any) => {
  return request(`${BASE_URL}user/login`, 'POST', payload);
};
/** nest登录接口 */
export const Account = (payload: any) => {
  return request(`${BASE_URL}user/account`, 'post', payload);
};

/** nest获取菜单接口 */
export const GetMenuByToken = (payload: any) => {
  return request(`${BASE_URL}user/getmenubytoken`, 'get', payload);
};

/** 登出接口 */
export const apiLogout = (payload: any) => {
  return request(`${BASE_URL}user/logout`, 'POST', payload);
};

/** 登录接口 */
export const GetPlanPaged = (payload: any) => {
  return request(`${BASE_URL}PlanManage/GetPlanPaged`, 'post', payload);
};

/** 注册接口 */
export const Zhuce = (payload: any) => {
  return request(`${BASE_URL}user/zhuce`, 'post', payload);
};

/** 获取所有人员 */
export const findalluser = (payload: any) => {
  return request(`${BASE_URL}user/findalluser`, 'post', payload);
};

/** 添加一个人员 */
export const addOneUser = (payload: any) => {
  return request(`${BASE_URL}user/addOneUser`, 'post', payload);
};

/** 编辑一个人员 */
export const editOneUser = (payload: any) => {
  return request(`${BASE_URL}user/editOneUser`, 'post', payload);
};

/** 切换一个人员状态 */
export const changeUserStatus = (payload: any) => {
  return request(`${BASE_URL}user/changeUserStatus`, 'post', payload);
};

/** 获取登录日志 */
export const getAccountLog = (payload: any) => {
  return request(`${BASE_URL}user/getAccountLog`, 'post', payload);
};
/** 获取我自己的信息 */
export const getmyuserinfo = () => {
  return request(`${BASE_URL}user/getmyuserinfo`, 'post', {});
};

/** 更新我自己的信息 */
export const updateMyinfo = (payload: any) => {
  return request(`${BASE_URL}user/updateMyinfo`, 'post', payload);
};
