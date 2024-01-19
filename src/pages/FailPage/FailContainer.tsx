import { Button, Result } from "antd";

const FailContainer = ({ resetErrorBoundary }) => {
  return (
    <Result
      status="warning"
      title="组件渲染失败！"
      extra={
        <Button type="primary" onClick={resetErrorBoundary}>
          重新渲染
        </Button>
      }
    />
  );
};

export default FailContainer;
