import React, { FC, useEffect, Suspense, useState } from 'react';
import { Layout, Drawer } from 'antd';
import './index.less';
import MenuComponent from './menu';
import HeaderComponent from './header/header';
import { getGlobalState } from 'utils/getGloabal';
import TagsView from './tagView/tagView';
import SuspendFallbackLoading from './suspendFallbackLoading';
import { MenuList } from 'interface/layout/menu.interface';
import { useGuide } from '../guide/useGuide';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { setUserItem } from 'stores/user.store';
import { useAppDispatch, useAppState } from 'stores';

const { Sider, Content } = Layout;
const WIDTH = 992;

const LayoutPage: FC = () => {
  const [menuList] = useState<MenuList>([]);
  const { device, collapsed, newUser } = useAppState(state => state.user);
  const isMobile = device === 'MOBILE';
  const dispatch = useAppDispatch();
  const { driverStart } = useGuide();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [navigate, location]);

  const toggle = () => {
    dispatch(
      setUserItem({
        collapsed: !collapsed
      })
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

  useEffect(() => {
    newUser && driverStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newUser]);

  return (
    <Layout className="layout-page">
      <HeaderComponent collapsed={collapsed} toggle={toggle} />
      <Layout>
        {!isMobile ? (
          <Sider className="layout-page-sider" trigger={null} collapsible collapsed={collapsed} breakpoint="md">
            <MenuComponent menuList={menuList} />
          </Sider>
        ) : (
          <Drawer
            width="200"
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
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
