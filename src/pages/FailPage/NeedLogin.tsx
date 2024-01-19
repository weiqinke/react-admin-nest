import { Spin, Alert } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NeedLogin = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Spin tip="加载中...">
        <Alert message="加载中" description="正在加载页面，不会太久，请稍等。" type="info" />
      </Spin>
    </div>
  );
};

export default NeedLogin;
