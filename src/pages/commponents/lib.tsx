import React from 'react';
import { Spin, Typography } from 'antd';
export const FullPageLoading = () => (
  <div>
    <Spin size={'large'} />
  </div>
);

export const FullPageErrorFallback = ({ error }: { error: Error | null }) => (
  <div>
    <ErrorBox error={error} />
  </div>
);

// 类型守卫
const isError = (value: any): value is Error => value?.message;

export const ErrorBox = ({ error }: { error: unknown }) => {
  if (isError(error)) {
    return <Typography.Text type={'danger'}>{error?.message}</Typography.Text>;
  }
  return null;
};
