import { MenuTagContextProvider } from "@/contexts/MenuTagContext";
import { ProjectContextProvider } from "@/contexts/ProjectContext";
import { aether } from "@/styles/aether";
import { webSocketManager } from "@/utils/ws";
import { ConfigProvider } from "antd";
import { useEffect, useLayoutEffect, useState } from "react";
import { Outlet } from "react-router";

const menuToken = {
  darkItemBg: aether.ink900,
  darkSubMenuItemBg: aether.ink950,
  darkPopupBg: aether.ink800,
  darkItemColor: aether.ink300,
  darkItemHoverBg: aether.ink800,
  darkItemHoverColor: aether.signal300,
  darkItemSelectedBg: aether.signal900,
  darkItemSelectedColor: aether.signal300,
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

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: aether.signal700,
          colorInfo: aether.info,
          colorSuccess: aether.ok,
          colorWarning: aether.warn,
          colorError: aether.danger,
          colorLink: aether.signal700,
          borderRadius: 8
        },
        components: {
          Layout: {
            bodyBg: aether.ink50,
            headerBg,
            siderBg: aether.ink900
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
