import MenuTagContext from "@/contexts/MenuTagContext";
import ProjectContext from "@/contexts/ProjectContext";
import { getMenuStructure, getUrlParam, getUserState } from "@/utils/core";
import { ProjectParseMenuAsPre, getIndexUrlInfo, saveMenus } from "@/utils/menuUtils";
import { webSocketManager } from "@/utils/ws";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Image, Input, Spin, Tooltip, message } from "antd";
import CaptchaMini from "captcha-mini";
import { useContext, useEffect, useRef, useState } from "react";
import ReactCardFlip from "react-card-flip";
import { useNavigate } from "react-router-dom";

import { login, userMenus, userOAuth2 } from "@/api/microservice/user";
import qrimg from "@/assets/qrcode.png";
import IconFont from "@/components/IconFont";
import styles from "./index.module.scss";

const LoginForm = ({ setRegister }) => {
  const navigate = useNavigate();
  const { setValue }: any = useContext(ProjectContext);
  const { setTags } = useContext(MenuTagContext);
  const inputRef = useRef();

  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const code = getUrlParam("code");
    const state = getUrlParam("state");
    if (code) {
      setLoading(true);
      userOAuth2({
        code,
        state
      })
        .then(res => {
          // debugger;
          if (res.data.code === 200) {
            const { avatar, nick, token, uid } = res.data.data;
            localStorage.setItem("nick", nick);
            localStorage.setItem("loginState", "1");
            localStorage.setItem("token", token);
            localStorage.setItem("nick", nick);
            localStorage.setItem("avatar", avatar || "");
            setValue(getUserState());
            getMenuData(uid);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (!inputRef.current) return;
    const captcha2 = new CaptchaMini({
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
    login({ ...values, logintype: "web" }).then(r => {
      if (r.data.code === 200) {
        const { avatar, nick, token, uid } = r.data.data;
        localStorage.setItem("uid", uid);
        localStorage.setItem("nick", nick);
        localStorage.setItem("loginState", "1");
        localStorage.setItem("token", token);
        localStorage.setItem("nick", nick);
        localStorage.setItem("avatar", avatar);
        setValue(getUserState());
        getMenuData(uid);
      }
    });
  };

  const getMenuData = uid => {
    userMenus({ uid, version: 1 }).then(r => {
      const data = r.data.data;
      if (!data) return message.info("暂未分配权限，请通知管理员分配权限");
      const menus = getMenuStructure(data);
      saveMenus(JSON.stringify(menus));
      webSocketManager.postMessage({
        type: "ResetUserName",
        data: {
          token: localStorage.getItem("token")
        }
      });
      setTags([]);
      //找到第一个url直接跳转过去吧
      const indexTag = getIndexUrlInfo(ProjectParseMenuAsPre(menus));
      const { url } = indexTag;
      navigate(`/${url}`);
      // 登录以后，还要把socket名字改掉
    });
  };

  const onFinishFailed = errorInfo => {
    console.log("Failed:", errorInfo);
  };

  const initialValues = { remember: true, loginName: "qkstart", password: "123456" };

  useEffect(() => {
    webSocketManager.postMessage({
      type: "ResetUserName",
      data: {
        token: localStorage.getItem("token")
      }
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.changeQR} onClick={() => setIsFlipped(v => !v)}>
        <Tooltip placement="left" title={`${isFlipped ? "密码" : "扫码"}登录`}>
          <div className={styles.code} />
        </Tooltip>
      </div>
      <h1 className={styles.title}>Nest-Admin</h1>
      <ReactCardFlip isFlipped={isFlipped}>
        <div>
          <Spin spinning={loading} delay={500}>
            <Form name="basic" initialValues={initialValues} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
              <Form.Item name="loginName" rules={[{ required: true, message: "请输入用户名!" }]}>
                <Input placeholder="qkstart" prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item name="password" rules={[{ required: true, message: "请输入密码!" }]}>
                <Input type="password" placeholder="123456" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item className={styles.captchaLogin}>
                <Form.Item name="captcha" rules={[{ required: true, message: "请输入验证码!" }]} noStyle>
                  <Input placeholder="请输入验证码" className={styles.captchaInput} />
                </Form.Item>
                <canvas width="140" height="32" id="captchaLogin" ref={inputRef} className={styles.captchaContainer} title="看不清？点击换一张。"></canvas>
              </Form.Item>

              <div className={styles.other}>
                {/* <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住登录状态</Checkbox>
                </Form.Item> */}
                <Form.Item noStyle>
                  <span className={styles.register} onClick={setRegister}>
                    注册(register)
                  </span>
                </Form.Item>
                <Form.Item noStyle>
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

            <Divider plain style={{ borderWidth: 13 }}>
              或者使用第三方登录
            </Divider>
            <div className={styles.ohter}>
              <div className={styles.type}>
                <Button type="link" href="http://ssr.nest-admin.com">
                  <IconFont type="icon-cib-next-js" />
                  SSR
                </Button>
              </div>
              <div className={styles.type}>
                <Button
                  type="link"
                  href="https://gitee.com/oauth/authorize?client_id=7cb714b21edaa2130a98b69a108b833f61d3b04cfde1fd64cb387abcd6a378c2&state=gitee&redirect_uri=https%3A%2F%2Fnest-admin.com%2Flogin&response_type=code">
                  <IconFont type="icon-gitee2" />
                  Gitee
                </Button>
              </div>
              <div className={styles.type}>
                <Button type="link" href="http://webpack.nest-admin.com">
                  <IconFont type="icon-webpack" />
                  Webpack
                </Button>
              </div>
            </div>
          </Spin>
        </div>
        <div className={styles.card}>
          <Image width={200} src={qrimg} />
        </div>
      </ReactCardFlip>
    </div>
  );
};

export default LoginForm;
