import MenuTagContext from "@/contexts/MenuTagContext";
import ProjectContext from "@/contexts/ProjectContext";
import { getUserState } from "@/utils/core";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Divider, Form, Image, Input, Spin, Tooltip, message } from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { getCaptcha, login } from "@/api/auth";
import { getStoredTrustToken, storeTrustToken } from "@/api/trust";
import { saveLoginSession } from "@/api/session";
import qrimg from "@/assets/qrcode.png";
import IconFont from "@/components/IconFont";
import styles from "./index.module.scss";
import GiteeAuth from "@/components/OAuth2/GiteeAuth";
import GithubAuth from "@/components/OAuth2/GithubAuth";

const LoginForm = ({ setRegister, setCloseEyes, username: registeredUser, allowRegister = true }) => {
  const navigate = useNavigate();
  const { setValue }: any = useContext(ProjectContext);
  const { setTags } = useContext(MenuTagContext);

  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [needTotp, setNeedTotp] = useState(false);
  const [captcha, setCaptcha] = useState({ id: "", image: "" });
  const [form] = Form.useForm();

  const loadCaptcha = useCallback(() => {
    getCaptcha()
      .then(res => {
        const data = res.data?.data || {};
        setCaptcha({ id: data.captcha_id || "", image: data.image || "" });
      })
      .catch(() => setCaptcha({ id: "", image: "" }));
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  const onFinish = async values => {
    if (!captcha.id) {
      message.warning("验证码未就绪，请点击图片刷新");
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, any> = {
        username: values.username,
        password: values.password,
        captcha_id: captcha.id,
        captcha_code: values.captcha_code
      };
      if (needTotp && values.totp_code) payload.totp_code = String(values.totp_code).trim();
      if (values.remember_device) payload.remember_device = true;
      const trust = getStoredTrustToken();
      if (trust) payload.trust_token = trust;
      const result = await login(payload);
      saveLoginSession(result.data.data);
      if (result.data.data?.trust_token) storeTrustToken(result.data.data.trust_token);
      if (result.data.data?.must_change_password) {
        localStorage.setItem("must_change_password", "1");
      } else {
        localStorage.removeItem("must_change_password");
      }
      setValue(getUserState());
      try {
        const [{ getMyMenus }, { adaptApiMenus, saveMenus }] = await Promise.all([import("@/api/goadmin"), import("@/utils/menuUtils")]);
        const menus = await getMyMenus();
        const list = adaptApiMenus(menus.data?.data?.list || []);
        saveMenus(JSON.stringify(list));
      } catch (error) {
        console.log("当前用户菜单获取失败", error);
      }
      const { webSocketManager } = await import("@/utils/ws");
      webSocketManager.create();
      setTags([]);
      navigate(result.data.data?.must_change_password ? "/account" : "/workplace");
    } catch (error: any) {
      if (error?.code === 40306) {
        setNeedTotp(true);
        message.warning("请输入双因素验证码");
      }
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = errorInfo => {
    console.log("Failed:", errorInfo);
  };

  const initialValues = registeredUser ? { remember: true, username: registeredUser, password: "" } : { remember: true, username: "admin", password: "admin123" };

  const onBlur = () => {
    setCloseEyes(false);
  };
  const onFocus = () => {
    setCloseEyes(true);
  };
  return (
    <div className={styles.container}>
      <div className={styles.changeQR} onClick={() => setIsFlipped(v => !v)}>
        <Tooltip placement="left" title={`${isFlipped ? "密码" : "扫码"}登录`}>
          <div className={styles.code} />
        </Tooltip>
      </div>
      <h1 className={styles.title}>Nest-Admin</h1>
      <div className={`${styles.flip} ${isFlipped ? styles.flipped : ""}`}>
        <div className={styles.flipInner}>
          <div className={styles.front}>
            <Spin spinning={loading} delay={500}>
              <Form form={form} name="basic" initialValues={initialValues} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                <Form.Item name="username" rules={[{ required: true, message: "请输入用户名!" }]}>
                  <Input placeholder="admin" prefix={<UserOutlined />} onBlur={onBlur} onFocus={onFocus} />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: "请输入密码!" }]}>
                  <Input type="password" placeholder={registeredUser ? "请输入刚设置的密码" : "admin123"} prefix={<LockOutlined />} onBlur={onBlur} onFocus={onFocus} />
                </Form.Item>

                <Form.Item className={styles.captchaLogin}>
                  <Form.Item name="captcha_code" rules={[{ required: true, message: "请输入验证码!" }]} noStyle>
                    <Input placeholder="请输入验证码" className={styles.captchaInput} onBlur={onBlur} onFocus={onFocus} />
                  </Form.Item>
                  <img
                    src={captcha.image || undefined}
                    alt="captcha"
                    width={140}
                    height={32}
                    className={styles.captchaContainer}
                    title="看不清？点击换一张。"
                    onClick={loadCaptcha}
                  />
                </Form.Item>

                {needTotp ? (
                  <Form.Item name="totp_code" rules={[{ required: true, message: "请输入双因素验证码" }]}>
                    <Input placeholder="6 位 TOTP 验证码" maxLength={8} onBlur={onBlur} onFocus={onFocus} />
                  </Form.Item>
                ) : null}

                <Form.Item name="remember_device" valuePropName="checked" style={{ marginBottom: 8 }}>
                  <Checkbox>记住此设备</Checkbox>
                </Form.Item>

                <div className={styles.other}>
                  {allowRegister ? (
                    <Form.Item noStyle>
                      <span className={styles.register} onClick={setRegister}>
                        注册账号
                      </span>
                    </Form.Item>
                  ) : null}
                  <Form.Item noStyle>
                    <span className={styles.forgetPassword} onClick={() => navigate("/password/forgot")}>
                      忘记密码
                    </span>
                  </Form.Item>
                </div>
                <div className={styles.submit}>
                  <Form.Item noStyle>
                    <Button block type="primary" htmlType="submit">
                      登录
                    </Button>
                  </Form.Item>
                </div>
              </Form>

              <Divider plain style={{ borderWidth: 13 }}>
                第三方登录
              </Divider>
              <div className={styles.ohter}>
                <div className={styles.type}>
                  <Button type="link" href="https://ssr.nest-admin.com">
                    <IconFont type="icon-cib-next-js" />
                    SSR
                  </Button>
                </div>
                <div className={styles.type}>
                  <GiteeAuth />
                </div>
                <div className={styles.type}>
                  <GithubAuth />
                </div>
              </div>
            </Spin>
          </div>
          <div className={`${styles.card} ${styles.back}`}>
            <Image width={200} src={qrimg} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
