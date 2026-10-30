import { lazy } from "react";
import { Outlet } from "react-router";

import DefaultLayout from "@/layout/DefaultLayout";
import ProjectLayout from "@/layout/ProjectLayout";
import Login from "@/pages/Login";
import OAuthCallback from "@/pages/OAuth/Callback";
import OAuthError from "@/pages/OAuth/Error";
import Account from "@/pages/Account";
import UserProfile from "@/pages/UserProfile";
import Subscribe from "@/pages/Subscribe";
import MusicChart from "@/pages/MusicChart";
const BMap = lazy(() => import("@/pages/BMap"));
const About = lazy(() => import("@/pages/About"));
const AnimateCard = lazy(() => import("@/pages/AnimateCard"));
const LabelsAdmin = lazy(() => import("@/pages/LabelsAdmin"));
const DictAdmin = lazy(() => import("@/pages/DictAdmin"));
const NoticeAdmin = lazy(() => import("@/pages/NoticeAdmin"));
const MenuAdmin = lazy(() => import("@/pages/MenuAdmin"));
const Workbench = lazy(() => import("@/pages/Workbench"));
const Workplace = lazy(() => import("@/pages/Workplace"));
const PlacardAdmin = lazy(() => import("@/pages/PlacardAdmin"));
const RoleAdmin = lazy(() => import("@/pages/RoleAdmin"));
const PermissionAdmin = lazy(() => import("@/pages/PermissionAdmin"));

const UserAdmin = lazy(() => import("@/pages/UserAdmin"));
const WebsocketAdmin = lazy(() => import("@/pages/WebsocketAdmin"));
const AuditAdmin = lazy(() => import("@/pages/AuditAdmin"));

const AreaChart = lazy(() => import("@/pages/Chart/AreaChart"));
const NotFoundPage = lazy(() => import("@/pages/FailPage/NotFoundPage"));

const D3Example = lazy(() => import("@/pages/D3Example"));

const RouterPages: any = [
  {
    component: <ProjectLayout />,
    children: [
      {
        path: "login",
        component: <Login />,
        auth: false,
        title: "Login"
      },
      {
        path: "oauth/callback",
        component: <OAuthCallback />,
        auth: false,
        title: "OAuth Callback"
      },
      {
        path: "oauth/error",
        component: <OAuthError />,
        auth: false,
        title: "OAuth Error"
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
            title: "工作台"
          },
          {
            path: "workbench",
            component: <Workbench />,
            auth: true,
            title: "工作台"
          },
          {
            path: "music",
            component: <MusicChart />,
            auth: true,
            title: "音乐排行榜"
          },
          {
            path: "bmap",
            component: <BMap />,
            auth: true,
            title: "百度地图"
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
                title: "AreaCharts"
              },
              {
                path: "d3example",
                component: <D3Example />,
                auth: true,
                title: "D3图例",
                loader: async () => {
                  // return { info: "我是打开页面的时候，传递来的数据" };
                  return null;
                }
                // errorElement: <ErrorBoundary />, // 假如 loader 或者 action 返回了错误，就渲染这个组件
              },
              {
                path: "animate",
                component: <AnimateCard />,
                auth: true,
                title: "D3图例"
              }
            ]
          },
          {
            path: "management",
            title: "系统管理",
            component: <Outlet />,
            children: [
              {
                path: "useradmin",
                component: <UserAdmin />,
                title: "useradmin"
              },
              {
                path: "menuadmin",
                component: <MenuAdmin />,
                title: "menuadmin"
              },
              {
                path: "roleadmin",
                component: <RoleAdmin />,
                title: "roleadmin"
              },
              {
                path: "permissionadmin",
                component: <PermissionAdmin />,
                title: "permissionadmin"
              },
              {
                path: "labelsadmin",
                component: <LabelsAdmin />,
                title: "labelsadmin"
              },
              {
                path: "dictadmin",
                component: <DictAdmin />,
                title: "字典管理"
              },
              {
                path: "noticeadmin",
                component: <NoticeAdmin />,
                title: "站内信管理"
              },
              {
                path: "placardadmin",
                component: <PlacardAdmin />,
                title: "公告管理"
              },
              {
                path: "websocketadmin",
                component: <WebsocketAdmin />,
                title: "在线用户管理"
              },
              {
                path: "auditadmin",
                component: <AuditAdmin />,
                title: "操作审计"
              },
              {
                path: "*",
                component: <NotFoundPage />,
                title: "notFound"
              }
            ]
          },
          {
            path: "about",
            component: <About />,
            auth: true,
            title: "关于"
          },
          {
            path: "account",
            component: <Account />,
            auth: true,
            title: "个人信息"
          },
          {
            path: "profile",
            component: <UserProfile />,
            auth: true,
            title: "个人中心"
          },
          {
            path: "subscribe",
            component: <Subscribe />,
            auth: true,
            title: "订阅"
          },

          {
            path: "",
            component: <About />,
            auth: true,
            title: "关于"
          },
          {
            path: "*",
            component: <NotFoundPage />,
            auth: true,
            title: "NotFound"
          }
        ]
      },
      {
        path: "*",
        component: <NotFoundPage />
      }
    ]
  }
];

export default RouterPages;
