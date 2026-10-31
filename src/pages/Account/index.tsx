import { FC } from "react";
import { Layout, Tabs } from "antd";
import { useSearchParams } from "react-router";
import AccountBind from "./AccountBind/AccountBind";
import AccountSetting from "./AccountSetting/AccountSetting";
import BaseSetting from "./Base/BaseSetting";
import MessageCenter from "./Messagecenter/MessageCenter";
import NotificationPage from "./Notification/notification";
import SecuritySetting from "./SecuritySetting/SecuritySetting";

import styles from "./index.module.scss";

const Account: FC = () => {
  const [params, setParams] = useSearchParams();
  const activeKey = params.get("tab") || (localStorage.getItem("must_change_password") === "1" ? "SecuritySetting" : "BaseSetting");

  return (
    <Layout className={styles.container}>
      <Tabs
        tabPlacement="start"
        className={styles.tabplane}
        activeKey={activeKey}
        onChange={key => {
          const next = new URLSearchParams(params);
          next.set("tab", key);
          setParams(next, { replace: true });
        }}
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
