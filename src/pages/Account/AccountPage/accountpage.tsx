import React, { FC, useEffect } from "react";
import { Form, Input, Button, Divider } from "antd";
const AccountPage: FC = () => {
  const [form] = Form.useForm();
  const handleUpdateUser = () => {};
  const userInfo: any = {
    loginName: "",
  };
  useEffect(() => {}, []);

  return (
    <div className="account-setting">
      <Divider orientation="left" plain>
        修改密码
      </Divider>
      <Form layout="vertical" form={form} style={{ width: "300px" }}>
        <Form.Item
          label="登录名"
          name="name"
          initialValue={userInfo.loginName}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input readOnly disabled />
        </Form.Item>
        <Form.Item
          label="新密码"
          name="password"
          rules={[
            {
              required: true,
              message: "请输入新密码",
            },
            {
              pattern: /.{6,}/,
              message: "新密码至少6位",
            },
          ]}
        >
          <Input type="password" maxLength={32} />
        </Form.Item>
        <br />
        <Form.Item>
          <Button type="primary" onClick={handleUpdateUser}>
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AccountPage;
