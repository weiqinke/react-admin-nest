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

  useEffect(() => {
    const themeDict = {
      light: "dark",
      dark: "light"
    };
    console.log("ProjectLayout，初始化一次主题色");
    const theme = localStorage.getItem("data-theme") || "light";
    localStorage.setItem("data-theme", themeDict[theme]);
    window.document.documentElement.setAttribute("data-theme", themeDict[theme]);
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
          <div id="default-layout">
            <Outlet />
          </div>
        </MenuTagContextProvider>
      </ProjectContextProvider>
    </ConfigProvider>
  );
};

export default ProjectLayout;
