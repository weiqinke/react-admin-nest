import { message } from "antd";

/** goadmin 没有对应资源时，读接口返回空列表，避免页面把旧 Nest 地址打到新服务。 */
export function emptyOk(data: any = []) {
  return Promise.resolve({
    status: 200,
    data: { code: 0, message: "ok", data }
  });
}

export function removedApi(name: string) {
  const text = `当前后端未提供${name}`;
  message.warning(text);
  const error: any = new Error(text);
  error.code = 40401;
  error.data = null;
  return Promise.reject(error);
}
