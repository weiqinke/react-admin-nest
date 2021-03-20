import React, { FC, useEffect } from 'react';
import { Layout, Tabs } from 'antd';
import BasePage from './base';
import './Account.less';
import MessageCenter from './messagecenter/MessageCenter';
import NotificationPage from './notification/notification';
import AccountPage from './accountpage/accountpage';
const { TabPane } = Tabs;

const Account: FC = () => {
  useEffect(() => {}, []);

  return (
    <Layout className="setting-page">
      <Tabs tabPosition={'left'} className="tabplane">
        <TabPane tab={<div className="title">个人中心</div>} key="BasePage">
          <BasePage />
        </TabPane>
        <TabPane tab={<div className="title">消息中心</div>} key="MessageCenter">
          <MessageCenter />
        </TabPane>
        <TabPane tab={<div className="title">消息通知</div>} key="notification">
          <NotificationPage />
        </TabPane>
        <TabPane tab={<div className="title">账号设置</div>} key="AccountPage">
          <AccountPage />
        </TabPane>
      </Tabs>
    </Layout>
  );
};

export default Account;
