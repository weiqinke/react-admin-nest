import type { FallbackProps } from "@/components/ErrorBoundary";
import { Button, Result, Typography } from "antd";

const FailContainer = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <Result
      status="warning"
      title="组件渲染失败"
      subTitle={import.meta.env.DEV ? error.message : "请点击下方按钮重试"}
      extra={
        <Button type="primary" onClick={resetErrorBoundary}>
          重新渲染
        </Button>
      }>
      {import.meta.env.DEV && error.stack ? (
        <Typography.Paragraph
          type="secondary"
          style={{ textAlign: "left", maxHeight: 160, overflow: "auto", fontSize: 12 }}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{error.stack}</pre>
        </Typography.Paragraph>
      ) : null}
    </Result>
  );
};

export default FailContainer;
