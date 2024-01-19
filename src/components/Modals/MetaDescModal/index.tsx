import dayjs from "dayjs";
import React, { FC } from "react";

import { Avatar, Button, Modal } from "antd";

import styles from "./index.module.scss";
import { BankOutlined, HomeOutlined, MailOutlined, WomanOutlined } from "@ant-design/icons";
import IconFont from "@/components/IconFont";

const MetaDescModal: FC<any> = ({ userInfo, onOk }) => {
  return (
    <Modal
      open
      keyboard
      onOk={onOk}
      onCancel={onOk}
      width={600}
      footer={
        <Button type="primary" onClick={onOk}>
          确定
        </Button>
      }>
      <div className={styles.container}>
        <Avatar src={userInfo.avatar || ""} className={styles.avatar} style={{ userSelect: "none" }} />
        <div className={styles.name}>{userInfo.name}</div>
        <div className={styles.description}>{userInfo.signature}</div>
        <div className={styles.area}></div>
        <div className={styles.area}>
          <MailOutlined style={{ marginRight: 12 }} />
          {userInfo.email}
        </div>
        <div className={styles.area}>
          <WomanOutlined style={{ marginRight: 12 }} />女
        </div>

        <div className={styles.area}>
          <IconFont type="icon-texiao" style={{ marginRight: 12 }} />
          1992/8/11
        </div>

        <div className={styles.area}>
          <IconFont type="icon-caozuoshijian" style={{ marginRight: 12 }} />
          {dayjs(userInfo.created).format("YYYY-MM-DD HH:mm")}
        </div>
        <div className={styles.area}>
          <IconFont type="icon-address" style={{ marginRight: 12 }} />
          {userInfo.address}
        </div>
        <div className={styles.area}>
          <HomeOutlined style={{ marginRight: 12 }} />
          集团 - 事业群 - 技术部
        </div>
        <div className={styles.area}>
          <BankOutlined style={{ marginRight: 12 }} />
          中国 • 广东省 • 深圳市
        </div>
        <div className={styles.area}>
          <IconFont type="icon-code" style={{ marginRight: 12 }} />
          JavaScript、HTML、CSS、Vue、Node
        </div>
      </div>
    </Modal>
  );
};

export default MetaDescModal;
