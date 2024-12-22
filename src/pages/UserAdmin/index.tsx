import { UserEditModal } from "@/components/Modals";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Space, message } from "antd";
import { FC, useEffect, useState } from "react";
import { findUsers, updateUser } from "@/api/microservice/user";
import PageIntroduction from "@/components/PageIntroduction";
import UserTable from "./components/Table";

import styles from "./index.module.scss";

const infos = [
  {
    title: "系统设置"
  },
  {
    title: "用户管理"
  }
];

const UserAdmin: FC = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [user, setUser] = useState(null);

  const showDeleteConfirm = (item: any) => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span style={{ color: "red", fontSize: "19px" }}>{`是否${item.banned ? "启用" : "禁用"}该用户？`}</span>,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        const result = await updateUser({ banned: !item.banned });
        if (result.data.code === 200) {
          message.info("操作成功");
          findAll();
          return;
        }
        message.info("操作失败");
      },
      onCancel() {}
    });
  };

  const findAll = () => {
    setUser(null);
    const { username, email, mobile } = form.getFieldsValue();
    const payload = { banned: false, recycle: false };
    if (username) payload.username = username;
    if (email) payload.email = email;
    if (mobile) payload.mobile = mobile;

    findUsers(payload)
      .then(result => {
        if (result.data.code === 200) {
          setDataSource(result.data.data || []);
        } else {
          setDataSource([]);
        }
      })
      .catch(() => {
        setDataSource([]);
      });
  };
  useEffect(findAll, []);
  return (
    <div className={styles.userAdminContainer}>
      <PageIntroduction infos={infos} introduction="本页面是操作系统中的用户，可以用来添加和编辑用户。" />
      <div className={styles.searchContainer}>
        <Form form={form} name="horizontal_login" layout="inline" autoComplete="off" onFinish={findAll}>
          <Form.Item name="username" label="用户名">
            <Input placeholder="username" autoComplete="off" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="email" />
          </Form.Item>
          <Form.Item name="mobile" label="电话">
            <Input placeholder="mobile" />
          </Form.Item>
          <Form.Item>
            <Space size={[8, 16]} className={styles.header}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button type="primary" onClick={() => setUser({})}>
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      <div className={styles.tableContainer}>
        <UserTable dataSource={dataSource} setUser={setUser} showDeleteConfirm={showDeleteConfirm} />
      </div>

      {user && <UserEditModal initUser={user} onOk={() => findAll()} onCancel={() => setUser(null)} />}
    </div>
  );
};

export default UserAdmin;
