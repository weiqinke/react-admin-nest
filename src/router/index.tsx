import NeedLogin from "@/pages/FailPage/NeedLogin";
import { getUserState, subscribeSession, type UserState } from "@/api/session";
import RouterPages from "@/router/router";
import React, { useEffect, useState } from "react";
import { createBrowserRouter } from "react-router";

function useSessionState() {
  const [state, setState] = useState<UserState>(getUserState);
  useEffect(() => subscribeSession(setState), []);
  return state;
}

const WrapperRoute = ({ component, title = "welcome", auth }: { component: React.ReactNode; title?: string; auth?: boolean }) => {
  const { uid, exp } = useSessionState();
  // 父路由先渲染、子路由后渲染，后写的标题才是当前页。
  document.title = title;

  if (!auth) return <>{component}</>;

  const authEndTime = exp ? exp * 1000 : 0;
  if (!uid || !authEndTime || authEndTime <= Date.now()) return <NeedLogin />;
  return <>{component}</>;
};

function toRoutes(items: any[]) {
  return items.map(item => {
    const { component, children, auth, title, ...route } = item;
    const next: any = {
      ...route,
      element: <WrapperRoute component={component} title={title} auth={auth} />
    };
    if (children?.length) next.children = toRoutes(children);
    return next;
  });
}

const ProjectRouter = () => createBrowserRouter(toRoutes(RouterPages));

export default ProjectRouter;
