import ProjectContext from "@/contexts/ProjectContext";
import NotAuthPage from "@/pages/FailPage/NotAuthPage";
import NotFoundPage from "@/pages/FailPage/NotFoundPage";
import React, { useContext } from "react";

const PrivateComponent = props => {
  const { url } = props;
  const { uid } = useContext(ProjectContext);
  const findPage = true;
  // const OkStatus = isMyMenusUrl(menuList, '/' + url.split('/').join('/'));
  if (uid && url && !findPage) {
    // 没找到此菜单 说明不允许看此页面
    return <NotAuthPage />;
  }
  //此处用菜单验证，认为菜单返回的就是此人真正的菜单
  return uid ? <div>123</div> : <NotFoundPage />;
};

export default PrivateComponent;
