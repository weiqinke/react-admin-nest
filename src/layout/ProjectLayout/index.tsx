import { MenuTagContextProvider } from "@/contexts/MenuTagContext";
import { ProjectContextProvider } from "@/contexts/ProjectContext";
import { webSocketManager } from "@/utils/ws";
import { ConfigProvider } from "antd";
import { useEffect, useLayoutEffect, useState } from "react";
import { Outlet } from "react-router-dom";

const ProjectLayout = () => {
  const [theme, setTheme] = useState(localStorage.getItem("data-theme") || "light");
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
    console.log("theme: ", theme);
    document.body.setAttribute("data-theme", theme);
    if (theme === "dark") {
      setMenusConfig({
        darkItemSelectedBg: "#41b3a3",
        // 选中时菜单颜色 和父级选中颜色
        darkItemSelectedColor: "#fafafc",
        // 未选中的菜单项颜色
        darkItemColor: "#fafafc",
        darkGroupTitleColor: "#000"
      });
      setButtonConfig({
        defaultBg: "#41b3a3",
        primaryColor: "#fff"
      });
    } else {
      // 粉色背景
      setMenusConfig({
        darkItemSelectedBg: "#fedce0",
        darkPopupBg: "#fedce0",
        darkSubMenuItemBg: "#000",
        darkItemBg: "#fedce0",
        // 选中时菜单颜色 和父级选中颜色
        darkItemSelectedColor: "#fafafc",
        darkItemBg: "#001529",
        // 未选中的菜单项颜色
        darkItemColor: "#fafafc",
        darkGroupTitleColor: "#000"
      });

      setButtonConfig({
        defaultBg: "#fedce0",
        primaryColor: "#fff"
      });
    }
  }, [theme]);

  const [menusConfig, setMenusConfig] = useState({
    darkItemSelectedBg: "#41b3a3"
  });

  const [ButtonConfig, setButtonConfig] = useState({
    defaultBg: "#41b3a3",
    primaryColor: "#fff"
  });

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: ButtonConfig,
          Menu: menusConfig
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
