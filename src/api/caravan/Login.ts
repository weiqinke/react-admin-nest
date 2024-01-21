import { request } from "@/api/request";

const BASE_URL: string = REACT_APP_API_URL;

/** 获取菜单列表接口 */
export const getMenuList = payload => {
  return request(`${BASE_URL}user/menu`, "GET", payload);
};
/** 获取通知列表接口 */
export const getNoticeList = payload => {
  return request(`${BASE_URL}`, "GET", payload);
};
/** 获取通知列表接口 */
export const getNoticeList2 = payload => {
  return request(`${BASE_URL}`, "GET", payload);
};

/** 登录接口 */
export const apiLogin = payload => {
  return request(`${BASE_URL}user/login`, "POST", payload);
};
/** nest登录接口 */
export const accountlogin = payload => {
  return request(`${BASE_URL}user/accountlogin`, "POST", payload);
};

/** 获取通知列表接口 */
export const userTokenByOAuth2Code = payload => {
  return request(`${BASE_URL}user/userTokenByOAuth2Code`, "GET", payload);
};

/** 获取菜单接口 */
export const getUserMenus = payload => {
  return request(`${BASE_URL}menus/getUserMenus`, "get", payload);
};

/** nest获取菜单接口 */
export const GetMenuByToken = payload => {
  return request(`${BASE_URL}user/getmenubytoken`, "GET", payload);
};

/** 登出接口 */
export const apiLogout = payload => {
  return request(`${BASE_URL}user/logout`, "POST", payload);
};

/** 登录接口 */
export const GetPlanPaged = payload => {
  return request(`${BASE_URL}PlanManage/GetPlanPaged`, "POST", payload);
};

/** 注册接口 */
export const Zhuce = payload => {
  return request(`${BASE_URL}user/zhuce`, "POST", payload);
};

/** 获取所有人员 */
export const findalluser = payload => {
  return request(`${BASE_URL}user/findalluser`, "POST", payload);
};

/** 添加一个人员 */
export const addOneUser = payload => {
  return request(`${BASE_URL}user/addOneUser`, "POST", payload);
};

/** 编辑一个人员 */
export const editOneUser = payload => {
  return request(`${BASE_URL}user/editOneUser`, "POST", payload);
};

/** 切换一个人员状态 */
export const changeUserStatus = payload => {
  return request(`${BASE_URL}user/changeUserStatus`, "POST", payload);
};

/**
 * 获取登录日志
 * */
export const getAccountLog = payload => {
  return request(`${BASE_URL}user/getAccountLog`, "POST", payload);
};
/**
 * 获取我自己的信息
 * */
export const getmyuserinfo = () => {
  return request(`${BASE_URL}user/getmyuserinfo`, "POST", {});
};

/**
 * 更新我自己的信息
 * */
export const updateMyinfo = payload => {
  return request(`${BASE_URL}user/updateMyinfo`, "POST", payload);
};

/**
 * 更新我自己的信息
 * */
export const updateUserAvatarUrl = payload => {
  return request(`${BASE_URL}user/updateUserAvatarUrl`, "POST", payload, {
    processData: false
  });
};

/***
 * 获取指定时间段的登录日志
 * **/
export const findAccountLogs = (payload: any) => {
  return request(`${BASE_URL}Accountlog/findAccountLogs`, "GET", payload);
};
