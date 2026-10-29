import { getMe, getMyProfile, register, updateMyProfile } from "@/api/goadmin";

export { register as userRegister };

export const userMenus = () => getMe();

export async function getmyuserinfo() {
  const res = await getMyProfile();
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

export { logout as apiLogout } from "@/api/microservice/user";
