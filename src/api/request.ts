import axios from "axios";
import { attachInterceptors } from "./axios-interceptors";

const service = axios.create({
  baseURL: REACT_APP_API_URL,
  timeout: 20000,
  withCredentials: false,
  validateStatus: () => true
});

attachInterceptors(service);

/**
 * axios 请求。成功时响应体仍是 { code, message, data }，code === 0。
 * 业务失败会 reject，error.code 为业务错误码。
 */
export const request = async (url, method, params = {}, options: any = {}) => {
  const verb = String(method || "GET").toUpperCase();
  switch (verb) {
    case "GET":
      return service.get(url, { params, ...options });
    case "POST":
      return service.post(url, params, { ...options });
    case "DELETE":
      return service.delete(url, { params, ...options });
    case "PUT":
      return service.put(url, params, options);
    case "PATCH":
      return service.patch(url, params, options);
    default:
      return service.get(url, { params, ...options });
  }
};
