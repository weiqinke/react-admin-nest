import { createConfirmation } from "@/api/security";
import { registerStepUpPrompt } from "@/utils/stepUp";
import { Form, Input, Modal, Radio, message } from "antd";
import { useEffect, useState } from "react";

type Mode = "password" | "totp";

/**
 * 挂在已登录布局内，承接拦截器的 Step-up 请求。
 */
const StepUpHost = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("敏感操作确认");
  const [mode, setMode] = useState<Mode>("password");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [resolver, setResolver] = useState<((token: string | null) => void) | null>(null);

  useEffect(() => {
    registerStepUpPrompt(askTitle => {
      setTitle(askTitle || "敏感操作确认");
      setMode("password");
      form.resetFields();
      setOpen(true);
      return new Promise<string | null>(resolve => {
        setResolver(() => resolve);
      });
    });
    return () => registerStepUpPrompt(null);
  }, [form]);

  const finish = (token: string | null) => {
    setOpen(false);
    setLoading(false);
    resolver?.(token);
    setResolver(null);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = mode === "totp" ? { totp_code: values.value } : { password: values.value };
      const res = await createConfirmation(payload);
      const token = res.data?.data?.token;
      if (!token) {
        message.error("未拿到确认令牌");
        setLoading(false);
        return;
      }
      finish(String(token));
    } catch {
      setLoading(false);
    }
  };

  return (
    <Modal title={title} open={open} okText="确认" cancelText="取消" confirmLoading={loading} destroyOnHidden onCancel={() => finish(null)} onOk={submit}>
      <Radio.Group
        value={mode}
        onChange={e => {
          setMode(e.target.value);
          form.resetFields();
        }}
        options={[
          { label: "密码", value: "password" },
          { label: "TOTP", value: "totp" }
        ]}
        style={{ marginBottom: 12 }}
      />
      <Form form={form} layout="vertical">
        <Form.Item name="value" rules={[{ required: true, message: mode === "totp" ? "请输入 TOTP" : "请输入密码" }]}>
          {mode === "totp" ? <Input placeholder="6 位验证码" maxLength={8} /> : <Input.Password placeholder="当前登录密码" />}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StepUpHost;
