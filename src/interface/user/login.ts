/** user's role */
export type Role = 'guest' | 'admin';

export interface LoginParams {
  /** 用户名 */
  username: string;
  /** 用户密码 */
  password: string;
  name?: string;
}

export interface LoginResult {
  /** auth token */
  token: string;
  username: string;
  role: Role;
}

export interface LogoutParams {
  token: string;
}

export interface LogoutResult {}

export interface LoginBackUser {
  address: string;
  name: string;
  sysuserid: string;
}

// address: null
// avatar: null
// departID: "JG003"
// departName: "运营调度中心"
// name: "吕东泽"
// position: {cn: null, hk: null, us: null}
// roleSign: "PT,PT"
// sysRoleID: "1,40"
// sysRoleName: "超级管理员,运管技术员"
// sysuserid: "8f008d41-a222-4b55-8d3a-7cf0f102037d"
