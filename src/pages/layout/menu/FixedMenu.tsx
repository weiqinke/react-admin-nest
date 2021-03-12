import React, { FC, useState, useEffect } from 'react';
import { Menu } from 'antd';
import { MenuList } from 'interface/layout/menu.interface';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState, useAppDispatch } from 'stores';
import { useProjectConfig } from 'hooks/useProjectConfig';
import { useSystemUserInfo } from 'hooks/useSystemInfo';
import IconFont from 'pages/commponents/iconfont/iconfont';
import { setChangeFixedMenu } from 'stores/menu.store';
import './FixedMenu.less';
import { findMenuOpenKeys, setLocalStorage } from 'utils/menuUtil';
const { Item } = Menu;

interface Props {
  menuList: MenuList;
}

// eslint-disable-next-line no-empty-pattern
const FixedMenu: FC<Props> = ({}) => {
  const [openKeys, setOpenkeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const { collapsed, menuList } = useAppState(state => state.user);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { config } = useProjectConfig();
  const { layout } = config;
  const { getMenu } = useSystemUserInfo();
  const sysMenus = getMenu();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 该 effect 同时用于初始化和刷新
    // pathname变化了，但是他的路径是附带了菜单路径的，我们只需要匹配到路径，就认为他是选中状态就好了
    let cacheUrl = '/' + pathname.split('/')[1];
    setOpenkeys(() => [cacheUrl]);
    setSelectedKeys(() => [cacheUrl]);
  }, [collapsed, pathname]);

  // 展开/关闭的回调
  const onOpenChange = (openKeys: any) => {
    setOpenkeys(() => openKeys);
    setLocalStorage('cacheOpenKeys', openKeys); // 记住展开关闭的组，刷新持久化
  };
  if (layout === 'fixed') {
  }
  const renderFixedMenuMembers = (adminRoutes: any[]) => {
    // const adminRoutesDeepClone = routesFilter([...adminRoutes], roles); // adminRoutes权限过滤, 此版本不做了，因为菜单就是根据权限筛选出来的
    return adminRoutes.map(({ name, meUrl }) => {
      return (
        <Item key={meUrl} title={name} icon={<IconFont type={'anticon-shouye'} />}>
          {name}
        </Item>
      );
      // 动态路由不进行显示，因为一般动态路由是详情页
      // 虽然不显示，但是需要注册路由，只是menu不显示
    });
  };

  // 点击 menuItem 触发的事件
  const targetMenuItem = (menuItem: any) => {
    const MenuHasChildren = menuList.filter((tag: any) => {
      return tag.meUrl === menuItem.key && tag.children && tag.children.length > 0;
    });
    const { keyPath } = menuItem;
    setSelectedKeys(() => keyPath);
    dispatch(
      setChangeFixedMenu({
        changeFixedMenu: MenuHasChildren
      })
    );
    if (MenuHasChildren.length > 0) {
      /**
       * 认为是SubMenu 有子元素
       * 我们应该跳转到第一个拥有菜单路径的人
       * 如果当前菜单下全是路由，而不是页面。就认为第一个就是页面
       * 此刻，我们去找第一个菜单中此元素的节点 MenuHasChildren
       * 把MenuHasChildren放到全局中，让别的组件去使用它
       * 好像我在此刻应该把路径给修改了，让他自己先跳过去
       */
      const [nextMenuItem] = MenuHasChildren;
      const cacheOpenKeys = findMenuOpenKeys(nextMenuItem);
      setOpenkeys(() => cacheOpenKeys);
      setLocalStorage('cacheOpenKeys', cacheOpenKeys); // 记住展开关闭的组，刷新持久化
      const [lastChildUrl] = [...cacheOpenKeys].reverse();
      navigate({
        pathname: lastChildUrl
      });
      /**
       * 从nextMenuItem中找到菜单项 跳转过去
       */
    } else {
      navigate({
        pathname: menuItem.key
      });
    }

    /****
     * 此时并不是菜单，要确定好，
     * 如果是一个可跳转的组件，我们采取跳转，
     * 否则，只是检索该元素下的子元素，放到内存中。更新到左侧菜单
     * 我先使用一个极端的方法。使用menuItem.props.children
     * 如果有子元素，且子元素的长度大于0，认为你就是 SubMenu，不做跳转，而是切换左侧菜单
     */
    // navigate(keyPath[0]);
    // setSelectedKeys(() => [key]); // 修改当前组件的state
  };
  return (
    <Menu
      mode="horizontal"
      theme="dark"
      onClick={targetMenuItem}
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={onOpenChange as any}
      className="layout-page-sider-menu"
    >
      {renderFixedMenuMembers([...sysMenus])}
    </Menu>
  );
};

export default FixedMenu;
