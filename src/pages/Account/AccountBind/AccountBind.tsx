import { AlipayCircleOutlined, DingdingOutlined, TaobaoCircleOutlined } from "@ant-design/icons";
import { Divider, List } from "antd";
import React, { useEffect } from "react";

const AccountBind: React.FC = function () {
  useEffect(() => {}, []);
  return (
    <div className="AccountBind">
      <Divider orientation="left" plain>
        账号设置
      </Divider>
      <List itemLayout="horizontal" className="bangdinghao">
        <List.Item actions={[<span key="list-loadmore-edit">绑定</span>]}>
          <List.Item.Meta
            avatar={<TaobaoCircleOutlined className="playicon" />}
            title={<span className="font17">绑定淘宝</span>}
            description={<span className="font17">当前未绑定淘宝账号</span>}
          />
        </List.Item>
        <List.Item actions={[<span key="list-loadmore-edit">绑定</span>]}>
          <List.Item.Meta
            avatar={<AlipayCircleOutlined className="playicon" />}
            title={<span className="font17">绑定支付宝</span>}
            description={<span className="font17">当前未绑定支付宝账号</span>}
          />
        </List.Item>
        <List.Item actions={[<span key="list-loadmore-edit">绑定</span>]}>
          <List.Item.Meta
            avatar={<DingdingOutlined className="playicon" />}
            title={<span className="font17">绑定钉钉</span>}
            description={<span className="font17">当前未绑定钉钉账号</span>}
          />
        </List.Item>
      </List>
    </div>
  );
};

export default AccountBind;
