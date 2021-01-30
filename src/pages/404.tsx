import { Button, Result } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'stores';
import { addTag, setActiveTag } from 'stores/tags-view.store';
import { getIndexUrlInfo } from 'utils/menuUtil';
/*
 * 找不到页面，返回首页
 */
const NotFoundPage: React.FC<{}> = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
      status="404"
      title="404"
      subTitle="页面正在开发中"
      extra={
        <Button type="primary" onClick={backToHome}>
          返回首页
        </Button>
      }
    />
  );
};

export default NotFoundPage;
