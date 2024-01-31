import { MenuTagContextProvider } from "@/contexts/MenuTagContext";
import { ProjectContextProvider } from "@/contexts/ProjectContext";
import { webSocketManager } from "@/utils/ws";
import { ConfigProvider } from "antd";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const ProjectLayout = () => {
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
            darkItemSelectedBg: "#41b3a3"
            // darkPopupBg: "#7cc1ad",
            // darkSubMenuItemBg: "#7cc1ad",
            // darkItemBg: "#7cc1ad",
          }
        }
      }}>
      <ProjectContextProvider>
        <MenuTagContextProvider>
          <Outlet />
        </MenuTagContextProvider>
      </ProjectContextProvider>
    </ConfigProvider>
  );
};

export default ProjectLayout;
