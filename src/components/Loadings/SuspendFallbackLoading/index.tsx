import { Alert, Spin } from "antd";
import React from "react";

const SuspendFallbackLoading = () => (
  <Spin tip="加载中...">
    <Alert message="加载中" description="正在加载页面，不会太久，请稍等。" type="info" />
  </Spin>
);

export default SuspendFallbackLoading;
