import React, { lazy } from 'react';
// login别懒加载，会导致页面无数据出来的
import LayoutPage from 'pages/layout';
import LoginPage from 'pages/login/login';
import TarceIndex from 'pages/tarceindex/tarceindex';
import TypingCardIndex from 'pages/permission/typingcard/typingcard';
import Account from 'pages/account/Account';
import Workplace from 'pages/workplace/Workplace';
import Dashboard from 'pages/dashboard/Dashboard';
import OnlineList from 'pages/onlinelist/OnlineList';
import WangeditorPage from 'pages/wangeditor/wangeditor';
import WebsocketPage from 'pages/websocketpage/WebsocketPage';
import Labels from 'pages/system/labels/Labels';
import Placard from 'pages/system/placard/Placard';

const UserList = lazy(() => import(/* webpackChunkName: "userlist'"*/ 'pages/system/user/userlist'));
const MenusList = lazy(() => import(/* webpackChunkName: "menuslist'"*/ 'pages/system/menus/menuslist'));
const RoleList = lazy(() => import(/* webpackChunkName: "role'"*/ 'pages/system/role/RoleList'));
const Workbench = lazy(() => import(/* webpackChunkName: "account'"*/ 'pages/workbench/workbench'));
const NotFound = lazy(() => import(/* webpackChunkName: "404'"*/ 'pages/404'));
const Documentation = lazy(() => import(/* webpackChunkName: "404'"*/ 'pages/documentation'));
const Guide = lazy(() => import(/* webpackChunkName: "guide'"*/ 'pages/guide'));
const RoutePermission = lazy(() => import(/* webpackChunkName: "route-permission"*/ 'pages/permission/route'));
const ButtonPermission = lazy(() => import(/* webpackChunkName: "button-permission"*/ 'pages/permission/button'));
const PermissionConfig = lazy(() => import(/* webpackChunkName: "permission-config'"*/ 'pages/permission/config'));
const AccountPage = lazy(() => import(/* webpackChunkName: "account'"*/ 'pages/account'));
const LineChart = lazy(() => import(/* webpackChunkName: "LineChart'"*/ 'pages/chart/lineChart/LineChart'));
const PieChart = lazy(() => import(/* webpackChunkName: "PieChart'"*/ 'pages/chart/pieChart/PieChart'));
const RadarChart = lazy(() => import(/* webpackChunkName: "RadarChart'"*/ 'pages/chart/radarChart/RadarChart'));
const PillarChart = lazy(() => import(/* webpackChunkName: "PillarChart'"*/ 'pages/chart/pillarChart/PillarChart'));
const AreaChart = lazy(() => import(/* webpackChunkName: "AreaChart'"*/ 'pages/chart/areaChart/AreaChart'));
const CustomField = lazy(() => import(/* webpackChunkName: "CustomField'"*/ 'pages/form/customField/CustomField'));
const ArticleEdit = lazy(() => import(/* webpackChunkName: "ArticleEdit'"*/ 'pages/article/edit/ArticleEdit'));
const ArticleDetail = lazy(() => import(/* webpackChunkName: "ArticleDetail'"*/ 'pages/article/detail/ArticleDetail'));
const ArticleList = lazy(() => import(/* webpackChunkName: "ArticleList'"*/ 'pages/article/list/ArticleList'));
const MyInfo = lazy(() => import(/* webpackChunkName: "ArticleList'"*/ 'pages/system/myinfo/MyInfo'));

const SystemPages: any[] = [
  {
    url: 'login',
    routerDom: <LoginPage />,
    auth: false,
    title: '首页'
  },
  {
    url: '',
    routerDom: <LayoutPage />,
    title: '首页',
    auth: true,
    children: [
      {
        url: 'dashboard',
        routerDom: <Dashboard />
      },
      {
        url: 'typingcard',
        routerDom: <TypingCardIndex />
      },
      {
        url: 'workplace',
        routerDom: <Workplace />
      },
      {
        url: 'workbench',
        routerDom: <Workbench />
      },

      // 文章模块
      {
        url: 'article/detail',
        routerDom: <ArticleDetail />
      },
      {
        url: 'article/detail?id',
        routerDom: <ArticleDetail />
      },
      {
        url: 'article/detail/:slug',
        routerDom: <ArticleDetail />
      },
      {
        url: 'article/detail/*',
        routerDom: <ArticleDetail />
      },
      {
        url: 'article/edit',
        routerDom: <ArticleEdit />
      },
      {
        url: 'article/list',
        routerDom: <ArticleList />
      },
      // 图表模块
      {
        url: 'chart/areaChart',
        routerDom: <AreaChart />
      },
      {
        url: 'chart/lineChart',
        routerDom: <LineChart />
      },

      {
        url: 'chart/pieChart',
        routerDom: <PieChart />
      },
      {
        url: 'chart/pillarChart',
        routerDom: <PillarChart />
      },

      {
        url: 'chart/radarChart',
        routerDom: <RadarChart />
      },
      {
        url: 'chart/pillarChart',
        routerDom: <PillarChart />
      },
      {
        url: 'chart/operatorsworks',
        routerDom: <Documentation />
      },

      {
        url: 'chart/customfield',
        routerDom: <CustomField />
      },

      {
        url: 'chart/guide',
        routerDom: <Guide />
      },

      {
        url: 'permission/route',
        routerDom: <RoutePermission />
      },

      {
        url: 'permission/button',
        routerDom: <ButtonPermission />
      },

      {
        url: 'permission/config',
        routerDom: <PermissionConfig />
      },
      {
        url: 'account',
        routerDom: <AccountPage />
      },
      {
        url: 'systems/useradmin/userlist',
        routerDom: <UserList />
      },
      {
        url: 'systems/useradmin/menuslist',
        routerDom: <MenusList />
      },
      {
        url: 'systems/useradmin/rolelist',
        routerDom: <RoleList />
      },
      {
        url: 'systems/useradmin/labels',
        routerDom: <Labels />
      },
      {
        url: 'systems/useradmin/placard',
        routerDom: <Placard />
      },
      {
        url: 'tarce/tarceindex',
        routerDom: <TarceIndex />
      },
      {
        url: 'setting/personal',
        routerDom: <MyInfo />
      },
      {
        url: 'myinfo',
        routerDom: <MyInfo />
      },
      {
        url: 'setting/account',
        routerDom: <Account />
      },
      {
        url: 'onlinelist',
        routerDom: <OnlineList />
      },
      {
        url: 'WangeditorPage',
        routerDom: <WangeditorPage />
      },
      {
        url: 'WangeditorPage/:id',
        routerDom: <WangeditorPage />
      },
      {
        url: 'WebsocketPage',
        routerDom: <WebsocketPage />
      },

      {
        url: '*',
        routerDom: <NotFound />
      },
      {
        url: 'OnlineList1',
        routerDom: <OnlineList />
      }
    ]
  },
  {
    url: '*',
    routerDom: <LoginPage />
  }
];

export default SystemPages;
