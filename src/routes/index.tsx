import React, { lazy, FC } from 'react';

import Dashboard from 'pages/dashboard';
import LoginPage from 'pages/login/login';
import LayoutPage from 'pages/layout';
import { PartialRouteObject } from 'react-router';
import WrapperRouteComponent from './config';
import { useRoutes } from 'react-router-dom';
import { useAppState } from 'stores';
import { Spin } from 'antd';

const NotFound = lazy(() => import(/* webpackChunkName: "404'"*/ 'pages/404'));
const Documentation = lazy(() => import(/* webpackChunkName: "404'"*/ 'pages/doucumentation'));
const Guide = lazy(() => import(/* webpackChunkName: "guide'"*/ 'pages/guide'));
const RoutePermission = lazy(() => import(/* webpackChunkName: "route-permission"*/ 'pages/permission/route'));
const ButtonPermission = lazy(() => import(/* webpackChunkName: "button-permission"*/ 'pages/permission/button'));
const PermissionConfig = lazy(() => import(/* webpackChunkName: "permission-config'"*/ 'pages/permission/config'));
const AccountPage = lazy(() => import(/* webpackChunkName: "account'"*/ 'pages/account'));

const RenderRouter: FC = () => {
  const { RefreshFCUrl } = useAppState(state => state.user);
  const routeList: PartialRouteObject[] = [
    {
      path: 'login',
      element: <WrapperRouteComponent element={<LoginPage />} titleId="title.login" auth={false} />
    },
    {
      path: '',
      element: <WrapperRouteComponent element={<LayoutPage />} titleId="" />,
      children: [
        {
          path: 'workplace',
          element: (
            <WrapperRouteComponent
              element={RefreshFCUrl === '/workplace' ? <Dashboard /> : <Spin />}
              titleId="title.dashboard"
            />
          )
        },
        {
          path: 'workplace/boardworks',
          element: <WrapperRouteComponent element={<Dashboard />} titleId="title.dashboard" />
        },
        {
          path: 'workbench/operatorsworks',
          element: <WrapperRouteComponent element={<Documentation />} titleId="title.documentation" />
        },
        {
          path: 'workbench/boardworks',
          element: <WrapperRouteComponent element={<Guide />} titleId="title.guide" />
        },
        {
          path: 'permission/route',
          element: <WrapperRouteComponent element={<RoutePermission />} titleId="title.permission.route" auth />
        },
        {
          path: 'permission/button',
          element: <WrapperRouteComponent element={<ButtonPermission />} titleId="title.permission.button" />
        },
        {
          path: 'permission/config',
          element: <WrapperRouteComponent element={<PermissionConfig />} titleId="title.permission.config" />
        },
        {
          path: 'account',
          element: <WrapperRouteComponent element={<AccountPage />} titleId="title.account" />
        },
        {
          path: '*',
          element: <WrapperRouteComponent element={<NotFound />} titleId="title.notFount" />
        }
      ]
    },
    {
      path: '*',
      element: <WrapperRouteComponent element={<LoginPage />} titleId="title.login" auth={false} />
    }
  ];
  const element = useRoutes(routeList);
  return element;
};

export default RenderRouter;
