import React, { useEffect, FC } from 'react';
import { Modal } from 'antd';

const ModalMessage: FC<any> = (props: any) => {
  const { title, pendingCallback, visible, content, okText, cancelText } = props;

  const onOkSubmit = async () => {
    pendingCallback(true);
  };
  const CancelSubmit = () => {
    pendingCallback(false);
  };

  useEffect(() => {}, []);

  return (
    <Modal
      title={title || '提示'}
      visible={visible}
      onOk={onOkSubmit}
      onCancel={CancelSubmit}
      okText={okText || '确认'}
      cancelText={cancelText || '取消'}
    >
      <p>{content}</p>
    </Modal>
  );
};
export default ModalMessage;
