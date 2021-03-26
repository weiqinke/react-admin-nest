import React, { FC, useEffect } from 'react';
import { Layout, Tabs } from 'antd';
import './Account.less';
import MessageCenter from './messagecenter/MessageCenter';
import NotificationPage from './notification/notification';
import AccountSetting from './accountsetting/AccountSetting';
import AccountBind from './accountbind/AccountBind';
import SecuritySetting from './securitysetting/SecuritySetting';
import BaseSetting from './base/BaseSetting';
const { TabPane } = Tabs;

const Account: FC = () => {
  useEffect(() => {}, []);

  return (
    <Layout className="setting-page">
      <Tabs tabPosition={'left'} className="tabplane">
        <TabPane tab={<div className="title">个人中心</div>} key="BaseSetting">
          <BaseSetting />
        </TabPane>
        <TabPane tab={<div className="title">消息中心</div>} key="MessageCenter">
          <MessageCenter />
        </TabPane>
        <TabPane tab={<div className="title">消息通知</div>} key="notification">
          <NotificationPage />
        </TabPane>
        <TabPane tab={<div className="title">账号设置</div>} key="AccountSetting">
          <AccountSetting />
        </TabPane>
        <TabPane tab={<div className="title">安全设置</div>} key="SecuritySetting">
          <SecuritySetting />
        </TabPane>
        <TabPane tab={<div className="title">账号绑定</div>} key="AccountBind">
          <AccountBind />
        </TabPane>
      </Tabs>
    </Layout>
  );
};

export default Account;
