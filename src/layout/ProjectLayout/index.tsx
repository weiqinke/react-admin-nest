import { MenuTagContextProvider } from "@/contexts/MenuTagContext";
import { ProjectContextProvider } from "@/contexts/ProjectContext";
import { aether } from "@/styles/aether";
import { webSocketManager } from "@/utils/ws";
import { ConfigProvider } from "antd";
import { useEffect, useLayoutEffect, useState } from "react";
import { Outlet } from "react-router";

const menuToken = {
  darkItemBg: aether.ink950,
  darkSubMenuItemBg: aether.ink950,
  darkPopupBg: aether.ink800,
  darkItemColor: aether.ink300,
  darkItemHoverBg: aether.ink800,
  darkItemHoverColor: aether.white,
  darkItemSelectedBg: aether.signal600,
  darkItemSelectedColor: aether.white,
  darkGroupTitleColor: aether.ink300
};

const ProjectLayout = () => {
  const [theme, setTheme] = useState(localStorage.getItem("data-theme") || "dark");
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

  useLayoutEffect(() => {
    localStorage.setItem("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const headerBg = theme === "dark" ? aether.ink900 : aether.white;
  const siderBg = aether.ink950;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: aether.signal600,
          colorInfo: aether.info,
          colorSuccess: aether.ok,
          colorWarning: aether.warn,
          colorError: aether.danger,
          colorLink: aether.signal600,
          borderRadius: 8
        },
        components: {
          Layout: {
            bodyBg: aether.ink50,
            headerBg,
            siderBg
          },
          Menu: menuToken
        }
      }}>
      <ProjectContextProvider theme={theme} setTheme={setTheme}>
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
