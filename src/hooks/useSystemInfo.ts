import { useState } from 'react';
/***
 * 需要注意，不同组件中的Hook是不一样的，每次调用。都会在每个组件进行重置
 */
export const useSystemUserInfo = () => {
  const [userInfo, setUserInfo] = useState({});
  const [loginInfo, setLoginInfo] = useState({});
  const [menuData, setMenuData] = useState([]);
  const [cacheMenu, setCacheMenu] = useState('');
  return {
    userInfo,
    setUserInfo,
    loginInfo,
    setLoginInfo,
    menuData,
    setMenuData,
    cacheMenu,
    setCacheMenu,
    saveMenu: (menuList: any) => {
      setMenuData(menuList);
      localStorage.setItem('menuList', JSON.stringify(menuList));
    },
    getMenu: () => {
      const catchMenu = localStorage.getItem('menus');
      if (catchMenu !== null) {
        return JSON.parse(catchMenu);
      }
      return menuData;
    }
  };
};
