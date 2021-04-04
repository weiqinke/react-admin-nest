import React, { FC } from 'react';
import { Route } from 'react-router-dom';

import { RouteProps } from 'react-router';
import PrivateRoute from './pravateRoute';

export interface WrapperRouteProps extends RouteProps {
  /** document title locale id */
  title: string;
  /** authorization */
  auth: boolean;
  url: string;
  hiddMenu: boolean;
}

const WrapperRouteComponent: FC<WrapperRouteProps> = props => {
  const { title = 'welcome', auth = true } = props;
  // 根据权限检查是否登录，默认选择权限这个吧
  const WitchRoute = auth ? PrivateRoute : Route;
  document.title = title;
  return <WitchRoute {...props} />;
};

export default WrapperRouteComponent;
