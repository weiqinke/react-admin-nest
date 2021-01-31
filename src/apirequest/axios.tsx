import { AxiosRequestConfig, AxiosResponse } from './types';
import AxiosInterceptorManager, { Interceptor, Interceptors } from './AxiosInterceptorManager';
import qs from 'qs';
import parseHeaders from 'parse-headers';

// merge options
const defaults: AxiosRequestConfig = {
  method: 'get',
  timeout: 20000,
  headers: {
    common: {
      // 针对所有的请求生效
      // accept: 'application/json', // 指定服务器返回 JSON 格式的数据
      // name: 'Stella'
    }
  }
};

let getStyleMethods = ['get', 'head', 'delete', 'options'];
let postStyleMethods = ['put', 'post', 'patch'];
getStyleMethods.forEach((method: string) => (defaults.headers![method] = {}));
postStyleMethods.forEach((method: string) => (defaults.headers![method] = { 'Content-Type': 'application/json' }));
const allMethods = [...getStyleMethods, ...postStyleMethods];

export default class Axios<T> {
  public defaults: AxiosRequestConfig = defaults;
  public interceptors: Interceptors = {
    request: new AxiosInterceptorManager<AxiosRequestConfig>(),
    response: new AxiosInterceptorManager<AxiosResponse<T>>()
  };

  request<T>(config: AxiosRequestConfig): Promise<AxiosRequestConfig | AxiosResponse<T>> {
    config.headers = Object.assign(this.defaults.headers, config.headers);
    if (config.transformRequest && config.data) {
      config.data = config.transformRequest(config.data, config.headers);
    }
    const chain: Interceptor[] = [
      {
        onFulfilled: this.dispatchRequest,
        onRejected: undefined
      }
    ];
    this.interceptors.request.interceptors.forEach(interceptor => {
      interceptor && chain.unshift(interceptor);
    });
    this.interceptors.response.interceptors.forEach(interceptor => {
      interceptor && chain.push(interceptor);
    });

    let promise = Promise.resolve(config);

    while (chain.length) {
      let { onFulfilled, onRejected } = chain.shift()!;
      promise = promise.then(onFulfilled, onRejected);
    }

    return promise;
  }

  dispatchRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return new Promise<AxiosResponse<T>>((resolve, reject) => {
      let { method = 'get', url, params, data, headers, timeout = 0 } = config;
      let request = new XMLHttpRequest();
      if (params && typeof params == 'object') {
        params = qs.stringify(params);
        url += (url!.indexOf('?') === -1 ? '?' : '&') + params;
      }
      request.open(method, url!, true);
      request.responseType = 'json';
      request.onreadystatechange = function() {
        // h5 API request.onload readystate = 4 status = 200
        if (request.readyState === 4 && request.status !== 0) {
          if (request.status >= 200 && request.status < 300) {
            let response: AxiosResponse<T> = {
              data: request.response ? request.response : request.responseText,
              status: request.status,
              statusText: request.statusText,
              headers: parseHeaders(request.getAllResponseHeaders()),
              config,
              request
            };
            if (config.transformResponse) {
              response = config.transformResponse(response);
            }
            resolve(response);
          } else {
            reject(new Error(`Request failed with status code ${request.status}`));
          }
        }
      };
      //  POST method
      // headers && Object.keys(headers).forEach(key => request.setRequestHeader(key, headers![key]));
      if (headers) {
        // headers:
        //   common: {accept: "application/json"}
        //   get: {}
        //   head: {}
        //   delete: {}
        //   options: {}
        //   put: {Content-Type: "application/json"}
        //   post: {Content-Type: "application/json"}
        //   patch: {Content-Type: "application/json"}
        Object.keys(headers).forEach(key => {
          if (key === 'common' || allMethods.includes(key)) {
            if (key === 'common' || key === config.method) {
              for (let key2 in headers![key]) request.setRequestHeader(key2, headers![key][key2]);
            }
          } else request.setRequestHeader(key, headers![key]);
        });
      }
      let body: string | null = null;
      if (data) {
        if (typeof data === 'object') body = JSON.stringify(data);
        else if (typeof data === 'string') body = data;
      }
      /**
       * 错误处理
       *  - 网络异常 request.onerror
       *  - 超时异常 request.ontimeout
       *  - 错误状态码 request.status === 0
       */

      request.onerror = function() {
        reject(new Error(`net::ERR_INTERNET_DISCONNECTED`));
      };

      if (timeout) {
        request.timeout = timeout;
        request.ontimeout = function() {
          reject(new Error(`timeout of ${timeout}ms exceeded`));
        };
      }

      // cancelToken
      if (config.cancelToken) {
        config.cancelToken.then((reason: string) => {
          request.abort();
          reject(reason);
        });
      }

      request.send(body);
    });
  }

  get<T, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<AxiosRequestConfig | R> {
    config = { ...config, url };
    return this.request<T>(config!);
  }
}
