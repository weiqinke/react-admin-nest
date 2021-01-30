import React, { FC, useState } from 'react';
import { Button, Checkbox, Form, Input } from 'antd';
import './index.less';
import { useNavigate } from 'react-router-dom';
import { LoginParams, LoginBackUser } from 'interface/user/login';
import { loginInProject, GetMenu } from 'server/system.login';
import { useSystemUserInfo } from 'hooks/useSystemInfo';
import { ProjectParseMenuAsPre, getSystemMenu, SaveMeUrl, getIndexUrlInfo } from 'utils/menuUtil';
import { addTag, setActiveTag } from 'stores/tags-view.store';
import { useAppDispatch } from 'stores';
import { setUserItem, setIndexUrl, setMenuList } from 'stores/user.store';
import { setAuthorization } from 'api/request';
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
  const { setUserInfo, setLoginInfo, saveMenu } = useSystemUserInfo();
  const [errmsg, setErrmsg] = useState('');
  const dispatch = useAppDispatch();
  const getMenuData = (user: LoginBackUser) => {
    GetMenu({ sysUserID: user.sysuserid }).then((result: any) => {
      const { data } = result;
      if (data.code === 200) {
        //格式化菜单，并且保存到内存中
        const menudata = getSystemMenu(data.data);
        const projectMenuPre = ProjectParseMenuAsPre(menudata.concat());
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
  const onFinished = async (form: LoginParams) => {
    setErrmsg('');
    loginInProject(form).then((result: any) => {
      const { data } = result;
      if (data.code === 0) {
        //登录成功
        const resdata = data.data;
        if (resdata.user && resdata.token) {
          localStorage.setItem('token', resdata.token);
          dispatch(
            setUserItem({
              loginState: true
            })
          );
        }
        // 保存登录信息
        setLoginInfo(resdata);
        // 保存用户信息
        setUserInfo(resdata.user);
        // 获取菜单
        getMenuData(resdata.user);
        // 把token存一下
        setAuthorization({
          token: resdata.token,
          expireAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        });
      } else {
        setErrmsg(data.message);
      }
    });
  };

  return (
    <div className="login-page">
      <div className="bgimg"></div>
      <Form<LoginParams> onFinish={onFinished} className="login-page-form" initialValues={initialValues}>
        <h2>Nest Admin</h2>
        <h2>{errmsg}</h2>
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
