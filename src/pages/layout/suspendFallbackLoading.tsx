import React, { FC } from 'react';
import { Spin, Alert } from 'antd';

const SuspendFallbackLoading: FC = () => {
  return (
    <Spin tip="加载中...">
      <Alert message="加载中" description="正在加载页面，不会太久，请稍等。" type="info" />
    </Spin>
  );
};

export default SuspendFallbackLoading;
