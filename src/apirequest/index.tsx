import Axios from './axios';
import { AxiosInstance } from './types';
import { CancelToken, isCancel } from './cancel';

function createInstance<T>(): AxiosInstance {
  let context: Axios<T> = new Axios();
  let instance = Axios.prototype.request.bind(context);
  instance = Object.assign(instance, Axios.prototype, context);
  return instance as AxiosInstance;
}

let axiosRequest = createInstance();
axiosRequest.CancelToken = new CancelToken();
axiosRequest.isCancel = isCancel;
export default axiosRequest;

export * from './types';
