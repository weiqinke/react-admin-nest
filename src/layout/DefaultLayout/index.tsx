import { ErrorBoundary } from "@/components/ErrorBoundary";
import Copyright from "@/components/Footer/Copyright";
import DefaultLayoutHeader from "@/components/Header/DefaultLayoutHeader";
import WebMenu from "@/components/Menu/WebMenu";
import TagsView from "@/components/TagsView";
import MenuTagContext from "@/contexts/MenuTagContext";
import FailContainer from "@/pages/FailPage/FailContainer";
import { Layout } from "antd";
import "animate.css";
import { throttle } from "lodash-es";
import { Suspense, useContext, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import styles from "./index.module.scss";
import SuspendFallback from "@/components/SuspendFallback";

const { Content, Sider } = Layout;
const pageMotion = "animate__animated animate__fadeInUp";

const DefaultLayout = () => {
  const { refreshKey, refreshing } = useContext(MenuTagContext);
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  // 入场动画只在路由切换时播；真刷新用 loading，避免像重新进路由。
  const [enterMotion, setEnterMotion] = useState(true);

  useEffect(() => {
    setEnterMotion(true);
    const timer = window.setTimeout(() => setEnterMotion(false), 350);
    return () => window.clearTimeout(timer);
  }, [pathname]);

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
      </ErrorBoundary>
      <Layout className={styles.content}>
        <Sider className={styles.sider} trigger={null} collapsible collapsed={collapsed} breakpoint="md">
          <WebMenu />
        </Sider>

        <Content className={styles.pageContent}>
          <TagsView />
          <ErrorBoundary FallbackComponent={FailContainer} resetKeys={[pathname, refreshKey]}>
            <Suspense fallback={<SuspendFallback />}>
              <div className={styles.outletContainer}>
                <div className={styles.pageOutlet}>
                  {refreshing ? (
                    <SuspendFallback />
                  ) : (
                    <div
                      key={`${pathname}-${refreshKey}`}
                      className={`${enterMotion ? pageMotion : ""} ${styles.pageEnter}`.trim()}>
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
