import { getMe, getMyMenus } from "@/api/goadmin";
import { ErrorBoundary, type FallbackProps } from "@/components/ErrorBoundary";
import Copyright from "@/components/Footer/Copyright";
import DefaultLayoutHeader from "@/components/Header/DefaultLayoutHeader";
import WebMenu from "@/components/Menu/WebMenu";
import TagsView from "@/components/TagsView";
import MenuTagContext from "@/contexts/MenuTagContext";
import ProjectContext from "@/contexts/ProjectContext";
import { Layout, Modal } from "antd";
import { lazy, Suspense, useContext, useEffect, useState } from "react";
import { adaptApiMenus, getLocalStorageMenus, saveMenus } from "@/utils/menuUtils";
import { throttle } from "@/utils/throttle";
import { webSocketManager } from "@/utils/ws";
import { getAccessToken } from "@/api/session";
import { Outlet, useLocation, useNavigate } from "react-router";
import styles from "./index.module.scss";
import SuspendFallback from "@/components/SuspendFallback";
import AnnouncementGate from "@/components/AnnouncementGate";
import MaintenanceBanner from "@/components/MaintenanceBanner";
const StepUpHost = lazy(() => import("@/components/StepUpHost"));
const FailContainer = lazy(() => import("@/pages/FailPage/FailContainer"));

function LazyFail(props: FallbackProps) {
  return (
    <Suspense fallback={null}>
      <FailContainer {...props} />
    </Suspense>
  );
}

const { Content, Sider } = Layout;

function hasCachedShell() {
  try {
    const menus = JSON.parse(getLocalStorageMenus());
    const permissions = JSON.parse(localStorage.getItem("permissions") || "null");
    return Array.isArray(menus) && menus.length > 0 && Array.isArray(permissions);
  } catch {
    return false;
  }
}

const DefaultLayout = () => {
  const { refreshKey, refreshing } = useContext(MenuTagContext);
  const { theme } = useContext<any>(ProjectContext);
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // 入场动画只在路由切换时播；真刷新用 loading，避免像重新进路由。
  const [enterMotion, setEnterMotion] = useState(true);
  // 有上次的菜单和权限就先画出页面，接口回来再刷新菜单。没有缓存时仍等这两笔请求。
  const [accessReady, setAccessReady] = useState(hasCachedShell);
  const [needStepUp, setNeedStepUp] = useState(false);

  useEffect(() => {
    setEnterMotion(true);
    const timer = window.setTimeout(() => setEnterMotion(false), 200);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (getAccessToken()) webSocketManager.create();
  }, []);

  useEffect(() => {
    const onNeed = () => setNeedStepUp(true);
    window.addEventListener("stepup:need", onNeed);
    return () => window.removeEventListener("stepup:need", onNeed);
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
      <ErrorBoundary FallbackComponent={LazyFail}>
        <DefaultLayoutHeader />
        <MaintenanceBanner />
        <AnnouncementGate />
        {needStepUp ? (
          <Suspense fallback={null}>
            <StepUpHost />
          </Suspense>
        ) : null}
      </ErrorBoundary>
      <Layout className={styles.content}>
        <Sider className={styles.sider} theme={theme === "dark" ? "dark" : "light"} trigger={null} collapsible collapsed={collapsed} breakpoint="md">
          <WebMenu />
        </Sider>

        <Content className={styles.pageContent}>
          <TagsView />
          <ErrorBoundary FallbackComponent={LazyFail} resetKeys={[pathname, refreshKey]}>
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
