import React, { FC } from 'react';
import { Button, Checkbox, Form, Input } from 'antd';
import './index.less';
import { useNavigate } from 'react-router-dom';
import { LoginParams } from 'interface/user/login';
import { loginInProject, GetMenu } from 'server/system.login';
import { useSystemUserInfo } from 'hooks/useSystemInfo';
import { ProjectParseMenu, getIndexUrl } from 'utils/menuUtil';
import { useAppDispatch } from 'stores';
import { setUserItem } from 'stores/user.store';

interface LoginParamsMore {
  sysUserAccount: string;
  sysUserPwd: string;
  remember: boolean;
}
const initialValues: LoginParamsMore = {
  sysUserAccount: '338542',
  sysUserPwd: '6ED30B7CED45',
  remember: true
};

const LoginForm: FC = () => {
  const navigate = useNavigate();
  const { setUserInfo, setLoginInfo, saveMenu, setCacheMenu } = useSystemUserInfo();
  const dispatch = useAppDispatch();
  const getMenuData = (user: any) => {
    GetMenu({ sysUserID: user.sysuserid }).then((result: any) => {
      if (result.code === 200) {
        const projectMenu = ProjectParseMenu(result.data);
        saveMenu(projectMenu);
        const indexUrl = getIndexUrl(projectMenu);
        const from = { pathname: indexUrl };
        setCacheMenu(indexUrl);
        navigate(from);
      }
    });
  };
  const onFinished = async (form: LoginParams) => {
    loginInProject(form).then((result: any) => {
      if (result.code === 0) {
        const data = result.data;
        if (data.user && data.token) {
          localStorage.setItem('token', data.token);
        }
        // 保存登录信息
        setLoginInfo(data);
        // 保存用户信息
        setUserInfo(data.user);
        // 获取菜单
        getMenuData(data.user);
      }
    });
  };

  return (
    <div className="login-page">
      <Form<LoginParams> onFinish={onFinished} className="login-page-form" initialValues={initialValues}>
        <h2>Nest Admin</h2>
        <Form.Item name="sysUserAccount" rules={[{ required: true, message: '请输入用户名！' }]}>
          <Input placeholder="用户名" />
        </Form.Item>
        <Form.Item name="sysUserPwd" rules={[{ required: true, message: '请输入密码！' }]}>
          <Input type="password" placeholder="密码" />
        </Form.Item>
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>记住用户</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" className="login-page-form_button">
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;
