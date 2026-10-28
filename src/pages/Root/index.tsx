import ProjectRouter from "@/router";
import { RouterProvider } from "react-router/dom";
import { ProjectContextProvider } from "@/contexts/ProjectContext";
import { MenuTagContextProvider } from "@/contexts/MenuTagContext";

import "./index.scss";
import { ConfigProvider } from "antd";
import { webSocketManager } from "@/utils/ws";
import { useEffect } from "react";
import { aether } from "@/styles/aether";

const Root = () => {
  const router = ProjectRouter();

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
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            darkItemBg: aether.ink950,
            darkSubMenuItemBg: aether.ink950,
            darkItemSelectedBg: aether.signal600,
            darkItemSelectedColor: aether.white,
            darkItemColor: aether.ink300
          }
        }
      }}>
      <ProjectContextProvider>
        <MenuTagContextProvider>
          <RouterProvider router={router} />
        </MenuTagContextProvider>
      </ProjectContextProvider>
    </ConfigProvider>
  );
};

export default Root;
