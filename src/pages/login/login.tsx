import React, { FC, useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input, Tabs } from 'antd';
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
import { Zhuce } from 'api/nest-admin/User';
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
const { TabPane } = Tabs;
//此文件也有内存泄漏风险
const LoginForm: FC = () => {
  const navigate = useNavigate();
  const { setUserInfo, setLoginInfo, saveMenu } = useSystemUserInfo();
  const [errmsg, setErrmsg] = useState('');
  const dispatch = useAppDispatch();
  const [type, setType] = useState<string>('account');
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
  const onRegister = async (form: any) => {
    Zhuce({
      user: form
    }).then(result => {
      console.log('result: ', result);
      if (result.data.code === 200) {
        //登录成功，获取菜单 我好像还没写这个功能，先代替一下下
        // const { email, id, name, token } = result.data.data;
        const { token } = result.data.data;
        dispatch(
          setUserItem({
            loginState: true
          })
        );
        localStorage.setItem('token', token);
        setUserInfo(result.data);
        getMenuDatabyToken(token);
      }
    });
  };
  const onRegisterFailed = () => {};
  const getMenuDatabyToken = (token: string) => {
    //根据token获取菜单 暂时没写完，先代替一下
    const cacheMenu: any = [
      {
        router: 'root',
        name: '根节点',
        icon: null,
        authority: null,
        children: [
          { router: 'workplace', name: '驾驶舱', icon: 'alert', authority: 'workplaceAuth', children: [] },
          {
            router: 'workbench',
            name: '工作台',
            icon: 'appstore',
            authority: 'workbenchAuth',
            children: [
              {
                router: 'boardworks',
                name: '管理人员工作台',
                icon: 'alert',
                authority: 'boardworksAuth',
                children: []
              },
              {
                router: 'operatorsworks',
                name: '运维人员工作台',
                icon: 'alert',
                authority: 'operatorsworksAuth',
                children: []
              }
            ]
          }
        ]
      }
    ];
    const code = 200;
    if (code === 200) {
      //格式化菜单，并且保存到内存中
      const menudata = getSystemMenu(cacheMenu);
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
  };

  useEffect(() => {}, []);

  return (
    <div className="login-page">
      <div className="bgimg"></div>
      <div className="login-page-body">
        <h2 className="title">Nest Admin</h2>
        <h2>{errmsg}</h2>
        <Tabs defaultActiveKey={type} centered onChange={setType}>
          <TabPane tab="登录" key="account">
            <Form<LoginParams> onFinish={onFinished} className="login-page-form_account" initialValues={initialValues}>
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
              {/* 我写的后台，用户名必须是邮箱，将来找回密码的时候，发送邮件 */}
              <Form.Item label="用户名" name="email" rules={[{ required: true, message: '必须输入邮箱当作用户名' }]}>
                <Input placeholder="邮箱当作用户名" />
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
                <Input.Password placeholder="密码" />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    <b className="hidetext">和</b>昵<b className="hidetext">和</b>称
                  </span>
                }
                name="name"
                rules={[{ required: false, message: '请输入昵称!' }]}
              >
                <Input placeholder="昵称随机生成" />
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
