import { Device } from 'interface/layout/index.interface';
import { Role } from './login';

export type Locale = 'zh_CN' | 'en_US';

export interface UserState {
  username: string;

  /** menu list for init tagsView */
  menuList: any;

  /** 用户权限 */
  role: Role;

  /** 用户设备 */
  device: Device;

  /** 是否展开菜单状态 */
  collapsed: boolean;

  /** 通知数量 */
  noticeCount: number;

  /** 用户的语言 */
  locale: Locale;

  /** 是否首次使用系统 ? */
  newUser: boolean;

  /** 登录状态 */
  loginState?: boolean;

  /** 首页地址 */
  indexUrl: string;
  
  RefreshFCUrl?:string;
}
