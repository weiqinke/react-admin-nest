import Copyright from "@/components/Footer/Copyright";
import DefaultLayoutHeader from "@/components/Headers/DefaultLayoutHeader";
import { SuspendFallbackLoading } from "@/components/Loadings";
import DefaultMenu from "@/components/Menus/DefaultMenu";
import MenuTagContext from "@/contexts/MenuTagContext";
import TagsView from "@/pages/TagsView";
import { Layout } from "antd";
import React, { Suspense, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import styles from "./index.module.scss";

const { Sider, Content } = Layout;

const WorkLayout = () => {
  const { setTagPlanVisible, refresh } = useContext(MenuTagContext);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    const clickRemove = () => setTagPlanVisible(false);
    window.addEventListener("click", clickRemove);
    return () => {
      window.removeEventListener("click", clickRemove);
    };
  }, []);

  return (
    <Layout>
      <Layout>
        <DefaultLayoutHeader />
        <Layout>
          <Sider className={styles.sider} trigger={null} collapsible collapsed={false} breakpoint="md">
            <DefaultMenu />
          </Sider>
          <Content className={styles.pageContent}>
            <TagsView />
            <Suspense fallback={<SuspendFallbackLoading />}>
              <div className={styles.outletContainer}>
                <div className={styles.pageOutlet}>{refresh ? <SuspendFallbackLoading /> : <Outlet />}</div>
                <Copyright />
              </div>
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default WorkLayout;
