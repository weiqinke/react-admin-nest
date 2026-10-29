import ProjectContext from "@/contexts/ProjectContext";
import NeedLogin from "@/pages/FailPage/NeedLogin";
import RouterPages from "@/router/router";
import React, { useContext } from "react";
import { createBrowserRouter } from "react-router";

const WrapperRoute = (props: any) => {
  const { component, title = "welcome", auth } = props;
  document.title = title;
  // 公开页（login / oauth 回调）不做登录态校验，避免过期 token 打断 OAuth 回调。
  if (!auth) return <>{component}</>;

  const { value: data }: any = useContext(ProjectContext);
  const { uid, exp } = data;
  const now = Date.now();
  const authEndTime = exp ? exp * 1000 : 0;
  if (!uid || !authEndTime || authEndTime <= now) return <NeedLogin />;
  return <>{component}</>;
};

const ProjectRouter = () => {
  const crateROuter = (routerItem: string | any[]) => {
    const routers = [];
    for (let i = 0; i < routerItem.length; i++) {
      const item = routerItem[i];
      item.element = <WrapperRoute {...item} />;
      if (item.children && item.children.length > 0) {
        item.children = crateROuter(item.children);
      }
      routers.push(item);
    }
    return routers;
  };

  return createBrowserRouter(crateROuter(RouterPages));
};

export default ProjectRouter;
