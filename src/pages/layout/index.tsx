import React, { FC, useEffect, Suspense, useState } from 'react';
import { Layout, Drawer } from 'antd';
import './index.less';
import MenuComponent from './menu';
import HeaderComponent from './header/header';
import { getGlobalState } from 'utils/getGloabal';
import TagsView from './tagView/tagView';
import SuspendFallbackLoading from './suspendFallbackLoading';
import { MenuList } from 'interface/layout/menu.interface';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { setUserItem } from 'stores/user.store';
import { useAppDispatch, useAppState } from 'stores';
import { useProjectConfig } from 'hooks/useProjectConfig';
import FootLinks from './footer/FootLinks';
const { Sider, Content } = Layout;
const WIDTH = 992;

const LayoutPage: FC = () => {
  const [menuList] = useState<MenuList>([]);
  const { device, collapsed, RefreshFlag } = useAppState(state => state.user);
  const isMobile = device === 'MOBILE';
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { changeFixedMenu } = useAppState(state => state.menu);
  const { config } = useProjectConfig();
  const { layout } = config;
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/workplace');
    }
  }, [navigate, location]);
  const toggle = () => {
    dispatch(
      setUserItem({
        collapsed: !collapsed
      })
    );
  };

  const getSider = () => {
    if (changeFixedMenu && changeFixedMenu.length <= 0 && layout === 'fixed') {
      return (
        <Sider
          className="layout-page-sider menuabc"
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="md"
          width={1}
        >
          <MenuComponent menuList={menuList} />
        </Sider>
      );
    }
    return (
      <Sider className="layout-page-sider menuabc" trigger={null} collapsible collapsed={collapsed} breakpoint="md">
        <MenuComponent menuList={menuList} />
      </Sider>
    );
  };

  useEffect(() => {
    window.onresize = () => {
      const { device } = getGlobalState();
      const rect = document.body.getBoundingClientRect();
      const needCollapse = rect.width < WIDTH;
      dispatch(
        setUserItem({
          device,
          collapsed: needCollapse
        })
      );
    };
  }, [dispatch]);
  return (
    <Layout className="layout-page">
      <HeaderComponent collapsed={collapsed} toggle={toggle} />
      <Layout className="layout-page-main">
        {!isMobile ? (
          getSider()
        ) : (
          <Drawer
            placement="left"
            bodyStyle={{ padding: 0, height: '100%' }}
            closable={false}
            onClose={toggle}
            visible={!collapsed}
          >
            <MenuComponent menuList={menuList} />
          </Drawer>
        )}
        <Content className="layout-page-content">
          <TagsView />
          <Suspense fallback={<SuspendFallbackLoading />}>
            {RefreshFlag ? <SuspendFallbackLoading /> : <Outlet />}
          </Suspense>
          <FootLinks />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
