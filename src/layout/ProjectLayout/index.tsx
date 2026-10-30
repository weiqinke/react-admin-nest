import { MenuTagContextProvider } from "@/contexts/MenuTagContext";
import { ProjectContextProvider } from "@/contexts/ProjectContext";
import { applyHeaderTheme, buildAntdTheme, readStoredTheme, type ThemeName } from "@/theme/palette";
import { webSocketManager } from "@/utils/ws";
import { ConfigProvider } from "antd";
import { useEffect, useLayoutEffect, useState } from "react";
import { Outlet } from "react-router";

const ProjectLayout = () => {
  const [theme, setTheme] = useState<ThemeName>(readStoredTheme);

  useEffect(() => {
    webSocketManager.create();
  }, []);

  useLayoutEffect(() => {
    applyHeaderTheme(theme);
  }, [theme]);

  return (
    <ConfigProvider theme={buildAntdTheme(theme)}>
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
