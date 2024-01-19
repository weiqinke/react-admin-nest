import axios from "axios";
import { requestInterce, responseInterce } from "./axios-interceptors";
// 跨域认证信息 header 名
const xsrfHeaderName = "Authorization";
const service = axios.create();
/**接口最大响应时间** */
service.defaults.timeout = 20000;
// axios.defaults.withCredentials= true
service.defaults.withCredentials = false;
service.defaults.xsrfHeaderName = xsrfHeaderName;
service.defaults.xsrfCookieName = xsrfHeaderName;
// 加载请求拦截器
requestInterce.forEach((item) => {
  let { onFulfilled, onRejected } = item;
  if (!onFulfilled || typeof onFulfilled !== "function") {
    onFulfilled = (config) => config;
  }
  if (!onRejected || typeof onRejected !== "function") {
    onRejected = (error) => Promise.reject(error);
  }
  service.interceptors.request.use(
    (config) => onFulfilled(config),
    (error) => onRejected(error)
  );
});
// 加载响应拦截器
responseInterce.forEach((item: any) => {
  let { onFulfilled, onRejected } = item;
  if (!onFulfilled || typeof onFulfilled !== "function") {
    onFulfilled = (response) => response;
  }
  if (!onRejected || typeof onRejected !== "function") {
    onRejected = (error) => Promise.reject(error);
  }
  service.interceptors.response.use(
    (response) => onFulfilled(response),
    (error) => onRejected(error)
  );
});

/**
 * axios请求
 * @param url 请求地址
 * @param method {string} http method
 * @param params 请求参数
 * @returns {Promise<AxiosResponse<T>>}
 */
export const request = async (url, method, params = {}, options = {}) => {
  switch (method) {
    case "GET":
      return service.get(url, { params, ...options });
    case "POST":
      return service.post(url, params, { ...options });
    case "DELETE":
      return service.delete(url, { params });
    case "PUT":
      return service.put(url, params, options);
    case "PATCH":
      return service.patch(url, params, options);
    default:
      return service.get(url, { params, ...options });
  }
};
