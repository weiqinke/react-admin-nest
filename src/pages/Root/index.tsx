import { GlobalContextProvider } from "@/contexts/GlobalContext";
import { IntlContextProvider } from "@/contexts/IntlContextProvider";
import { MenuTagContextProvider } from "@/contexts/MenuTagContext";
import { ProjectContextProvider } from "@/contexts/ProjectContext";
import ProjectRouter from "@/router";
import { webSocketManager } from "@/utils/ws";
import React, { useEffect } from "react";

import "./index.scss";

const Root = () => {
  // 根节点可以分成两块
  // 第一块：判断当前环境，判断用户是否登录
  // 第二块：渲染登录界面或者首页

  useEffect(() => {
    webSocketManager.create();
    return () => {
      webSocketManager.postMessage({
        name: "qkstartCar",
        type: "123",
        message: "",
        data: []
      });
      webSocketManager.socket.disconnect();
      webSocketManager.close();
    };
  }, []);

  return (
    <GlobalContextProvider>
      <ProjectContextProvider>
        <MenuTagContextProvider>
          <IntlContextProvider>
            <ProjectRouter />
          </IntlContextProvider>
        </MenuTagContextProvider>
      </ProjectContextProvider>
    </GlobalContextProvider>
  );
};

export default Root;
