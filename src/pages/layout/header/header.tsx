import React, { FC, useState } from 'react';
import { LogoutOutlined, UserOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Layout, Dropdown, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import HeaderNoticeComponent from './notice';
import Avator from 'assets/header/avator.png';
import { ReactComponent as LanguageSvg } from 'assets/header/language.svg';
import { ReactComponent as ZhCnSvg } from 'assets/header/zh_CN.svg';
import { ReactComponent as EnUsSvg } from 'assets/header/en_US.svg';
import AntdSvg from 'assets/logo/antd.svg';
import { setUserItem, logoutSystem } from 'stores/user.store';
import { useAppDispatch, useAppState } from 'stores';
import FixedMenu from '../menu/FixedMenu';
import { MenuList } from 'interface/layout/menu.interface';
import './header.less';
import { useProjectConfig } from 'hooks/useProjectConfig';
import { useSystemUserInfo } from 'hooks/useSystemInfo';

const { Header } = Layout;

interface Props {
  collapsed: boolean;
  toggle: () => void;
}

const HeaderComponent: FC<Props> = ({ collapsed, toggle }) => {
  const { loginState, locale, device, nick } = useAppState(state => state.user);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [menuList] = useState<MenuList>([]);
  const { config } = useProjectConfig();
  const { layout } = config;
  const logout = async () => {
    navigate('/login');
    dispatch(logoutSystem());
  };

  const toLogin = () => {
    navigate('/login');
  };

  const selectLocale = ({ key }: { key: any }) => {
    dispatch(setUserItem({ locale: key }));
    localStorage.setItem('locale', key);
  };
  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => navigate('/dashboard')}>
        <span>
          <UserOutlined />
          <span>个人设置</span>
        </span>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" onClick={() => logout()}>
        <span>
          <LogoutOutlined />
          <span>退出登录</span>
        </span>
      </Menu.Item>
    </Menu>
  );
  return (
    <Header className="layout-page-header topheader">
      {device !== 'MOBILE' && (
        <div className="logo topheader" style={{ width: collapsed ? 80 : 200 }} title="返回首页">
          <img src={AntdSvg} alt="" />
        </div>
      )}
      <div className="layout-page-header-main topheader">
        {/* 此处是切换隐藏菜单栏 */}
        <div onClick={toggle} className="togglesidebar">
          {collapsed ? <MenuUnfoldOutlined className="icontab" /> : <MenuFoldOutlined className="icontab" />}
        </div>
        {/* 菜单管理，仅仅保存一级菜单 */}
        {layout && layout === 'fixed' ? (
          <div className="menutop">
            <FixedMenu menuList={menuList}></FixedMenu>
          </div>
        ) : null}
        <div className="actions">
          <HeaderNoticeComponent />
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu onClick={selectLocale}>
                <Menu.Item style={{ textAlign: 'left' }} disabled={locale === 'zh_CN'} key="zh_CN">
                  <ZhCnSvg /> 简体中文
                </Menu.Item>
                <Menu.Item style={{ textAlign: 'left' }} disabled={locale === 'en_US'} key="en_US">
                  <EnUsSvg /> English
                </Menu.Item>
              </Menu>
            }
          >
            <span>
              <LanguageSvg id="language-change" />
            </span>
          </Dropdown>
          {loginState ? (
            <Dropdown overlay={menu} trigger={['click']}>
              <span className="user-action">
                <img src={Avator} className="user-avator" alt="avator" />
                <b className="user-name">{nick || '无名'}</b>
              </span>
            </Dropdown>
          ) : (
            <span style={{ cursor: 'pointer' }} onClick={toLogin}>
              测试文字
            </span>
          )}
        </div>
      </div>
    </Header>
  );
};

export default HeaderComponent;
