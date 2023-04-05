import RouterPages from "@/router/router";
import WrapperRoute from "@/router/WrapperRoute";
import React from "react";
import { useRoutes } from "react-router";

const ProjectRouter = () => {
  const crateROuter = routerItem => {
    routerItem.map(item => {
      item.path = item.url;
      item.element = <WrapperRoute {...item} />;
      if (item.children && item.children.length > 0) crateROuter(item.children);
    });
    return routerItem;
  };

  const GetRouter = () => {
    // 重点是这里，react-router v6 版本中，接收一个数组
    // useRoutes 视为顶层的 Routes
    // 数组每一项默认包裹一个 Route
    return useRoutes(crateROuter(RouterPages));
  };
  return <GetRouter />;
};

export default ProjectRouter;
