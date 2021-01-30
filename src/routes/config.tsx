import React, { FC } from 'react';
import { Route } from 'react-router-dom';

import { RouteProps } from 'react-router';
import PrivateRoute from './pravateRoute';
import { useIntl } from 'react-intl';

export interface WrapperRouteProps extends RouteProps {
  /** document title locale id */
  titleId: string;
  /** authorization？ */
  auth?: boolean;
}

const WrapperRouteComponent: FC<WrapperRouteProps> = ({ titleId, auth = true, ...props }) => {
  const { formatMessage } = useIntl();
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  // Route;
  // 根据权限检查是否登录，默认选择权限这个吧
  const WitchRoute = auth ? PrivateRoute : Route;
  // const WitchRoute = PrivateRoute;
  if (titleId) {
    document.title = formatMessage({
      id: titleId
    });
  }
  return <WitchRoute {...props} />;
};

export default WrapperRouteComponent;
