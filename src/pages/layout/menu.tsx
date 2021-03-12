import { FC, useState, useEffect } from 'react';
import React from 'react';
import { Menu } from 'antd';
import { MenuList } from '../../interface/layout/menu.interface';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState, useAppDispatch } from 'stores';
import { useProjectConfig } from 'hooks/useProjectConfig';
import FixedLeftMenu from './menu/FixedLeftMenu';
import { useSystemUserInfo } from 'hooks/useSystemInfo';
import IconFont from 'pages/commponents/iconfont/iconfont';
import './menu.less';
import { setRefreshFCUrl } from 'stores/user.store';
import { getLocalStorage, setLocalStorage } from 'utils/menuUtil';
const { SubMenu, Item } = Menu;

interface Props {
  menuList: MenuList;
}

// eslint-disable-next-line no-empty-pattern
const MenuComponent: FC<Props> = ({}) => {
  const [openKeys, setOpenkeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const { collapsed } = useAppState(state => state.user);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { config } = useProjectConfig();
  const dispatch = useAppDispatch();
  const { layout } = config;
  const { getMenu } = useSystemUserInfo();
  const sysMenus = getMenu();
  const { changeFixedMenu } = useAppState(state => state.menu);

  useEffect(() => {
    // 说明：
    // (1)
    // 这里要考虑 ( 登陆第一次跳转的加载 ) 和 ( 刷新浏览器的加载 )
    // 不管哪种情况，都获取当前的 pathname，当前pathname是 ( path和menu的keys要一致的原因  )
    // (2)
    // openKeys ===> 是要存在localStorage的，因为需要持久化保存，刷新按钮刷新时，获取
    // selectkeys => 不需要做持久化，而是从 location.pathname 中获取，因为我们的routes中 path 和 key 是一致的，获取的当前path就是当前选中的menu.item的key
    // (3)
    // 该 effect 同时用于初始化和刷新
    const CurrentopenKeys = getLocalStorage('cacheOpenKeys') || [];
    setOpenkeys(() => CurrentopenKeys); // 菜单的展开和关闭的 keys，每一个menu成员都有一个唯一的key
    setSelectedKeys(() => [pathname]); // 选中菜单的keys数组，我们的 route 中的  key 和 path 是一样的
  }, [collapsed, pathname, layout]);

  // 展开/关闭的回调
  const onOpenChange = (openKeys: any) => {
    setOpenkeys(() => openKeys);
    setLocalStorage('cacheOpenKeys', openKeys); // 记住展开关闭的组，刷新持久化
  };

  const renderMenuMembers = (adminRoutes: any[]) => {
    // const adminRoutesDeepClone = routesFilter([...adminRoutes], roles); // adminRoutes权限过滤, 此版本不做了，因为菜单就是根据权限筛选出来的
    return adminRoutes.map(({ name, meUrl, children, icon }) => {
      return children && children.length > 0 ? (
        <SubMenu key={meUrl} title={name} icon={<IconFont type={'anticon-shouye'} />}>
          {renderMenuMembers(children)}
        </SubMenu>
      ) : (
        <Item key={meUrl} icon={<IconFont type={'anticon-shouye'} />}>
          {name}
        </Item>
      );
      // 动态路由不进行显示，因为一般动态路由是详情页
      // 虽然不显示，但是需要注册路由，只是menu不显示
    });
  };

  // 点击 menuItem 触发的事件
  const goPage = ({ keyPath, key }: { keyPath: any[]; key: any }) => {
    // 此时需要注意下，我们需要设置全局刷新key，否则好多页面会一直处于刷新状态
    dispatch(
      setRefreshFCUrl({
        RefreshFCUrl: key,
        RefreshFlag: false
      })
    );
    navigate(keyPath[0]);
    setSelectedKeys(() => [key]); // 修改当前组件的state
  };

  if (layout === 'fixed') {
    /**
     * 现在不要用原始菜单数据了，需要从缓存中取值
     */
    return <FixedLeftMenu menuList={changeFixedMenu}></FixedLeftMenu>;
  }
  return (
    <Menu
      mode="inline"
      theme="light"
      onClick={goPage}
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={onOpenChange as any}
      className="layout-page-sider-menu nextmenus"
    >
      {renderMenuMembers([...sysMenus])}
    </Menu>
  );
};

export default MenuComponent;
