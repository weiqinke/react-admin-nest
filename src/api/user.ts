import {
  getCaptcha,
  getMe,
  getMyProfile,
  getPublicKey,
  getUsers,
  login as goLogin,
  logout as goLogout,
  register as goRegister,
  updateMyProfile,
  updateUserProfile
} from "@/api/goadmin";
import { setUserDepartment } from "@/api/platform";
import { getRefreshToken } from "@/api/session";

export { getCaptcha, getPublicKey };
export { goRegister as userRegister };

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
export async function userinfo(options?: { signal?: AbortSignal }) {
  const res = await getMe(options);
  const user = normalizeUser(res.data?.data || {});
  return { ...res, data: { ...res.data, data: user } };
}

export async function createUser(payload) {
  const created = await goRegister({ username: payload.username, password: payload.password });
  const id = created.data?.data?.user?.id;
  const profile = profilePayload(payload);
  let result = created;
  if (id && Object.keys(profile).length > 0) {
    result = await updateUserProfile(String(id), profile);
  }
  if (id && payload.department_id) {
    await setUserDepartment(String(id), String(payload.department_id));
  }
  return result;
}

export async function findUsers(query: any = {}) {
  const res = await getUsers();
  const payload = res.data?.data || {};
  let list = payload.list || [];
  if (query.username) list = list.filter(item => item.username?.includes(query.username));
  if (query.email) list = list.filter(item => (item.profile?.email || "").includes(query.email));
  if (query.mobile) {
    list = list.filter(item => (item.profile?.mobile || item.profile?.phone || "").includes(query.mobile));
  }
  return { ...res, data: { ...res.data, data: list.map(normalizeUser), data_scope: payload.data_scope || "" } };
}

export function updateUser(payload: any = {}) {
  const id = payload.id || payload.uid || payload.user_id;
  return updateUserProfile(String(id), profilePayload(payload));
}

export function logout() {
  const refresh_token = getRefreshToken();
  return goLogout(refresh_token || undefined, { skipErrorMessage: true });
}

export async function getmyuserinfo(options?: { signal?: AbortSignal }) {
  const res = await getMyProfile(options);
  const profile = res.data?.data || {};
  return {
    ...res,
    data: {
      ...res.data,
      data: {
        ...profile,
        nick: profile.nickname,
        signature: profile.bio,
        uid: profile.user_id
      }
    }
  };
}

export function updateMyinfo(payload: any = {}) {
  const body: any = {
    nickname: payload.nick ?? payload.nickname,
    email: payload.email,
    phone: payload.phone,
    mobile: payload.mobile,
    address: payload.address,
    bio: payload.signature ?? payload.bio,
    avatar: payload.avatar
  };
  return updateMyProfile(Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined)));
}
