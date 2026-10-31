import { getPublicKey } from "./auth";
import { encryptPassword } from "./crypto";
import { request } from "./request";

export { clearTrustToken, getStoredTrustToken, storeTrustToken } from "./trust";

/** TOTP 状态。data: { enabled, issuer? } */
export const getTotpStatus = () => request("/api/me/totp", "GET");

/** 开始绑定，返回 secret / otpauth_uri（仅此一次）。 */
export const beginTotpSetup = () => request("/api/me/totp/setup", "POST", {});

/** 用 6 位码确认启用。 */
export const confirmTotpSetup = (code: string) => request("/api/me/totp/confirm", "POST", { code });

/** 用当前 TOTP 码关闭双因素。 */
export const disableTotp = (code: string) => request("/api/me/totp", "DELETE", {}, { data: { code } });

/** Step-up：密码或 totp_code 二选一。data: { token, expires_at } */
export const createConfirmation = (payload: { password?: string; totp_code?: string }) => request("/api/me/confirmations", "POST", payload);

/** 找回密码（需 mail.enabled）。公开接口。 */
export const forgotPassword = (account: string) => request("/api/password/forgot", "POST", { account });

/** 凭邮件 token 重置密码。公开接口。 */
export async function resetPassword(token: string, password: string) {
  const keyRes = await getPublicKey();
  const password_encrypted = await encryptPassword(keyRes.data.data.public_key, password);
  return request("/api/password/reset", "POST", { token, password_encrypted });
}

/** 可信设备列表。 */
export const listTrustedDevices = () => request("/api/me/trusted-devices", "GET");

export const revokeTrustedDevice = (id: string) => request(`/api/me/trusted-devices/${encodeURIComponent(id)}`, "DELETE");
