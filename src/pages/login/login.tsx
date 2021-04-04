import React, { FC, useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input, message, Tabs } from 'antd';
import './index.less';
import { useNavigate } from 'react-router-dom';
import { LoginParams } from 'interface/user/login';
import { useSystemUserInfo } from 'hooks/useSystemInfo';
import { ProjectParseMenuAsPre, SaveMeUrl, getIndexUrlInfo } from 'utils/menuUtil';
import { addTag, setActiveTag } from 'stores/tags-view.store';
import { useAppDispatch } from 'stores';
import { setUserItem, setIndexUrl, setMenuList, setRefreshFCUrl } from 'stores/user.store';
import { Zhuce, Account } from 'api/nest-admin/User';
import { getUserMenus } from 'api/nest-admin/MenuApi';
import { webSocketManager } from 'utils/websocket';
interface LoginParamsMore {
  name: string;
  password: string;
  remember: boolean;
}
const initialValues: LoginParamsMore = {
  name: '',
  password: '',
  remember: true
};
const { TabPane } = Tabs;
//此文件也有内存泄漏风险
const LoginForm: FC = () => {
  const navigate = useNavigate();
  const { setUserInfo, saveMenu } = useSystemUserInfo();
  const [errmsg] = useState('');
  const dispatch = useAppDispatch();
  const [type, setType] = useState<string>('account');
  const onFinished = async (form: LoginParams) => {
    const payload = {
      ...form,
      logintype: 'web',
      email: form.name + '@qq.com'
    };
    Account(payload).then(result => {
      if (result.data.code === 200) {
        const { token, nick } = result.data.data;
        setSocketMeseage({
          message: nick + '上线了',
          data: ''
        });
        dispatch(
          setUserItem({
            loginState: true,
            nick
          })
        );
        // localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        localStorage.setItem('nick', nick);
        setUserInfo(result.data);
        getMenuDatabyToken();
      }
    });
  };
  const onRegister = async (form: any) => {
    Zhuce({
      user: { ...form, email: form.name + '@qq.com' }
    }).then(result => {
      if (result.data.code === 200) {
        //登录成功，获取菜单
        const { token } = result.data.data;
        dispatch(
          setUserItem({
            loginState: true,
            nick: form.nick || ''
          })
        );
        // localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        setUserInfo(result.data);
        getMenuDatabyToken();
      }
    });
  };
  const onRegisterFailed = () => {};
  const getMenuDatabyToken = () => {
    getUserMenus().then(result => {
      if (result.data.code === 200) {
        const cacheMenu = result.data.data;
        if (cacheMenu.length <= 0) {
          message.info('暂未分配权限，请通知管理员分配权限');
          return;
        }
        const projectMenuPre = ProjectParseMenuAsPre(cacheMenu.concat());
        const allMenusInfo: any = SaveMeUrl(projectMenuPre.concat(), '');
        dispatch(
          setMenuList({
            menuList: allMenusInfo
          })
        );
        saveMenu(allMenusInfo);

        //找到第一个url直接跳转过去吧
        const indexTag: any = getIndexUrlInfo(allMenusInfo);
        const { meUrl } = indexTag;
        dispatch(
          setIndexUrl({
            indexUrl: meUrl || ''
          })
        );
        // 此时需要注意下，我们需要设置全局刷新key，否则好多页面会一直处于刷新状态
        dispatch(
          setRefreshFCUrl({
            RefreshFCUrl: meUrl,
            RefreshFlag: false
          })
        );

        const from = { pathname: meUrl };
        //还得告诉tag 你要把标签历史记录加上新跳转的地址
        dispatch(
          addTag({
            ...indexTag,
            closable: true
          })
        );
        dispatch(setActiveTag(meUrl));
        navigate(from);
      }
    });
  };
  const [socketMessage, setSocketMeseage] = useState<any>({ message: null, data: null });

  useEffect(() => {}, []);
  useEffect(() => {
    const { message, data } = socketMessage;
    if (message) {
      webSocketManager.postMessage({ name: 'loginMessage', message, data });
    }
  }, [socketMessage]);

  return (
    <div className="login-page">
      <div className="bgimg"></div>
      <div className="login-page-body">
        <h2 className="title">Nest Admin</h2>
        <h2>{errmsg}</h2>
        <Tabs defaultActiveKey={type} centered onChange={setType}>
          <TabPane tab="登录" key="account">
            <Form<LoginParams> onFinish={onFinished} className="login-page-form_account" initialValues={initialValues}>
              <Form.Item name="name" rules={[{ required: true, message: '请输入用户名！' }]}>
                <Input placeholder="用户名:qkstart" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: '请输入密码！' }]}>
                <Input type="password" placeholder="密码:123456" />
              </Form.Item>
              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>记住用户</Checkbox>
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" type="primary" className="login-page-form_button_account">
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="注册" key="register">
            <Form
              name="basic"
              onFinish={onRegister}
              onFinishFailed={onRegisterFailed}
              className="login-page-form_register"
            >
              {/* 我写的后台，用户名必须有，将来找回密码的时候，发送邮件 */}
              <Form.Item label="用户名" name="name" rules={[{ required: true, message: '必须输入用户名' }]}>
                <Input placeholder="请输入用户名" />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    密<b className="hidetext">和</b>码
                  </span>
                }
                name="password"
                rules={[{ required: true, message: '请输入密码!' }]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    昵<b className="hidetext">和</b>称
                  </span>
                }
                name="nick"
                rules={[{ required: true, message: '请输入昵称!' }]}
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    手<b className="hidetext">和</b>机
                  </span>
                }
                name="phone"
                rules={[{ required: true, message: '请输入手机号!' }]}
              >
                <Input placeholder="手机号" />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" type="primary" className="login-page-form_button_register">
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginForm;
