import React, { FC } from 'react';
import { Route } from 'react-router-dom';
import { RouteProps } from 'react-router';
import { useAppState } from 'stores';
import NotAuthPage from 'pages/403';
import { isMyMenusUrl } from 'utils/menuUtil';
export interface KeyRouteProps extends RouteProps {
  url: string;
  dontshow: string;
}
const PrivateRoute: FC<KeyRouteProps> = ({ url, ...props }) => {
  const { loginState, menuList } = useAppState(state => state.user);
  const OkStatus = isMyMenusUrl(menuList, '/' + url.split('/').join('/'));
  if (loginState) {
    if (!OkStatus && url !== '' && url) {
      // 没找到此菜单
      // return <NotAuthPage />;
    }
  }
  //此处用菜单验证，认为菜单返回的就是此人真正的菜单
  return loginState ? <Route {...props} /> : <NotAuthPage />;
};

export default PrivateRoute;
