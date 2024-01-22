import { ErrorBoundary } from "@/components/ErrorBoundary";
import Copyright from "@/components/Footer/Copyright";
import DefaultLayoutHeader from "@/components/Header/DefaultLayoutHeader";
import WebMenu from "@/components/Menu/WebMenu";
import TagsView from "@/components/TagsView";
import MenuTagContext from "@/contexts/MenuTagContext";
import FailContainer from "@/pages/FailPage/FailContainer";
import { Alert, Layout, Spin } from "antd";
import { throttle } from "lodash-es";
import { Suspense, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import styles from "./index.module.scss";

const { Content, Sider } = Layout;

const SuspendFallbackLoading = () => (
  <Spin tip="加载中...">
    <Alert message="加载中" description="正在加载页面，不会太久，请稍等。" type="info" />
  </Spin>
);

const DefaultLayout = () => {
  const { setTagPlanVisible, refresh } = useContext(MenuTagContext);

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const clickRemove = () => setTagPlanVisible(false);
    window.addEventListener("click", clickRemove);
    return () => {
      window.removeEventListener("click", clickRemove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resize = throttle(
    () => {
      const winW = document.body.clientWidth;
      setCollapsed(winW < 600);
    },
    500,
    { trailing: true, leading: false }
  );
  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window && window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <Layout className={styles.layout}>
      <ErrorBoundary fallbackRender={FailContainer}>
        <DefaultLayoutHeader />
      </ErrorBoundary>
      <Layout className={styles.content}>
        <Sider className={styles.sider} trigger={null} collapsible collapsed={collapsed} breakpoint="md">
          <WebMenu />
        </Sider>

        <Content className={styles.pageContent}>
          <TagsView />
          <ErrorBoundary fallbackRender={FailContainer}>
            <Suspense fallback={<SuspendFallbackLoading />}>
              <div className={styles.outletContainer}>
                <div className={styles.pageOutlet}>{refresh ? <SuspendFallbackLoading /> : <Outlet />}</div>
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
