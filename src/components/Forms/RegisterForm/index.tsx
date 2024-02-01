import { Button, Form, Input, Spin, message } from "antd";

import { userMenus, userRegister } from "@/api/caravan/User";
import ProjectContext from "@/contexts/ProjectContext";
import { SYSTEM_TOKEN, getMenuStructure, getUserState } from "@/utils/core";
import { ProjectParseMenuAsPre, getIndexUrlInfo, saveMenus } from "@/utils/menuUtils";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";

const RegisterForm = ({ goBack }) => {
  const initialValues = { username: "qkstart", password: "123456", submitpassword: "123456" };
  const [loading, setLoading] = useState(false);
  const { setValue }: any = useContext(ProjectContext);
  const navigate = useNavigate();

  const getMenu = uid => {
    userMenus({ uid, version: 1 }).then(r => {
      if (r.data.code === 200) {
        const data = r.data.data;
        if (!data) return message.info("暂未分配权限，请通知管理员分配权限");
        const menus = getMenuStructure(data);
        saveMenus(JSON.stringify(menus));
        //找到第一个url直接跳转过去吧
        const indexTag = getIndexUrlInfo(ProjectParseMenuAsPre(menus));
        const { url } = indexTag;
        navigate(`/${url}`);
      }
    });
  };

  const onFinish = value => {
    setLoading(true);
    userRegister(value)
      .then(res => {
        const { data, code } = res.data;
        if (code === 200) {
          const { token, uid } = data;
          localStorage.setItem(SYSTEM_TOKEN, token);
          localStorage.setItem("uid", uid);
          // 更新内存中的用户信息
          const userState = getUserState();
          setValue(userState);
          //   获取用户菜单
          getMenu(userState.uid);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
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
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            autoComplete="off">
            <Form.Item label="用户名称" name="username" rules={[{ required: true, message: "Please input your username!" }]}>
              <Input />
            </Form.Item>

            <Form.Item label="用户密码" name="password" rules={[{ required: true, message: "Please input your password!" }]}>
              <Input.Password />
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
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ xs: { span: 24 }, sm: { offset: 8 }, md: { offset: 8 }, lg: { offset: 8 } }}>
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
