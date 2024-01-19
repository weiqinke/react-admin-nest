import { Divider, Tag } from "antd";
import React, { useEffect } from "react";

const AccountSetting: React.FC = function () {
  useEffect(() => {}, []);
  return (
    <div className="AccountSetting">
      <Divider orientation="left" plain>
        账号设置
      </Divider>
      <div className="list">
        <div className="left">
          <h4 className="title">账户密码</h4>
          <p className="description">
            当前强度：<Tag color="#108ee9">强</Tag>
          </p>
        </div>
        <span key="xiugaimima1" className="xiugaitype">
          修改
        </span>
      </div>
      <div className="list">
        <div className="left">
          <h4 className="title">密保手机</h4>
          <p className="description">
            <span>已绑定手机：</span>
            <span className="phonenumber">138****8293</span>
          </p>
        </div>
        <span key="xiugaimima2" className="xiugaitype">
          验证
        </span>
        <span key="xiugaimima3" className="xiugaitype">
          换绑
        </span>
      </div>
      <div className="list">
        <div className="left">
          <h4 className="title">密保问题</h4>
          <p className="description">
            <span>未设置密保问题，密保问题可有效保护账户安全</span>
          </p>
        </div>
        <span key="xiugaimima4" className="xiugaitype">
          修改
        </span>
      </div>
      <div className="list">
        <div className="left">
          <h4 className="title">备用邮箱</h4>
          <p className="description">
            <span>已绑定邮箱：</span>
            <span>ant***sign.com</span>
          </p>
        </div>
        <span key="xiugaimima5" className="xiugaitype">
          修改
        </span>
      </div>
      <div className="list">
        <div className="left">
          <h4 className="title">备用邮箱</h4>
          <p className="description">
            <span>MFA 设备：</span>
            <span>未绑定 MFA 设备，绑定后，可以进行二次确认</span>
          </p>
        </div>
        <span key="xiugaimima6" className="xiugaitype">
          绑定
        </span>
        <span key="xiugaimima7" className="xiugaitype offstate">
          启用
        </span>
      </div>
    </div>
  );
};

export default AccountSetting;
