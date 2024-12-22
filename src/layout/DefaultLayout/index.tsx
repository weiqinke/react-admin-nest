import { ErrorBoundary } from "@/components/ErrorBoundary";
import Copyright from "@/components/Footer/Copyright";
import DefaultLayoutHeader from "@/components/Header/DefaultLayoutHeader";
import WebMenu from "@/components/Menu/WebMenu";
import TagsView from "@/components/TagsView";
import MenuTagContext from "@/contexts/MenuTagContext";
import FailContainer from "@/pages/FailPage/FailContainer";
import { Layout } from "antd";
import { throttle } from "lodash-es";
import { Suspense, useContext, useEffect, useState } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { Outlet, useLocation } from "react-router-dom";
import styles from "./index.module.scss";
import SuspendFallback from "@/components/SuspendFallback";

const { Content, Sider } = Layout;

const DefaultLayout = () => {
  const location = useLocation();
  const { setTagPlanVisible, refresh } = useContext(MenuTagContext);
  const [collapsed, setCollapsed] = useState(false);

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
    const clickRemove = () => setTagPlanVisible();
    window.addEventListener("click", clickRemove);

    window.addEventListener("resize", resize);
    return () => {
      window && window.removeEventListener("resize", resize);
      window.removeEventListener("click", clickRemove);
    };
  }, [setTagPlanVisible]);

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
            <Suspense fallback={<SuspendFallback />}>
              <div className={styles.outletContainer}>
                <div className={styles.pageOutlet}>
                  <div style={{ display: `${refresh ? "" : "none"}` }}>
                    <SuspendFallback />
                  </div>
                  <div style={{ display: `${refresh ? "none" : ""}` }}>
                    <SwitchTransition>
                      <CSSTransition key={location.pathname} timeout={100} classNames="transformOutletitem">
                        <div>
                          <Outlet />
                        </div>
                      </CSSTransition>
                    </SwitchTransition>
                  </div>
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
