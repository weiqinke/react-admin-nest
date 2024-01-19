import ProjectRouter from "@/router";
import { RouterProvider } from "react-router-dom";
import { ProjectContextProvider } from "@/contexts/ProjectContext";
import { MenuTagContextProvider } from "@/contexts/MenuTagContext";

import "./index.scss";
import { ConfigProvider } from "antd";
import { webSocketManager } from "@/utils/ws";
import { useEffect } from "react";

const Root = () => {
  const router = ProjectRouter();

  useEffect(() => {
    webSocketManager.create();
    return () => {
      webSocketManager.postMessage({
        name: "qkstartCar",
        type: "123",
        message: "",
        data: [],
      });
      webSocketManager.socket.disconnect();
      webSocketManager.close();
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            darkItemSelectedBg: "#41b3a3",
            // darkPopupBg: "#7cc1ad",
            // darkSubMenuItemBg: "#7cc1ad",
            // darkItemBg: "#7cc1ad",
          },
        },
      }}
    >
      <ProjectContextProvider>
        <MenuTagContextProvider>
          <RouterProvider router={router} />
        </MenuTagContextProvider>
      </ProjectContextProvider>
    </ConfigProvider>
  );
};

export default Root;
