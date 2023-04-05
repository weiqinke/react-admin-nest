import { AppstoreOutlined, MailOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu, Modal, PageHeader } from "antd";
import React, { FC, useEffect } from "react";

const { SubMenu } = Menu;

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
    <Modal visible title={title || "提示"} cancelText={cancelText || "取消"} onOk={onOk} onCancel={onCancel} okText={okText || "确认"}>
      <PageHeader className="site-page-header" onBack={() => null} title="Title" subTitle="This is a subtitle" />

      <Menu selectedKeys={[]} mode="horizontal">
        <Menu.Item key="mail" icon={<MailOutlined />}>
          Navigation One
        </Menu.Item>
        <Menu.Item key="app" disabled icon={<AppstoreOutlined />}>
          Navigation Two
        </Menu.Item>
        <SubMenu key="SubMenu" icon={<SettingOutlined />} title="Navigation Three - Submenu">
          <Menu.ItemGroup title="Item 1">
            <Menu.Item key="setting:1">Option 1</Menu.Item>
            <Menu.Item key="setting:2">Option 2</Menu.Item>
          </Menu.ItemGroup>
          <Menu.ItemGroup title="Item 2">
            <Menu.Item key="setting:3">Option 3</Menu.Item>
            <Menu.Item key="setting:4">Option 4</Menu.Item>
          </Menu.ItemGroup>
        </SubMenu>
        <Menu.Item key="alipay">
          <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
            Navigation Four - Link
          </a>
        </Menu.Item>
      </Menu>
      <p>{content} </p>
    </Modal>
  );
};

export default ModalMessage;
