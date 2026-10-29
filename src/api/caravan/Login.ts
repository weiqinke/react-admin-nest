import { getCaptcha, login, logout, register } from "@/api/goadmin";
import { emptyOk, removedApi } from "@/api/removed";

export { getCaptcha, login as apiLogin, login as accountlogin, logout as apiLogout, register as Zhuce };

export const getMenuList = () => emptyOk([]);

export const getNoticeList = () => emptyOk([]);

export const getNoticeList2 = () => emptyOk([]);

/** @deprecated 请用 `@/api/oauth` + `/oauth/callback` 处理后端 302 回跳的 token。 */
export const userTokenByOAuth2Code = () => removedApi("第三方登录（改用 /api/oauth/{provider}/authorize）");

export const getUserMenus = () => emptyOk([]);

export const GetMenuByToken = () => emptyOk([]);

export const GetPlanPaged = () => emptyOk([]);

export const findalluser = () => emptyOk([]);

export const addOneUser = () => removedApi("用户创建");

export const editOneUser = () => removedApi("用户编辑");

export const changeUserStatus = () => removedApi("用户状态");

export const getAccountLog = () => emptyOk([]);

export const getmyuserinfo = () => emptyOk({});

export const updateMyinfo = () => removedApi("个人资料");

export const updateUserAvatarUrl = () => removedApi("头像上传");

export const findAccountLogs = () => emptyOk([]);
