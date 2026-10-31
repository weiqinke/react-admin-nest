import { getMe, getMyMenus } from "@/api/goadmin";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Copyright from "@/components/Footer/Copyright";
import DefaultLayoutHeader from "@/components/Header/DefaultLayoutHeader";
import WebMenu from "@/components/Menu/WebMenu";
import TagsView from "@/components/TagsView";
import MenuTagContext from "@/contexts/MenuTagContext";
import ProjectContext from "@/contexts/ProjectContext";
import FailContainer from "@/pages/FailPage/FailContainer";
import { Layout, Modal } from "antd";
import { Suspense, useContext, useEffect, useState } from "react";
import { adaptApiMenus, saveMenus } from "@/utils/menuUtils";
import { throttle } from "@/utils/throttle";
import { webSocketManager } from "@/utils/ws";
import { getAccessToken } from "@/api/session";
import { Outlet, useLocation, useNavigate } from "react-router";
import styles from "./index.module.scss";
import SuspendFallback from "@/components/SuspendFallback";
import AnnouncementGate from "@/components/AnnouncementGate";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import StepUpHost from "@/components/StepUpHost";

const { Content, Sider } = Layout;

const DefaultLayout = () => {
  const { refreshKey, refreshing } = useContext(MenuTagContext);
  const { theme } = useContext<any>(ProjectContext);
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // 入场动画只在路由切换时播；真刷新用 loading，避免像重新进路由。
  const [enterMotion, setEnterMotion] = useState(true);
  // 等权限/菜单就绪后再挂载页面，避免先挂再因 accessRevision 整页重挂。
  const [accessReady, setAccessReady] = useState(false);

  useEffect(() => {
    setEnterMotion(true);
    const timer = window.setTimeout(() => setEnterMotion(false), 200);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (getAccessToken()) webSocketManager.create();
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMe(), getMyMenus()])
      .then(([me, menus]) => {
        if (cancelled) return;
        const user = me.data?.data;
        if (me.data?.code === 0 && user) {
          localStorage.setItem("permissions", JSON.stringify(user.permissions || []));
          localStorage.setItem("roles", JSON.stringify(user.roles || []));
          localStorage.setItem("active_roles", JSON.stringify(user.active_roles || []));
          if (user.must_change_password) {
            localStorage.setItem("must_change_password", "1");
            Modal.warning({
              title: "须先修改密码",
              content: "管理员要求你立即改密，改密前无法进行其它写操作。",
              okText: "去改密",
              onOk: () => navigate("/account")
            });
          } else {
            localStorage.removeItem("must_change_password");
          }
        }
        if (menus.data?.code === 0) {
          saveMenus(JSON.stringify(adaptApiMenus(menus.data.data?.list || [])));
          window.dispatchEvent(new Event("menus:refresh"));
        }
        setAccessReady(true);
      })
      .catch(() => {
        if (!cancelled) setAccessReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    const onMustChange = () => {
      if (!pathname.startsWith("/account")) navigate("/account");
    };
    window.addEventListener("auth:must-change-password", onMustChange);
    return () => window.removeEventListener("auth:must-change-password", onMustChange);
  }, [navigate, pathname]);

  useEffect(() => {
    const resize = throttle(
      () => {
        const winW = document.body.clientWidth;
        setCollapsed(winW < 600);
      },
      500,
      { trailing: true, leading: false }
    );
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <Layout className={styles.layout}>
      <ErrorBoundary FallbackComponent={FailContainer}>
        <DefaultLayoutHeader />
        <MaintenanceBanner />
        <AnnouncementGate />
        <StepUpHost />
      </ErrorBoundary>
      <Layout className={styles.content}>
        <Sider className={styles.sider} theme={theme === "dark" ? "dark" : "light"} trigger={null} collapsible collapsed={collapsed} breakpoint="md">
          <WebMenu />
        </Sider>

        <Content className={styles.pageContent}>
          <TagsView />
          <ErrorBoundary FallbackComponent={FailContainer} resetKeys={[pathname, refreshKey]}>
            <Suspense fallback={<SuspendFallback />}>
              <div className={styles.outletContainer}>
                <div className={styles.pageOutlet}>
                  {!accessReady || refreshing ? (
                    <SuspendFallback />
                  ) : (
                    <div key={`${pathname}-${refreshKey}`} className={enterMotion ? styles.pageEnter : undefined}>
                      <Outlet />
                    </div>
                  )}
                </div>
                <Copyright />
              </div>
            </Suspense>
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DefaultLayout;
