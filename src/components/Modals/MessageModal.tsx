import { Modal } from "antd";
import React, { FC, useEffect } from "react";

const MessageModal: FC<any> = ({ title = "提示", pendingCallback, content, okText = "确认", cancelText = "取消" }) => {
  const onOkSubmit = async () => {
    pendingCallback(true);
  };
  const CancelSubmit = () => {
    pendingCallback(false);
  };

  useEffect(() => {}, []);

  return (
    <Modal title={title} open onOk={onOkSubmit} onCancel={CancelSubmit} okText={okText} cancelText={cancelText}>
      <p>{content}</p>
    </Modal>
  );
};

export default MessageModal;
