import { getIndexUrl } from "@/utils/menuUtils";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigator = useNavigate();
  const onClick = () => {
    navigator(getIndexUrl());
  };
  return (
    <Result
      status="404"
      title="404"
      subTitle="此页面丢失了。"
      extra={
        <Button type="primary" onClick={onClick}>
          返回主页
        </Button>
      }
    />
  );
};

export default NotFoundPage;
