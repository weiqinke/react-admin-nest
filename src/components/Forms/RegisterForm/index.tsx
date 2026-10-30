import { userRegister } from "@/api/user";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import styles from "./index.module.scss";

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,32}$/;

type RegisterFormProps = {
  goBack: () => void;
  onRegistered: (username: string) => void;
  setCloseEyes: (close: boolean) => void;
};

type Level = {
  score: number;
  label: string;
  tone: "weak" | "fair" | "good" | "strong";
};

function passwordLevel(password: string): Level {
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(pattern => pattern.test(password)).length;
  if (password.length < 6) return { score: 1, label: "至少 6 位", tone: "weak" };
  const score = Math.min(4, Math.max(1, kinds + (password.length >= 12 ? 1 : 0)));
  const levels: Level[] = [
    { score: 1, label: "较弱", tone: "weak" },
    { score: 2, label: "一般", tone: "fair" },
    { score: 3, label: "良好", tone: "good" },
    { score: 4, label: "较强", tone: "strong" }
  ];
  return levels[score - 1];
}

const PasswordMeter = ({ password }: { password: string }) => {
  if (!password) return <span className={styles.hint}>6–64 位，建议混合大小写、数字和符号</span>;
  const level = passwordLevel(password);
  return (
    <div className={styles.meter} role="status" aria-label={`密码强度：${level.label}`}>
      <div className={styles.track} aria-hidden>
        {[1, 2, 3, 4].map(step => (
          <span key={step} className={styles.segment} data-tone={step <= level.score ? level.tone : undefined} />
        ))}
      </div>
      <span className={styles.meterLabel} data-tone={level.tone}>
        {level.label}
      </span>
    </div>
  );
};

const RegisterForm = ({ goBack, onRegistered, setCloseEyes }: RegisterFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const password = Form.useWatch("password", form) ?? "";

  const coverEyes = () => setCloseEyes(true);
  const openEyes = () => setCloseEyes(false);

  const back = () => {
    openEyes();
    goBack();
  };

  const onFinish = async (value: { username: string; password: string }) => {
    if (loading) return;
    const username = value.username.trim();
    setLoading(true);
    try {
      await userRegister({ username, password: value.password });
      message.success(`注册成功，请使用 ${username} 登录`);
      openEyes();
      onRegistered(username);
    } catch {
      setLoading(false);
    }
  };

  const revalidate = (name: string) => {
    if (form.getFieldError(name).length) form.validateFields([name]).catch(() => undefined);
  };

  const onValuesChange = (changed: Record<string, string>) => {
    if ("username" in changed) revalidate("username");
    if ("password" in changed) {
      revalidate("password");
      if (form.getFieldValue("confirm")) form.validateFields(["confirm"]).catch(() => undefined);
    }
    if ("confirm" in changed) revalidate("confirm");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Nest-Admin</h1>
      <p className={styles.subtitle}>创建账号</p>
      <Form form={form} name="register" validateTrigger="onBlur" autoComplete="off" onValuesChange={onValuesChange} onFinish={onFinish}>
        <Form.Item
          name="username"
          getValueFromEvent={event => String(event.target.value).replace(/\s/g, "")}
          rules={[
            {
              validator(_, value) {
                const text = String(value || "");
                if (!text) return Promise.reject(new Error("请输入用户名"));
                if (!USERNAME_PATTERN.test(text)) return Promise.reject(new Error("用户名为 3–32 位字母、数字或下划线"));
                return Promise.resolve();
              }
            }
          ]}>
          <Input
            prefix={<UserOutlined />}
            placeholder="3–32 位字母、数字或下划线"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={32}
            allowClear
            onFocus={openEyes}
            onBlur={openEyes}
          />
        </Form.Item>

        <Form.Item
          name="password"
          className={styles.passwordItem}
          rules={[
            {
              validator(_, value) {
                const text = String(value || "");
                if (!text) return Promise.reject(new Error("请输入密码"));
                if (text.length < 6 || text.length > 64) return Promise.reject(new Error("密码需要 6–64 位"));
                return Promise.resolve();
              }
            }
          ]}
          extra={<PasswordMeter password={password} />}>
          <Input.Password prefix={<LockOutlined />} placeholder="6–64 位" autoComplete="new-password" maxLength={64} onFocus={coverEyes} onBlur={openEyes} />
        </Form.Item>

        <Form.Item
          name="confirm"
          rules={[
            { required: true, message: "请再次输入密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) return Promise.resolve();
                return Promise.reject(new Error("两次输入的密码不一致"));
              }
            })
          ]}>
          <Input.Password prefix={<LockOutlined />} placeholder="确认密码" autoComplete="new-password" maxLength={64} onFocus={coverEyes} onBlur={openEyes} />
        </Form.Item>

        <Form.Item className={styles.submit}>
          <Button block type="primary" htmlType="submit" loading={loading}>
            注册
          </Button>
        </Form.Item>
      </Form>
      <button type="button" className={styles.back} onClick={back}>
        返回登录
      </button>
    </div>
  );
};

export default RegisterForm;
