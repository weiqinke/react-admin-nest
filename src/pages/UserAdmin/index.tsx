import { UserEditModal } from "@/components/Modals";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Modal, Space, message } from "antd";
import { FC, useEffect, useState } from "react";
import { dataScopeLabel } from "@/api/platform";
import { getUserState } from "@/api/session";
import { findUsers, resetUserPassword, setUserStatus } from "@/api/user";
import PageIntroduction from "@/components/PageIntroduction";
import UserTable from "./components/Table";

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
  const [resetForm] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [dataScope, setDataScope] = useState("");
  const [user, setUser] = useState(null);
  const [resetFor, setResetFor] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const selfId = String(getUserState().uid || "");

  const showDeleteConfirm = (item: any) => {
    const id = String(item.id || item.uid || "");
    if (!item.banned && id === selfId) {
      message.warning("不能停用当前登录账号");
      return;
    }
    const nextStatus = item.banned ? 1 : 0;
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: item.banned ? "是否启用该用户？" : "是否停用该用户？停用后会踢掉该用户的全部会话。",
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        await setUserStatus(id, nextStatus);
        message.success(nextStatus === 0 ? "已停用" : "已启用");
        findAll();
      }
    });
  };

  const submitReset = async (values: { password: string }) => {
    if (!resetFor) return;
    setResetting(true);
    try {
      const id = String(resetFor.id || resetFor.uid);
      await resetUserPassword(id, values.password);
      message.success(id === selfId ? "密码已重置，请重新登录" : "密码已重置，该用户需要重新登录");
      setResetFor(null);
      resetForm.resetFields();
    } finally {
      setResetting(false);
    }
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
        if (result.data.code === 0) {
          setDataSource(result.data.data || []);
          setDataScope(result.data.data_scope || "");
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
    <div className="p-3">
      <PageIntroduction
        infos={infos}
        introduction="用户列表已按当前角色的数据范围过滤。新建账号由管理员创建，停用会踢掉对方全部会话，重置密码后对方需要重新登录。"
      />
      {dataScope ? (
        <Alert className="mt-3" type="info" showIcon title={`当前数据范围：${dataScopeLabel(dataScope)}`} />
      ) : null}
      <div className="my-3 rounded-md bg-white p-3">
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
            <Space size={[8, 16]}>
              <Button htmlType="submit">查询</Button>
              <Button onClick={() => setUser({})}>添加</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      <div className="mt-3 rounded-md bg-white">
        <UserTable dataSource={dataSource} selfId={selfId} setUser={setUser} showDeleteConfirm={showDeleteConfirm} onReset={setResetFor} />
      </div>

      {user && <UserEditModal initUser={user} onOk={() => findAll()} onCancel={() => setUser(null)} />}
      <Modal
        open={!!resetFor}
        title={`重置密码：${resetFor?.username || ""}`}
        confirmLoading={resetting}
        okText="重置"
        cancelText="取消"
        destroyOnHidden
        onOk={() => resetForm.submit()}
        onCancel={() => {
          setResetFor(null);
          resetForm.resetFields();
        }}>
        <Form form={resetForm} layout="vertical" onFinish={submitReset}>
          <Form.Item
            name="password"
            label="新密码"
            extra="提交后对方全部会话失效。页面不会回显密码。"
            rules={[
              { required: true, message: "请填写新密码" },
              { min: 6, max: 64, message: "密码长度为 6-64 位" }
            ]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserAdmin;
