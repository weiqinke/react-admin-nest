import { getCaptcha, getPublicKey, login as goLogin, register as goRegister } from "@/api/auth";
import {
  createManagedUser,
  getMe,
  getMyProfile,
  getUsers,
  logout as goLogout,
  resetManagedUserPassword,
  setManagedUserStatus,
  unlockManagedUser,
  updateMyProfile,
  updateUserProfile
} from "@/api/goadmin";
import { setUserDepartment, setUserPosition } from "@/api/platform";
import { getRefreshToken } from "@/api/session";

export { getCaptcha, getPublicKey, goLogin as login, goRegister as register, goRegister as userRegister };
export { resetManagedUserPassword as resetUserPassword, setManagedUserStatus as setUserStatus, unlockManagedUser as unlockUser };

function normalizeUser(user) {
  const profile = user?.profile || {};
  const accountStatus = user?.status != null ? Number(user.status) : Number(profile.status);
  return {
    ...user,
    uid: user?.id,
    email: profile.email || "",
    mobile: profile.mobile || profile.phone || "",
    banned: accountStatus === 0,
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
  return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined && value !== ""));
}

/** 当前用户。兼容旧页面读取 data.profile。 */
export async function userinfo(options?: { signal?: AbortSignal }) {
  const res = await getMe(options);
  const user = normalizeUser(res.data?.data || {});
  return { ...res, data: { ...res.data, data: user } };
}

export async function createUser(payload) {
  const created = await createManagedUser({ username: payload.username, password: payload.password });
  const id = created.data?.data?.id;
  const profile = profilePayload(payload);
  let result = created;
  if (id && Object.keys(profile).length > 0) {
    result = await updateUserProfile(String(id), profile);
  }
  if (id && payload.department_id) {
    await setUserDepartment(String(id), String(payload.department_id));
  }
  if (id && payload.position_id) {
    await setUserPosition(String(id), String(payload.position_id));
  }
  return result;
}

export async function findUsers(query: any = {}) {
  const res = await getUsers({
    page: query.page || 1,
    page_size: query.page_size || query.pageSize || 20,
    keyword: query.keyword || query.username,
    status: query.status,
    department_id: query.department_id,
    role: query.role
  });
  const payload = res.data?.data || {};
  const list = payload.list || [];
  return {
    ...res,
    data: {
      ...res.data,
      data: list.map(normalizeUser),
      total: payload.total || 0,
      page: payload.page || 1,
      page_size: payload.page_size || 20,
      data_scope: payload.data_scope || ""
    }
  };
}

/**
 * 下拉选项。默认只拉第一页；有 keyword 时按关键字搜一页，避免打开页面就串行拉上千用户。
 */
export async function findUserOptions(query: { keyword?: string; page_size?: number } = {}) {
  const keyword = String(query.keyword || "").trim();
  return findUsers({
    page: 1,
    page_size: query.page_size || (keyword ? 20 : 100),
    keyword: keyword || undefined
  });
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
