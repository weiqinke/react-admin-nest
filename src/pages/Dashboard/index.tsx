import ModalMessage from "@/components/Modals/ModalMessage";
import { Button } from "antd";
import React, { useState } from "react";

const Dashboard = () => {
  const [visible, setVisible] = useState<any>();
  return (
    <div>
      <Button onClick={() => setVisible(true)}>显示弹窗</Button>
      {visible && (
        <ModalMessage onOk={() => setVisible(false)} onCancel={() => setVisible(false)} okText="确认" title="" content={undefined} cancelText={""} />
      )}
    </div>
  );
};

export default Dashboard;
