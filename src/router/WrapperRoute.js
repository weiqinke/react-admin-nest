import ProjectContext from "@/contexts/ProjectContext";
import NeedLogin from "@/pages/FailPage/NeedLogin";
import NotFoundPage from "@/pages/FailPage/NotFoundPage";
import React, { useContext } from "react";

const WrapperRoute = props => {
  const { url, comp, title = "welcome", auth } = props;
  document.title = title;
  const data = useContext(ProjectContext);
  const { uid, exp } = data;
  const value = new Date().valueOf();
  const authEndTime = new Date(exp * 1000);
  // 权限到期了，就跳转到 login
  if (authEndTime <= value) return <NeedLogin />;
  if (auth) {
    // 查看是否登录
    if (!uid) return <NeedLogin />;
    return uid ? <React.Fragment children={comp} /> : <NotFoundPage />;
  } else {
    return <React.Fragment children={comp} />;
  }
};

export default WrapperRoute;
