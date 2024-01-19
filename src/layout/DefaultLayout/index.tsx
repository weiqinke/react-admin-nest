import { Alert, Layout, Spin } from "antd";
import { Outlet } from "react-router-dom";
import DefaultLayoutHeader from "@/components/Header/DefaultLayoutHeader";
import WebMenu from "@/components/Menu/WebMenu";
import { Suspense, useContext, useEffect } from "react";
import Copyright from "@/components/Footer/Copyright";
import TagsView from "@/components/TagsView";
import MenuTagContext from "@/contexts/MenuTagContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import FailContainer from "@/pages/FailPage/FailContainer";

import styles from "./index.module.scss";

const { Content, Sider } = Layout;

const SuspendFallbackLoading = () => (
  <Spin tip="加载中...">
    <Alert message="加载中" description="正在加载页面，不会太久，请稍等。" type="info" />
  </Spin>
);

const DefaultLayout = () => {
  const { setTagPlanVisible, refresh } = useContext(MenuTagContext);

  useEffect(() => {
    const clickRemove = () => setTagPlanVisible(false);
    window.addEventListener("click", clickRemove);
    return () => {
      window.removeEventListener("click", clickRemove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout className={styles.layout}>
      <ErrorBoundary fallbackRender={FailContainer}>
        <DefaultLayoutHeader />
      </ErrorBoundary>
      <Layout className={styles.content}>
        <Sider className={styles.sider} trigger={null} collapsible collapsed={false} breakpoint="md">
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
