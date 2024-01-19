import React, { FC } from "react";
import { Layout, Tabs } from "antd";
import AccountBind from "./AccountBind/AccountBind";
import AccountSetting from "./AccountSetting/AccountSetting";
import BaseSetting from "./Base/BaseSetting";
import MessageCenter from "./Messagecenter/MessageCenter";
import NotificationPage from "./Notification/notification";
import SecuritySetting from "./SecuritySetting/SecuritySetting";

import styles from "./index.module.scss";

const { TabPane } = Tabs;

const Account: FC = () => {
  return (
    <Layout className={styles.container}>
      <Tabs tabPosition={"left"} className={styles.tabplane}>
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
