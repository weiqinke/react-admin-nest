import ProjectContext from "@/contexts/ProjectContext";
import NeedLogin from "@/pages/FailPage/NeedLogin";
import RouterPages from "@/router/router";
import React, { useContext } from "react";
import { createBrowserRouter } from "react-router-dom";

const WrapperRoute = (props: any) => {
  const { component, title = "welcome", auth } = props;
  document.title = title;
  const { value: data }: any = useContext(ProjectContext);
  const { uid, exp } = data;
  const value = new Date().valueOf();
  const authEndTime = new Date(exp * 1000).valueOf();
  // 权限到期了，就跳转到 login
  if (authEndTime <= value) return <NeedLogin />;
  if (auth) {
    // 如果该菜单需要权限检查
    if (!uid) return <NeedLogin />;
  }
  // 权限到期了，就跳转到 login
  return <React.Fragment children={component} />;
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
