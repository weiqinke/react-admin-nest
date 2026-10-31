import { forgotPassword } from "@/api/security";
import { Button, Card, Form, Input, Result, message } from "antd";
import { useState } from "react";
import { Link } from "react-router";

const PasswordForgot = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { account: string }) => {
    setLoading(true);
    try {
      await forgotPassword(values.account.trim());
      setSent(true);
      message.success("若账号存在且邮件已启用，重置链接已发送");
    } catch {
      /* 拦截器已提示 */
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
        <Result
          status="success"
          title="请查收邮件"
          subTitle="按邮件中的链接重置密码。链接有时效，过期请重新申请。"
          extra={
            <Link to="/login">
              <Button type="primary">返回登录</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
      <Card title="找回密码">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="account" label="用户名" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input placeholder="登录用户名" autoComplete="username" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            发送重置邮件
          </Button>
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Link to="/login">返回登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default PasswordForgot;
