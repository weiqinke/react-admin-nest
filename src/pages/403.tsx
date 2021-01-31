import { Button, Result } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppState } from 'stores';
import { addTag, setActiveTag } from 'stores/tags-view.store';
import { getIndexUrlInfo } from 'utils/menuUtil';
/*
 * 暂无权限页面
 */
const NotAuthPage: React.FC<{}> = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loginState } = useAppState(state => state.user);
  if (!loginState) {
    // 如果没有登录，直接返回登录页
    setTimeout(() => {
      navigate('login');
    }, 0);
  }
  const backToHome = async () => {
    //如果此时仅剩一个标签页, 应该先去获取首页的菜单项，添加一个标签，然后跳转
    const menuList = JSON.parse(localStorage.getItem('menuList') || '[]');
    const indexTag: any = getIndexUrlInfo(menuList);
    await dispatch(
      addTag({
        ...indexTag,
        closable: true
      })
    );
    const { meUrl } = indexTag;
    dispatch(setActiveTag(meUrl));
    const from = { pathname: meUrl };
    navigate(from);
  };
  return (
    <Result
      status="403"
      title="403"
      subTitle={'对不起，您没有权限访问此页面。'}
      extra={
        <Button type="primary" onClick={backToHome}>
          返回首页
        </Button>
      }
    />
  );
};

export default NotAuthPage;
