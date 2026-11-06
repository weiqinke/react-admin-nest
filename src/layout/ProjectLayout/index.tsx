import { buttonLoadingIcon, spinIndicator } from "@/components/LoadingRing";
import SuspendFallback from "@/components/SuspendFallback";
import { useAppStore } from "@/stores/app";
import MenuTagSync from "@/stores/MenuTagSync";
import { buildAntdTheme } from "@/theme/palette";
import { ConfigProvider } from "antd";
import { Suspense } from "react";
import { Outlet } from "react-router";

const ProjectLayout = () => {
  const theme = useAppStore(state => state.theme);

  return (
    <ConfigProvider theme={buildAntdTheme(theme)} spin={{ indicator: spinIndicator }} button={{ loadingIcon: buttonLoadingIcon }}>
      <MenuTagSync />
      <div id="default-layout">
        <Suspense fallback={<SuspendFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </ConfigProvider>
  );
};

export default ProjectLayout;
