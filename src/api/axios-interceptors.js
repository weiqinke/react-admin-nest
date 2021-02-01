/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-unused-expressions */
import { message as $message } from 'antd';
// 401拦截
const resp401 = {
  /**
   * 响应数据之前做点什么
   * @param response 响应对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(response) {
    if (response.status === 400) {
      $message.error({
        content: '无此接口权限',
        duration: 1
      });
    }
    if (response.status === 401) {
      $message.error({
        content: '无此接口权限',
        duration: 1
      });
    }
    return response;
  }
};

const resp403 = {
  onFulfilled(response) {
    if (response.status === 403) {
      $message.error({
        content: '请求被拒绝',
        duration: 1
      });
    }
    return response;
  }
};

const resp404 = {
  onFulfilled(response) {
    if (response.status === 404) {
      $message.error({
        content: '请求找不到',
        duration: 1
      });
    }
    return response;
  }
  // onRejected(error) {
  //   $message.error({
  //     content: '请求找不到',
  //     duration: 1
  //   });
  //   return Promise.reject(error);
  // }
};

const resp415 = {
  onFulfilled(response) {
    if (response.status === 415) {
      $message.error({
        content: '请求方式不受支持',
        duration: 1
      });
    }
    return response;
  }
};

const resp20401 = {
  onFulfilled(response) {
    if (response.status === 200 && response.data.code === 20401) {
      // 为了处理返回数据为空，hash
      // $message.error({
      //   content: '获取到0条数据',
      //   duration: 1
      // });
    }
    if (response.status === 200 && response.data.code === 41701) {
      $message.error({
        content: '查询参数错误',
        duration: 1
      });
    }
    return response;
  }
};

const resperror = {
  onRejected(error) {
    $message.error({
      content: '请求错误',
      duration: 1
    });
    return Promise.reject(error);
  }
};

const reqCommon = {
  /**
   * 发送请求之前做些什么
   * @param config axios config
   * @returns {*}
   */
  onFulfilled(config) {
    // if (url.indexOf('login') === -1 && xsrfCookieName && !Cookie.get(xsrfCookieName)) {
    //   message.warning('认证 token 已过期，请重新登录')
    // }
    return config;
  },
  /**
   * 请求出错时做点什么
   * @param error 错误对象
   * @returns {Promise<never>}
   */
  onRejected(error) {
    $message.error({
      content: error.message,
      duration: 1
    });
    return Promise.reject(error);
  }
};
export const requestInterce = [reqCommon]; // 请求拦截
export const responseInterce = [resp401, resp403, resp404, resp415, resp20401, resperror]; // 响应拦截
