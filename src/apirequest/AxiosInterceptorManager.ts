import { AxiosRequestConfig, AxiosResponse } from './types';

interface onFulfilled<V> {
  (value: V): V | Promise<V>;
}

interface onRejected {
  (error: any): any;
}
export interface Interceptor<T = any> {
  onFulfilled?: onFulfilled<T>;
  onRejected?: onRejected;
}

export interface Interceptors {
  request: AxiosInterceptorManager<AxiosRequestConfig>;
  response: AxiosInterceptorManager<AxiosResponse>;
}

export default class AxiosInterceptorManager<T> {
  public interceptors: Array<Interceptor<T> | null> = [];
  // 每个拦截器都有两个参数， 成功的回调 和失败的回调
  use(onFulfilled?: onFulfilled<T>, onRejected?: onRejected): number {
    console.log(onFulfilled, '============================');
    console.log(onRejected, '============================');
    this.interceptors.push({
      onFulfilled,
      onRejected
    });
    return this.interceptors.length - 1;
  }

  eject(index: number): void {
    this.interceptors[index] && (this.interceptors[index] = null);
  }
}
