import SuspendFallback from "@/components/SuspendFallback";
import { MenuTagContextProvider } from "@/contexts/MenuTagContext";
import { ProjectContextProvider } from "@/contexts/ProjectContext";
import { applyHeaderTheme, buildAntdTheme, readStoredTheme, type ThemeName } from "@/theme/palette";
import { ConfigProvider } from "antd";
import { Suspense, useLayoutEffect, useState } from "react";
import { Outlet } from "react-router";

const ProjectLayout = () => {
  const [theme, setTheme] = useState<ThemeName>(readStoredTheme);

  useLayoutEffect(() => {
    applyHeaderTheme(theme);
  }, [theme]);

  return (
    <ConfigProvider theme={buildAntdTheme(theme)}>
      <ProjectContextProvider theme={theme} setTheme={setTheme}>
        <MenuTagContextProvider>
          <div id="default-layout">
            <Suspense fallback={<SuspendFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </MenuTagContextProvider>
      </ProjectContextProvider>
    </ConfigProvider>
  );
};

export default ProjectLayout;
