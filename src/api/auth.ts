import { encryptPassword } from "./crypto";
import { request } from "./request";

export const getCaptcha = () => request("/api/captcha", "GET");

export const getPublicKey = () => request("/api/crypto/public-key", "GET");

async function withEncryptedPassword(payload: any) {
  if (!payload?.password || payload.password_encrypted) return payload;
  const keyRes = await getPublicKey();
  const password_encrypted = await encryptPassword(keyRes.data.data.public_key, payload.password);
  const body = { ...payload, password_encrypted };
  delete body.password;
  return body;
}

/** 注册。成功后不会返回 token，需要再登录。 */
export async function register(payload) {
  return request("/api/register", "POST", await withEncryptedPassword(payload));
}

/** 登录。可传明文 password，由这里做 RSA-OAEP 加密。 */
export async function login(payload) {
  const body = await withEncryptedPassword(payload);
  if (Array.isArray(body.active_roles) && body.active_roles.length === 0) delete body.active_roles;
  return request("/api/login", "POST", body);
}
