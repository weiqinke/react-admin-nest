import NeedLogin from "@/pages/FailPage/NeedLogin";
import DefaultLayout from "@/layout/DefaultLayout";
import ProjectLayout from "@/layout/ProjectLayout";
import Login from "@/pages/Login";
import OAuthCallback from "@/pages/OAuth/Callback";
import OAuthError from "@/pages/OAuth/Error";
import AppShell from "@/router/shell";
import { isSessionValid, useRouteSession, type RouteHandle } from "@/router/session";
import { lazy, type ComponentType } from "react";
import { Outlet, type RouteObject } from "react-router";

const Account = lazy(() => import("@/pages/Account"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Subscribe = lazy(() => import("@/pages/Subscribe"));
const MusicChart = lazy(() => import("@/pages/MusicChart"));
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

type RouteOptions = {
  path?: string;
  index?: boolean;
  title?: string;
  auth?: boolean;
  loader?: RouteObject["loader"];
  children?: RouteObject[];
};

function guard(Page: ComponentType) {
  return function GuardedRoute() {
    const session = useRouteSession();
    if (!isSessionValid(session)) return <NeedLogin />;
    return <Page />;
  };
}

function route(Page: ComponentType, options: RouteOptions = {}): RouteObject {
  const handle: RouteHandle = {};
  if (options.title !== undefined) handle.title = options.title;
  if (options.auth !== undefined) handle.auth = options.auth;
  const Component = options.auth ? guard(Page) : Page;

  if (options.index) {
    return { index: true, handle, Component };
  }

  return {
    path: options.path,
    handle,
    Component,
    loader: options.loader,
    children: options.children
  };
}

const routes: RouteObject[] = [
  {
    Component: AppShell,
    children: [
      {
        Component: ProjectLayout,
        children: [
          route(Login, { path: "login", auth: false, title: "Login" }),
          route(OAuthCallback, { path: "oauth/callback", auth: false, title: "OAuth Callback" }),
          route(OAuthError, { path: "oauth/error", auth: false, title: "OAuth Error" }),
          route(DefaultLayout, {
            path: "/",
            auth: true,
            children: [
              route(Workplace, { path: "workplace", auth: true, title: "工作台" }),
              route(Workbench, { path: "workbench", auth: true, title: "工作台" }),
              route(MusicChart, { path: "music", auth: true, title: "音乐排行榜" }),
              route(BMap, { path: "bmap", auth: true, title: "百度地图" }),
              route(Outlet, {
                path: "charts",
                title: "图表模块",
                auth: true,
                children: [
                  route(AreaChart, { path: "AreaCharts", title: "AreaCharts" }),
                  route(D3Example, {
                    path: "d3example",
                    auth: true,
                    title: "D3图例",
                    loader: async () => {
                      // return { info: "我是打开页面的时候，传递来的数据" };
                      return null;
                    }
                    // errorElement: <ErrorBoundary />, // 假如 loader 或者 action 返回了错误，就渲染这个组件
                  }),
                  route(AnimateCard, { path: "animate", auth: true, title: "D3图例" })
                ]
              }),
              route(Outlet, {
                path: "management",
                title: "系统管理",
                children: [
                  route(UserAdmin, { path: "useradmin", title: "useradmin" }),
                  route(MenuAdmin, { path: "menuadmin", title: "menuadmin" }),
                  route(RoleAdmin, { path: "roleadmin", title: "roleadmin" }),
                  route(PermissionAdmin, { path: "permissionadmin", title: "permissionadmin" }),
                  route(LabelsAdmin, { path: "labelsadmin", title: "labelsadmin" }),
                  route(DictAdmin, { path: "dictadmin", title: "字典管理" }),
                  route(NoticeAdmin, { path: "noticeadmin", title: "站内信管理" }),
                  route(PlacardAdmin, { path: "placardadmin", title: "公告管理" }),
                  route(WebsocketAdmin, { path: "websocketadmin", title: "在线用户管理" }),
                  route(AuditAdmin, { path: "auditadmin", title: "操作审计" }),
                  route(NotFoundPage, { path: "*", title: "notFound" })
                ]
              }),
              route(About, { path: "about", auth: true, title: "关于" }),
              route(Account, { path: "account", auth: true, title: "个人信息" }),
              route(UserProfile, { path: "profile", auth: true, title: "个人中心" }),
              route(Subscribe, { path: "subscribe", auth: true, title: "订阅" }),
              route(About, { index: true, auth: true, title: "关于" }),
              route(NotFoundPage, { path: "*", auth: true, title: "NotFound" })
            ]
          }),
          route(NotFoundPage, { path: "*" })
        ]
      }
    ]
  }
];

export default routes;
