import { lazy } from "react";
import { Outlet } from "react-router-dom";

import DefaultLayout from "@/layout/DefaultLayout";
import ProjectLayout from "@/layout/ProjectLayout";
import Login from "@/pages/Login";
import Account from "@/pages/Account";

const About = lazy(
  () => import(/* webpackChunkName: "About'"*/ "@/pages/About")
);
const AnimateCard = lazy(
  () => import(/* webpackChunkName: "AnimateCard'"*/ "@/pages/AnimateCard")
);
const LabelsAdmin = lazy(
  () => import(/* webpackChunkName: "LabelsAdmin'"*/ "@/pages/LabelsAdmin")
);
const MenuAdmin = lazy(
  () => import(/* webpackChunkName: "MenuAdmin'"*/ "@/pages/MenuAdmin")
);
const Workbench = lazy(
  () => import(/* webpackChunkName: "Workbench'"*/ "@/pages/Workbench")
);
const Workplace = lazy(
  () => import(/* webpackChunkName: "Workplace'"*/ "@/pages/Workplace")
);
const PlacardAdmin = lazy(
  () => import(/* webpackChunkName: "PlacardAdmin'"*/ "@/pages/PlacardAdmin")
);
const RoleAdmin = lazy(
  () => import(/* webpackChunkName: "RoleAdmin'"*/ "@/pages/RoleAdmin")
);

const UserAdmin = lazy(
  () => import(/* webpackChunkName: "UserAdmin'"*/ "@/pages/UserAdmin")
);
const WebsocketAdmin = lazy(
  () =>
    import(/* webpackChunkName: "WebsocketAdmin'"*/ "@/pages/WebsocketAdmin")
);

const AreaChart = lazy(
  () => import(/* webpackChunkName: "AreaChart'"*/ "@/pages/Chart/AreaChart")
);
const NotFoundPage = lazy(
  () =>
    import(
      /* webpackChunkName: "NotFoundPage'"*/ "@/pages/FailPage/NotFoundPage"
    )
);

const D3Example = lazy(
  () => import(/* webpackChunkName: "D3Example'"*/ "@/pages/D3Example")
);

const RouterPages: any = [
  {
    component: <ProjectLayout />,
    children: [
      {
        path: "login",
        component: <Login />,
        auth: false,
        title: "Login",
      },
      {
        path: "/",
        component: <DefaultLayout />,
        auth: true,
        children: [
          {
            path: "workplace",
            component: <Workplace />,
            auth: true,
            title: "工作台",
          },
          {
            path: "workbench",
            component: <Workbench />,
            auth: true,
            title: "工作台",
          },
          {
            path: "charts",
          },
          {
            path: "charts",
            title: "图表模块",
            component: <Outlet />,
            auth: true,
            children: [
              {
                path: "AreaCharts",
                component: <AreaChart />,
                title: "AreaCharts",
              },
              {
                path: "d3example",
                component: <D3Example />,
                auth: true,
                title: "D3图例",
                loader: async () => {
                  // return { info: "我是打开页面的时候，传递来的数据" };
                  return null;
                },
                // errorElement: <ErrorBoundary />, // 假如 loader 或者 action 返回了错误，就渲染这个组件
              },
              {
                path: "animate",
                component: <AnimateCard />,
                auth: true,
                title: "D3图例",
              },
            ],
          },
          {
            path: "management",
            title: "系统管理",
            component: <Outlet />,
            children: [
              {
                path: "useradmin",
                component: <UserAdmin />,
                title: "useradmin",
              },
              {
                path: "menuadmin",
                component: <MenuAdmin />,
                title: "menuadmin",
              },
              {
                path: "roleadmin",
                component: <RoleAdmin />,
                title: "roleadmin",
              },
              {
                path: "labelsadmin",
                component: <LabelsAdmin />,
                title: "labelsadmin",
              },
              {
                path: "placardadmin",
                component: <PlacardAdmin />,
                title: "标签管理",
              },
              {
                path: "websocketadmin",
                component: <WebsocketAdmin />,
                title: "在线用户管理",
              },
              {
                path: "*",
                component: <NotFoundPage />,
                title: "notFound",
              },
            ],
          },
          {
            path: "about",
            component: <About />,
            auth: true,
            title: "关于",
          },
          {
            path: "account",
            component: <Account />,
            auth: true,
            title: "个人信息",
          },
          {
            path: "",
            component: <About />,
            auth: true,
            title: "关于",
          },
          {
            path: "*",
            component: <NotFoundPage />,
            auth: true,
            title: "NotFound",
          },
        ],
      },
      {
        path: "*",
        component: <NotFoundPage />,
      },
    ],
  },
];

export default RouterPages;
