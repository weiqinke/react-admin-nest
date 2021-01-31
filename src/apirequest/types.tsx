import { Interceptors } from './AxiosInterceptorManager';
import { CancelToken } from './cancel';

export type Methods =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'delete'
  | 'DELETE'
  | 'options'
  | 'OPTIONS'
  | 'patch'
  | 'PATCH';

// interface PlainObject {
//   [name: string]: any
// }

export interface AxiosRequestConfig {
  baseURL?: string;
  url?: string;
  method?: Methods;
  params?: any;
  // params: Record<string, any>;
  headers?: Record<string, any>;
  data?: Record<string, any>;
  timeout?: number;
  transformRequest?: (data: any, headers: any) => any;
  transformResponse?: (data: any) => any;
  cancelToken?: Promise<any>;
}

export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers?: Record<string, any>;
  config?: AxiosRequestConfig;
  request?: XMLHttpRequest;
}

// T表示promise变成功态的resolve的值resolve(value)
export interface AxiosInstance {
  <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  interceptors: Interceptors;
  defaults: AxiosRequestConfig;
  CancelToken: CancelToken;
  isCancel(value: any): boolean;
  get<T, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
}
