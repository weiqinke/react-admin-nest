import { AlipayCircleOutlined, DingdingOutlined, TaobaoCircleOutlined } from "@ant-design/icons";
import { Divider, Flex, Listy } from "antd";
import React, { useEffect } from "react";

const bindAccounts = [
  {
    key: "taobao",
    icon: <TaobaoCircleOutlined className="playicon" />,
    title: "绑定淘宝",
    description: "当前未绑定淘宝账号"
  },
  {
    key: "alipay",
    icon: <AlipayCircleOutlined className="playicon" />,
    title: "绑定支付宝",
    description: "当前未绑定支付宝账号"
  },
  {
    key: "dingtalk",
    icon: <DingdingOutlined className="playicon" />,
    title: "绑定钉钉",
    description: "当前未绑定钉钉账号"
  }
];

const AccountBind: React.FC = function () {
  useEffect(() => {}, []);
  return (
    <div className="AccountBind">
      <Divider titlePlacement="left" plain>
        账号设置
      </Divider>
      <Listy
        className="bangdinghao"
        items={bindAccounts}
        rowKey="key"
        itemRender={item => (
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={16}>
              {item.icon}
              <Flex vertical>
                <span className="font17">{item.title}</span>
                <span className="font17">{item.description}</span>
              </Flex>
            </Flex>
            <span>绑定</span>
          </Flex>
        )}
      />
    </div>
  );
};

export default AccountBind;
