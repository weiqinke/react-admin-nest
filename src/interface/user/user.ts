import { Device } from 'interface/layout/index.interface';
import { Role } from './login';

export type Locale = 'zh_CN' | 'en_US';

export interface UserState {
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

  /** 登录状态 */
  loginState?: boolean;

  /** 首页地址 */
  indexUrl: string;
  /** 准备刷新的路径 */
  RefreshFCUrl:string;
  /****确认刷新 */
  RefreshFlag: boolean;
  /** 用户昵称 */
  nick?:string;


}
