import { resetPassword } from "@/api/security";
import { Button, Card, Form, Input, Result, message } from "antd";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

const PasswordReset = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { password: string }) => {
    if (!token) {
      message.error("缺少重置令牌");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, values.password);
      setDone(true);
      message.success("密码已重置");
    } catch {
      /* 拦截器已提示 */
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
        <Result status="warning" title="链接无效" subTitle="请从邮件中的完整链接打开，或重新申请找回密码。" extra={<Link to="/password/forgot">重新申请</Link>} />
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
        <Result
          status="success"
          title="密码已更新"
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
      <Card title="设置新密码">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="password" label="新密码" rules={[{ required: true, min: 6, max: 64, message: "密码长度为 6–64 位" }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认密码"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请再输入一次" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) return Promise.resolve();
                  return Promise.reject(new Error("两次输入不一致"));
                }
              })
            ]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            保存新密码
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default PasswordReset;
