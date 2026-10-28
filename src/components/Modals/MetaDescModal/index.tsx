import dayjs from "dayjs";
import React, { FC } from "react";

import { Avatar, Button, Modal } from "antd";

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
      <div className="mx-auto w-[300px] cursor-pointer select-none p-10">
        <Avatar src={userInfo.avatar || undefined} className="mx-auto block h-[100px] w-[100px] select-none" />
        <div className="mt-[15px] text-center text-2xl font-medium">{userInfo.name}</div>
        <div className="mt-2 text-center">{userInfo.signature}</div>
        <div className="h-[30px] leading-[30px]"></div>
        <div className="h-[30px] leading-[30px]">
          <MailOutlined style={{ marginRight: 12 }} />
          {userInfo.email}
        </div>
        <div className="h-[30px] leading-[30px]">
          <WomanOutlined style={{ marginRight: 12 }} />女
        </div>

        <div className="h-[30px] leading-[30px]">
          <IconFont type="icon-texiao" style={{ marginRight: 12 }} />
          1992/8/11
        </div>

        <div className="h-[30px] leading-[30px]">
          <IconFont type="icon-caozuoshijian" style={{ marginRight: 12 }} />
          {dayjs(userInfo.created).format("YYYY-MM-DD HH:mm")}
        </div>
        <div className="h-[30px] leading-[30px]">
          <IconFont type="icon-address" style={{ marginRight: 12 }} />
          {userInfo.address}
        </div>
        <div className="h-[30px] leading-[30px]">
          <HomeOutlined style={{ marginRight: 12 }} />
          集团 - 事业群 - 技术部
        </div>
        <div className="h-[30px] leading-[30px]">
          <BankOutlined style={{ marginRight: 12 }} />
          中国 • 广东省 • 深圳市
        </div>
        <div className="h-[30px] leading-[30px]">
          <IconFont type="icon-code" style={{ marginRight: 12 }} />
          JavaScript、HTML、CSS、Vue、Node
        </div>
      </div>
    </Modal>
  );
};

export default MetaDescModal;
