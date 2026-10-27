import { Button, Form, Input, Spin, message } from "antd";

import { userRegister } from "@/api/caravan/User";
import { useState } from "react";
import styles from "./index.module.scss";

const RegisterForm = ({ goBack, setCloseEyes }) => {
  const initialValues = { username: "newuser", password: "123456", submitpassword: "123456" };
  const [loading, setLoading] = useState(false);

  const onFinish = value => {
    setLoading(true);
    userRegister({ username: value.username, password: value.password })
      .then(() => {
        message.success("注册成功，请登录");
        goBack();
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  };

  const onBlur = () => {
    setCloseEyes(false);
  };
  const onFocus = () => {
    setCloseEyes(true);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Nest-Admin</h1>
      <div>
        <Spin spinning={loading} delay={500} tip="Registering">
          <Form
            name="basic"
            initialValues={initialValues}
            onFinish={onFinish}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            style={{ maxWidth: 600 }}
            autoComplete="off">
            <Form.Item label="用户名称" name="username" rules={[{ required: true, message: "Please input your username!" }]}>
              <Input onBlur={onBlur} onFocus={onFocus} />
            </Form.Item>

            <Form.Item label="用户密码" name="password" rules={[{ required: true, message: "Please input your password!" }]}>
              <Input.Password onBlur={onBlur} onFocus={onFocus} />
            </Form.Item>

            <Form.Item
              label="确认密码"
              name="submitpassword"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Please input your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次密码不匹配"));
                  }
                })
              ]}>
              <Input.Password onBlur={onBlur} onFocus={onFocus} />
            </Form.Item>

            <Form.Item wrapperCol={{ span: 24 }}>
              <Button type="primary" htmlType="submit" block>
                注册
              </Button>
            </Form.Item>
          </Form>
          <Button type="link" block onClick={goBack}>
            返回登录
          </Button>
        </Spin>
      </div>
    </div>
  );
};

export default RegisterForm;
