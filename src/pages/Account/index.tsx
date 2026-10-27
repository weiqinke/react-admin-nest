import React, { FC } from "react";
import { Layout, Tabs } from "antd";
import AccountBind from "./AccountBind/AccountBind";
import AccountSetting from "./AccountSetting/AccountSetting";
import BaseSetting from "./Base/BaseSetting";
import MessageCenter from "./Messagecenter/MessageCenter";
import NotificationPage from "./Notification/notification";
import SecuritySetting from "./SecuritySetting/SecuritySetting";

import styles from "./index.module.scss";

const Account: FC = () => {
  return (
    <Layout className={styles.container}>
      <Tabs
        tabPosition="left"
        className={styles.tabplane}
        items={[
          {
            key: "BaseSetting",
            label: <div className="title">个人中心</div>,
            children: <BaseSetting />
          },
          {
            key: "MessageCenter",
            label: <div className="title">消息中心</div>,
            children: <MessageCenter />
          },
          {
            key: "notification",
            label: <div className="title">消息通知</div>,
            children: <NotificationPage />
          },
          {
            key: "AccountSetting",
            label: <div className="title">账号设置</div>,
            children: <AccountSetting />
          },
          {
            key: "SecuritySetting",
            label: <div className="title">安全设置</div>,
            children: <SecuritySetting />
          },
          {
            key: "AccountBind",
            label: <div className="title">账号绑定</div>,
            children: <AccountBind />
          }
        ]}
      />
    </Layout>
  );
};

export default Account;
