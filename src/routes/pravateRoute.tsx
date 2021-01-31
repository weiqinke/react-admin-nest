import React, { FC } from 'react';
import { Route } from 'react-router-dom';
import { RouteProps } from 'react-router';
import { useAppState } from 'stores';
import NotAuthPage from 'pages/403';
const PrivateRoute: FC<RouteProps> = props => {
  const { loginState } = useAppState(state => state.user);
  return loginState ? <Route {...props} /> : <NotAuthPage />;
};

export default PrivateRoute;
