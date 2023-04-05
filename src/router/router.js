import React, { lazy } from "react";
import { Outlet } from "react-router";
import DefaultLayout from "@/layout/DefaultLayout";
import WorkLayout from "@/layout/WorkLayout";
import Dashboard from "@/pages/Dashboard";
import NotAuthPage from "@/pages/FailPage/NotAuthPage";
import NotFoundPage from "@/pages/FailPage/NotFoundPage";
import Login from "@/pages/Login";
import MenuAdmin from "@/pages/MenuAdmin";
import UserAdmin from "@/pages/UserAdmin";
import RoleAdmin from "@/pages/RoleAdmin";
import Workbench from "@/pages/Workbench";
import LabelsAdmin from "@/pages/LabelsAdmin";
import PlacardAdmin from "@/pages/PlacardAdmin";
import ArticlesList from "@/pages/ArticlesList";
import ArticlesEdit from "@/pages/ArticlesEdit";
import ArticlesInfo from "@/pages/ArticlesInfo";
import AreaChart from "@/pages/Chart/AreaChart";
import Account from "@/pages/Account";
import WsOnlineList from "@/pages/WsOnlineList";

const Detail = lazy(() => import(/* webpackChunkName: "Detail'"*/ "@/pages/Detail"));

const Workplace = lazy(() => import(/* webpackChunkName: "Workplace'"*/ "@/pages/Workplace"));

const RouterPages = [
  {
    url: "/login",
    comp: <Login />,
    auth: false,
    title: "Login",
  },
  {
    url: "/test",
    comp: <WorkLayout />,
    title: "WorkLayout",
    auth: true,
    children: [
      {
        url: "/test",
        comp: <NotAuthPage />,
        title: "NotAuthPage",
        exact: true,
      },
      {
        url: "/test/dashboard",
        comp: <Dashboard />,
        title: "dashboard",
      },
      {
        url: "/test/workplace",
        comp: <Dashboard />,
        title: "workplace",
      },

      {
        url: "*",
        comp: <NotAuthPage />,
        title: "NotAuthPage",
      },
    ],
  },
  {
    url: "/",
    comp: <DefaultLayout />,
    title: "WorkLayout",
    auth: true,
    children: [
      {
        url: "dashboard",
        comp: <Dashboard />,
        title: "dashboard",
      },
      {
        url: "workbench",
        comp: <Workbench />,
        title: "workbench",
      },
      {
        url: "Workplace",
        comp: <Workplace />,
        title: "Workplace",
      },
      {
        url: "management",
        title: "系统管理",
        comp: <Outlet />,
        children: [
          {
            url: "useradmin",
            comp: <UserAdmin />,
            title: "useradmin",
          },
          {
            url: "menuadmin",
            comp: <MenuAdmin />,
            title: "menuadmin",
          },
          {
            url: "roleadmin",
            comp: <RoleAdmin />,
            title: "roleadmin",
          },
          {
            url: "labelsadmin",
            comp: <LabelsAdmin />,
            title: "labelsadmin",
          },
          {
            url: "placardadmin",
            comp: <PlacardAdmin />,
            title: "placardadmin",
          },

          {
            url: "*",
            comp: <NotFoundPage />,
            title: "notFound",
          },
        ],
      },
      {
        url: "articles",
        title: "散文",
        comp: <Outlet />,
        children: [
          {
            url: "articleslist",
            comp: <ArticlesList />,
            title: "articleslist",
          },
          {
            url: "articlesedit",
            comp: <ArticlesEdit />,
            title: "articlesedit",
          },
          {
            url: "articlesinfo",
            comp: <ArticlesInfo />,
            title: "articlesinfo",
          },
          {
            url: "*",
            comp: <NotFoundPage />,
            title: "notFound",
          },
        ],
      },
      {
        url: "charts",
        title: "图表模块",
        comp: <Outlet />,
        children: [
          {
            url: "AreaCharts",
            comp: <AreaChart />,
            title: "AreaCharts",
          },
          {
            url: "WsOnlineList",
            comp: <WsOnlineList />,
            title: "WsOnlineList",
          },
        ],
      },
      {
        url: "accounts",
        title: "accounts",
        comp: <Outlet />,
        children: [
          {
            url: "AccountPages",
            comp: <Account />,
            title: "AccountPages",
          },
        ],
      },
      {
        url: "*",
        comp: <Workbench />,
        title: "Workbench",
      },
    ],
  },
  {
    url: "*",
    comp: <NotFoundPage />,
    title: "NotFoundPage",
  },
];

export default RouterPages;
