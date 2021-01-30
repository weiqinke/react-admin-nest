import axios from 'axios';
import Cookie from 'js-cookie';
import { responseInterce, requestInterce } from './axios-interceptors';
// 跨域认证信息 header 名
const xsrfHeaderName = 'Authorization';
/**接口最大响应时间** */
axios.defaults.timeout = 20000;
// axios.defaults.withCredentials= true
axios.defaults.withCredentials = false;
axios.defaults.xsrfHeaderName = xsrfHeaderName;
axios.defaults.xsrfCookieName = xsrfHeaderName;
// 加载请求拦截器
requestInterce.forEach((item: any, options: any = {}) => {
  let { onFulfilled, onRejected } = item;
  if (!onFulfilled || typeof onFulfilled !== 'function') {
    onFulfilled = (config: any) => config;
  }
  if (!onRejected || typeof onRejected !== 'function') {
    onRejected = (error: any) => Promise.reject(error);
  }
  axios.interceptors.request.use(
    config => onFulfilled(config, options),
    error => onRejected(error, options)
  );
});
// 加载响应拦截器
responseInterce.forEach((item: any) => {
  let { onFulfilled, onRejected } = item;
  if (!onFulfilled || typeof onFulfilled !== 'function') {
    onFulfilled = (response: any) => response;
  }
  if (!onRejected || typeof onRejected !== 'function') {
    onRejected = (error: any) => Promise.reject(error);
  }
  axios.interceptors.response.use(
    response => onFulfilled(response),
    error => onRejected(error)
  );
});
// 认证类型
export const AUTH_TYPE = {
  BEARER: 'Bearer',
  BASIC: 'basic',
  AUTH1: 'auth1',
  AUTH2: 'auth2'
};

// http method
export const METHOD = {
  GET: 'get',
  POST: 'post',
  DELETE: 'delete',
  PUT: 'put',
  PATCH: 'patch'
};

/**
 * axios请求
 * @param url 请求地址
 * @param method {METHOD} http method
 * @param params 请求参数
 * @returns {Promise<AxiosResponse<T>>}
 */
export const request = async (url: string, method: string, params: any, options?: any) => {
  switch (method) {
    case METHOD.GET:
      return axios.get(url, { params });
    case METHOD.POST:
      return axios.post(url, params, { ...options });
    case METHOD.DELETE:
      return axios.delete(url, { params });
    case METHOD.PUT:
      return axios.put(url, params);
    case METHOD.PATCH:
      return axios.patch(url, params);
    default:
      return axios.get(url, { params });
  }
};

/**
 * 设置认证信息
 * @param auth {Object}
 * @param authType {AUTH_TYPE} 认证类型，默认：{AUTH_TYPE.BEARER}
 */
export function setAuthorization(auth: any, authType = AUTH_TYPE.BEARER) {
  switch (authType) {
    case AUTH_TYPE.BEARER:
      Cookie.set(xsrfHeaderName, 'Bearer ' + auth.token, { expires: auth.expireAt });
      break;
    case AUTH_TYPE.BASIC:
    case AUTH_TYPE.AUTH1:
    case AUTH_TYPE.AUTH2:
    default:
      break;
  }
}

/**
 * 移出认证信息
 * @param authType {AUTH_TYPE} 认证类型
 */
export function removeAuthorization(authType = AUTH_TYPE.BEARER) {
  switch (authType) {
    case AUTH_TYPE.BEARER:
      Cookie.remove(xsrfHeaderName);
      break;
    case AUTH_TYPE.BASIC:
    case AUTH_TYPE.AUTH1:
    case AUTH_TYPE.AUTH2:
    default:
      break;
  }
}

/**
 * 检查认证信息
 * @param authType
 * @returns {boolean}
 */
export function checkAuthorization(authType = AUTH_TYPE.BEARER) {
  switch (authType) {
    case AUTH_TYPE.BEARER:
      if (Cookie.get(xsrfHeaderName)) {
        return true;
      }
      break;
    case AUTH_TYPE.BASIC:
    case AUTH_TYPE.AUTH1:
    case AUTH_TYPE.AUTH2:
    default:
      break;
  }
  return false;
}

/**
 * 加载 axios 拦截器
 * @param interceptors
 * @param options
 */
export const loadInterceptors = (interceptors: any, options: any) => {
  // 加载请求拦截器
  requestInterce.forEach((item: any) => {
    let { onFulfilled, onRejected } = item;
    if (!onFulfilled || typeof onFulfilled !== 'function') {
      onFulfilled = (config: any) => config;
    }
    if (!onRejected || typeof onRejected !== 'function') {
      onRejected = (error: any) => Promise.reject(error);
    }
    axios.interceptors.request.use(
      config => onFulfilled(config, options),
      error => onRejected(error, options)
    );
  });
  // 加载响应拦截器
  responseInterce.forEach((item: any) => {
    let { onFulfilled, onRejected } = item;
    if (!onFulfilled || typeof onFulfilled !== 'function') {
      onFulfilled = (response: any) => response;
    }
    if (!onRejected || typeof onRejected !== 'function') {
      onRejected = (error: any) => Promise.reject(error);
    }
    axios.interceptors.response.use(
      response => onFulfilled(response, options),
      error => onRejected(error, options)
    );
  });
};

/**
 * 解析 url 中的参数
 * @param url
 * @returns {Object}
 */
export function parseUrlParams(url: string) {
  const params: any = {};
  if (!url || url === '' || typeof url !== 'string') {
    return params;
  }
  const paramsStr = url.split('?')[1];
  if (!paramsStr) {
    return params;
  }
  const paramsArr = paramsStr.replace(/&|=/g, ' ').split(' ');
  for (let i = 0; i < paramsArr.length / 2; i++) {
    const value = paramsArr[i * 2 + 1];
    params[paramsArr[i * 2]] = value === 'true' ? true : value === 'false' ? false : value;
  }
  return params;
}
