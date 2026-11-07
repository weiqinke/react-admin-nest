import prewImg from "@/assets/prewview.png";
import { MetaDescModal } from "@/components/Modals";
import { webSocketManager } from "@/utils/ws";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Image, Modal, message } from "antd";
import { FC, useEffect, useState } from "react";

import { userinfo } from "@/api/user";
import SocketCard from "@/components/SocketCard";

const toCard = (user: any) => ({
  id: user.conn_id,
  conn_id: user.conn_id,
  user_id: user.user_id,
  uid: user.user_id,
  name: user.username,
  nick: user.username,
  login: true
});

const pullPresence = () => {
  webSocketManager.postMessage({ type: "room.join", data: { room: "admin-watch" } });
  webSocketManager.postMessage({ type: "presence.list" });
};

const WebsocketAdmin: FC = () => {
  const [socketUsers, setSocketUsers] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState(null);
  const [imgSrc, setImgSrc] = useState(prewImg);

  useEffect(() => {
    pullPresence();
    const removeHandler = webSocketManager.addEventHandler(payload => {
      const { type, data = {} } = payload;
      // 进页面时连接往往还没 OPEN，第一次 presence.list 会被丢掉。welcome 后再拉一次。
      if (type === "welcome") pullPresence();
      if (type === "presence.snapshot") {
        setSocketUsers((data.users || []).map(toCard));
      }
      if (type === "presence.changed") {
        webSocketManager.postMessage({ type: "presence.list" });
      }
      if (type === "screen.ready" && data.url) {
        setImgSrc(data.url);
      }
      if (type === "screen.denied") {
        message.info("对方拒绝了界面查看");
      }
      if (type === "screen.error") {
        message.warning(data.message === "timeout" ? "对方未确认，请求已超时" : "获取界面失败");
      }
      if (type === "error" && data.message === "screen busy") {
        message.warning("该用户已有进行中的查看请求");
      }
    });
    return () => {
      removeHandler();
      webSocketManager.postMessage({ type: "room.leave", data: { room: "admin-watch" } });
    };
  }, []);

  const ForcedOffline = item => {
    if (String(item.user_id) === String(localStorage.getItem("uid") || "")) {
      message.info("不允许让自己强制下线");
      return;
    }
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span>{`是否将<${item.name}>强制下线？`}</span>,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        webSocketManager.postMessage({
          type: "admin.force_offline",
          data: { target_user_id: String(item.user_id) }
        });
        message.info("请求已发送");
      }
    });
  };

  const loadUserInfo = user => {
    userinfo({ uid: user?.user_id || user?.uid }).then(result => {
      if (result.data.code === 0) {
        setUserInfo(result.data.data);
      }
    });
  };

  const getUserView = item => {
    const requestId = crypto.randomUUID();
    webSocketManager.postMessage({
      type: "screen.request",
      request_id: requestId,
      data: { target_conn_id: item.conn_id, request_id: requestId }
    });
  };

  return (
    <div className="p-3">
      <div className="mb-3 h-[140px] w-[300px] select-none">
        <Image width={300} src={imgSrc} preview={{ src: imgSrc }} />
      </div>
      {socketUsers.length ? (
        <div className="flex flex-wrap items-start gap-x-4">
          {socketUsers.map((item, i) => (
            <div className="h-[160px] w-[280px]" key={item.conn_id || i}>
              <SocketCard userInfo={item} ForcedOffline={ForcedOffline} loadUserInfo={loadUserInfo} getUserView={getUserView} />
            </div>
          ))}
        </div>
      ) : null}

      {userInfo && <MetaDescModal userInfo={userInfo} onOk={() => setUserInfo(null)} />}
    </div>
  );
};

export default WebsocketAdmin;
