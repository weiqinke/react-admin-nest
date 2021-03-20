/**
 * 个人中心
 */
import React, { FC } from 'react';
import './style.scss';
import { Card, Divider } from 'antd';
import Avatar from 'pages/commponents/avatar';
import userPoster from 'assets/header/user.webp';
const { Meta } = Card;
const userInfo = {
  id: '71b0ee35-f16b-4181-89b0-2eefa0b5d548',
  provider: 'github',
  loginName: 'qkstart',
  username: '月野兔',
  password: '123456',
  token: '6b0e111c986bbdbb2c346966fac592ad9f90b947',
  avatarUrl: 'https://portrait.gitee.com/uploads/avatars/user/431/1295434_weiqinke_1591925291.png!avatar30',
  location: '北京',
  bio: 'coding',
  email: '928148935@qq.com',
  ipAddr: '127.0.0.1',
  role: 1,
  createdAt: '2021-01-01',
  updatedAt: '2021-01-01'
};
const BasePage: FC = function() {
  const MetaDesc = (
    <div className="meta-desc">
      <div className="loginname">{userInfo.loginName}</div>
      <div>
        <span>账号：</span>
        {userInfo.loginName}
      </div>
      <div>简介：{userInfo.bio}</div>
      <div>邮箱：{userInfo.email}</div>
      <div>地区：{userInfo.location}</div>
      <div>注册时间：{userInfo.createdAt}</div>
    </div>
  );

  return (
    <div className="setting-base">
      <Divider orientation="left" plain>
        个人中心
      </Divider>
      <Card style={{ width: 350 }} cover={<img alt="" src={userPoster} className="poster" />}>
        <Meta
          avatar={<Avatar src={userInfo.avatarUrl} size="large" />}
          title={userInfo.username}
          description={MetaDesc}
        />
      </Card>
    </div>
  );
};
export default BasePage;
