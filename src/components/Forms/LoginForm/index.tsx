import { accountlogin, getUserMenus } from "@/api/caravan/Login";
import ProjectContext from "@/contexts/ProjectContext";
import { getUserState } from "@/utils/core";
import { saveMenus } from "@/utils/menuUtils";
import { getIndexUrlInfo, ProjectParseMenuAsPre, SaveMeUrl } from "@/utils/menuUtils";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import CaptchaMini from "captcha-mini";
import React, { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { webSocketManager } from "@/utils/ws";
import styles from "./index.module.scss";
import MenuTagContext from "@/contexts/MenuTagContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { setValue } = useContext(ProjectContext);
  const { setTags } = useContext(MenuTagContext);
  const inputRef = useRef();

  useEffect(() => {
    if (!inputRef.current) return;
    let captcha2 = new CaptchaMini({
      lineWidth: 1, //线条宽度
      lineNum: 4, //线条数量
      dotR: 2, //点的半径
      dotNum: 15, //点的数量
      preGroundColor: [10, 80], //前景色区间
      backGroundColor: [150, 250], //背景色区间
      fontSize: 25, //字体大小
      fontFamily: ["Georgia", "微软雅黑", "Helvetica", "Arial"], //字体类型
      fontStyle: "stroke", //字体绘制方法，有fill和stroke
      content: "abcdefghijkmnpqrstuvw", //验证码内容
      length: 4 //验证码长度
    });
    captcha2.draw(inputRef.current, r => console.log(r, "验证码2"));
  }, []);

  const onFinish = values => {
    accountlogin({ ...values, logintype: "web" }).then(r => {
      if (r.data.code === 200) {
        const { avatar, name, email, nick, roles, signature, title, token } = r.data.data;
        localStorage.setItem("nick", nick);
        localStorage.setItem("loginState", true);
        localStorage.setItem("token", token);
        localStorage.setItem("nick", nick);
        localStorage.setItem("avatar", avatar);
        setValue(getUserState());
        getMenuData();
      }
    });
  };

  const getMenuData = () => {
    getUserMenus({ version: 2 }).then(r => {
      if (r.data.code === 200) {
        const cacheMenu = r.data.data;
        if (!cacheMenu) return message.info("暂未分配权限，请通知管理员分配权限");
        saveMenus(JSON.stringify(cacheMenu));
        const allMenusInfo = SaveMeUrl(ProjectParseMenuAsPre(cacheMenu.concat()), "");
        //找到第一个url直接跳转过去吧
        const indexTag = getIndexUrlInfo(allMenusInfo);
        const { meUrl } = indexTag;
        const from = { pathname: meUrl };
        setTags([]);
        navigate(from);
      }
    });
  };

  const onFinishFailed = errorInfo => {
    console.log("Failed:", errorInfo);
  };

  const initialValues = { remember: true };

  useEffect(() => {
    webSocketManager.postMessage({
      type: "ResetUserName",
      data: {
        userName: localStorage.getItem("nick")
      }
    });
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>欢迎登录</h1>
      <Form name="basic" initialValues={initialValues} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
        <Form.Item name="name" rules={[{ required: true, message: "请输入用户名!" }]}>
          <Input placeholder="qkstart" prefix={<UserOutlined />} />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: "请输入密码!" }]}>
          <Input type="password" placeholder={"123456"} prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item className={styles.captchaLogin}>
          <Form.Item name="captcha" rules={[{ required: true, message: "请输入验证码!" }]} noStyle>
            <Input placeholder="请输入验证码" className={styles.captchaInput} />
          </Form.Item>
          <canvas width="140" height="32" id="captchaLogin" ref={inputRef} className={styles.captchaContainer} title="看不清？点击换一张。"></canvas>
        </Form.Item>

        <div className={styles.other}>
          <Form.Item name="remember" valuePropName="checked" noStyle wrapperCol={12}>
            <Checkbox>记住登录状态</Checkbox>
          </Form.Item>
          <Form.Item noStyle wrapperCol={12}>
            <span className={styles.forgetPassword}>忘记密码</span>
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
    </div>
  );
};

export default LoginForm;
