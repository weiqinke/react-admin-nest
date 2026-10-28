import { Divider, Tag } from "antd";
import React, { useEffect } from "react";

const AccountSetting: React.FC = function () {
  useEffect(() => {}, []);
  return (
    <div>
      <Divider titlePlacement="left" plain>
        账号设置
      </Divider>
      <div className="mb-2.5 flex border-b border-[#e6e6e6] text-[17px]">
        <div className="flex-1">
          <h4>账户密码</h4>
          <p>
            当前强度：<Tag color="#108ee9">强</Tag>
          </p>
        </div>
        <span key="xiugaimima1" className="mr-3 text-[17px] leading-[70px] text-[#0095ff]">
          修改
        </span>
      </div>
      <div className="mb-2.5 flex border-b border-[#e6e6e6] text-[17px]">
        <div className="flex-1">
          <h4>密保手机</h4>
          <p>
            <span>已绑定手机：</span>
            <span>138****8293</span>
          </p>
        </div>
        <span key="xiugaimima2" className="mr-3 text-[17px] leading-[70px] text-[#0095ff]">
          验证
        </span>
        <span key="xiugaimima3" className="mr-3 text-[17px] leading-[70px] text-[#0095ff]">
          换绑
        </span>
      </div>
      <div className="mb-2.5 flex border-b border-[#e6e6e6] text-[17px]">
        <div className="flex-1">
          <h4>密保问题</h4>
          <p>
            <span>未设置密保问题，密保问题可有效保护账户安全</span>
          </p>
        </div>
        <span key="xiugaimima4" className="mr-3 text-[17px] leading-[70px] text-[#0095ff]">
          修改
        </span>
      </div>
      <div className="mb-2.5 flex border-b border-[#e6e6e6] text-[17px]">
        <div className="flex-1">
          <h4>备用邮箱</h4>
          <p>
            <span>已绑定邮箱：</span>
            <span>ant***sign.com</span>
          </p>
        </div>
        <span key="xiugaimima5" className="mr-3 text-[17px] leading-[70px] text-[#0095ff]">
          修改
        </span>
      </div>
      <div className="mb-2.5 flex border-b border-[#e6e6e6] text-[17px]">
        <div className="flex-1">
          <h4>备用邮箱</h4>
          <p>
            <span>MFA 设备：</span>
            <span>未绑定 MFA 设备，绑定后，可以进行二次确认</span>
          </p>
        </div>
        <span key="xiugaimima6" className="mr-3 text-[17px] leading-[70px] text-[#0095ff]">
          绑定
        </span>
        <span key="xiugaimima7" className="mr-3 text-[17px] leading-[70px] text-[#999]">
          启用
        </span>
      </div>
    </div>
  );
};

export default AccountSetting;
