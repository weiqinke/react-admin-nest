import { SuspendFallbackLoading } from "@/components/Loadings";
import ProjectContext from "@/contexts/ProjectContext";
import { Button, Layout } from "antd";
import React, { Suspense, useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";

import styles from "./index.module.scss";

const { Sider, Content } = Layout;

const WorkLayout = () => {
  const navigate = useNavigate();
  const { setValue } = useContext(ProjectContext);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);
  }, []);

  const onClick = () => {
    localStorage.removeItem("token");
    setValue({});
    navigate("/login");
  };

  return (
    <Layout className="layout-page">
      <Layout className="layout-page-main">
        <Sider className={`layout-page ${styles.sider}`} trigger={null} collapsible collapsed={false} breakpoint="md">
          <div>Slider</div>
          <Button onClick={onClick}>退出登录</Button>
        </Sider>
        <Content className="layout-page-content">
          <Suspense fallback={<div>加载中</div>}>{visible ? <SuspendFallbackLoading /> : <Outlet />}</Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default WorkLayout;
