import { AppstoreOutlined, MailOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu, Modal } from "antd";
import React, { FC, useEffect } from "react";

interface ModalMessageProps {
  title: string;
  onOk: any;
  onCancel: any;
  content: any;
  okText: string;
  cancelText: string;
}

const ModalMessage: FC<ModalMessageProps> = ({ title, onOk, onCancel, content, okText, cancelText }) => {
  useEffect(() => {}, []);

  return (
    <Modal open title={title || "提示"} cancelText={cancelText || "取消"} onOk={onOk} onCancel={onCancel} okText={okText || "确认"}>
      <Menu
        selectedKeys={[]}
        mode="horizontal"
        items={[
          { key: "mail", icon: <MailOutlined />, label: "Navigation One" },
          { key: "app", icon: <AppstoreOutlined />, label: "Navigation Two", disabled: true },
          {
            key: "SubMenu",
            icon: <SettingOutlined />,
            label: "Navigation Three - Submenu",
            children: [
              {
                type: "group",
                label: "Item 1",
                children: [
                  { key: "setting:1", label: "Option 1" },
                  { key: "setting:2", label: "Option 2" }
                ]
              },
              {
                type: "group",
                label: "Item 2",
                children: [
                  { key: "setting:3", label: "Option 3" },
                  { key: "setting:4", label: "Option 4" }
                ]
              }
            ]
          },
          {
            key: "alipay",
            label: (
              <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
                Navigation Four - Link
              </a>
            )
          }
        ]}
      />
      <p>{content} </p>
    </Modal>
  );
};

export default ModalMessage;
