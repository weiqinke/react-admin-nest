import { acceptInvite } from "@/api/ops";
import { Button, Card, Form, Input, Result, message } from "antd";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

const InviteAccept = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    if (!token) {
      message.error("邀请链接无效");
      return;
    }
    setLoading(true);
    try {
      await acceptInvite(token, values.username.trim(), values.password);
      setDone(true);
      message.success("账号已创建");
    } catch {
      /* 拦截器已提示 */
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
        <Result status="warning" title="缺少邀请令牌" subTitle="请使用邮件中的完整链接打开本页。" extra={<Link to="/login">返回登录</Link>} />
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
        <Result
          status="success"
          title="邀请已接受"
          subTitle="账号已创建，请使用刚设置的用户名和密码登录。"
          extra={
            <Link to="/login">
              <Button type="primary">去登录</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
      <Card title="接受邀请">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: "请输入用户名" },
              { min: 3, max: 32, message: "3–32 个字符" }
            ]}>
            <Input placeholder="登录用户名" autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: "请设置密码" },
              { min: 6, max: 64, message: "密码长度为 6-64 位" }
            ]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认密码"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请再次输入密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) return Promise.resolve();
                  return Promise.reject(new Error("两次密码不一致"));
                }
              })
            ]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            创建账号
          </Button>
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Link to="/login">返回登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default InviteAccept;
