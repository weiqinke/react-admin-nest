import { getCaptcha, getMe, getPublicKey, getUsers, login as goLogin, logout as goLogout, register as goRegister, updateUserProfile } from "@/api/goadmin";
import { getRefreshToken } from "@/api/session";

export { getCaptcha, getPublicKey };

function normalizeUser(user) {
  const profile = user?.profile || {};
  return {
    ...user,
    uid: user?.id,
    email: profile.email || "",
    mobile: profile.mobile || profile.phone || "",
    banned: profile.status === 0,
    profile: {
      ...profile,
      nick: profile.nickname || user?.username || ""
    }
  };
}

function profilePayload(payload: any = {}) {
  const profile = payload.profile || {};
  const body: any = {
    nickname: profile.nick ?? payload.nick,
    email: payload.email,
    mobile: payload.mobile,
    phone: payload.phone,
    avatar: profile.avatar ?? payload.avatar,
    address: profile.address ?? payload.address,
    bio: profile.signature ?? payload.signature
  };
  if (profile.sex != null && profile.sex !== "") body.gender = Number(profile.sex);
  if (payload.banned != null) body.status = payload.banned ? 0 : 1;
  if (payload.status != null) body.status = payload.status;
  return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined && value !== ""));
}

/** 登录。可传明文 password，由这里做 RSA-OAEP 加密。 */
export const login = payload => goLogin(payload);

/** 注册。成功后不会返回 token，需要再登录。 */
export const register = payload => goRegister(payload);

/** 当前用户。兼容旧页面读取 data.profile。 */
export async function userinfo() {
  const res = await getMe();
  const user = normalizeUser(res.data?.data || {});
  return { ...res, data: { ...res.data, data: user } };
}

export const userMenus = () => userinfo();

export async function createUser(payload) {
  const created = await goRegister({ username: payload.username, password: payload.password });
  const id = created.data?.data?.user?.id;
  const profile = profilePayload(payload);
  if (!id || Object.keys(profile).length === 0) return created;
  return updateUserProfile(String(id), profile);
}

export async function findUsers(query: any = {}) {
  const res = await getUsers();
  let list = res.data?.data?.list || [];
  if (query.username) list = list.filter(item => item.username?.includes(query.username));
  if (query.email) list = list.filter(item => (item.profile?.email || "").includes(query.email));
  if (query.mobile) {
    list = list.filter(item => (item.profile?.mobile || item.profile?.phone || "").includes(query.mobile));
  }
  return { ...res, data: { ...res.data, data: list.map(normalizeUser) } };
}

export function updateUser(payload: any = {}) {
  const id = payload.id || payload.uid || payload.user_id;
  return updateUserProfile(String(id), profilePayload(payload));
}

/** OAuth 已不在 goadmin 中提供。 */
export const userOAuth2 = () => Promise.reject(Object.assign(new Error("当前后端未提供第三方登录"), { code: 40401 }));

export function logout() {
  const refresh_token = getRefreshToken();
  return goLogout(refresh_token || undefined, { skipErrorMessage: true });
}
