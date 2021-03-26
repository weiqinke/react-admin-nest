import moment from 'moment';
import React, { FC } from 'react';
import './style.scss';

const MetaDesc: FC<any> = (props: any) => {
  const { userInfo } = props;
  return (
    <div className="meta-desc">
      <div className="loginname">{userInfo.loginName}</div>
      <div>
        <span>账号：</span>
        {userInfo.name}
      </div>
      <div>简介：{userInfo.signature}</div>
      <div>邮箱：{userInfo.email}</div>
      <div>地区：{userInfo.address}</div>
      <div>注册时间：{moment(userInfo.created).format('YYYY-MM-DD HH:mm')}</div>
    </div>
  );
};

export default MetaDesc;
