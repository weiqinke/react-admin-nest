import prewImg from "@/assets/prewview.png";
import { MetaDescModal } from "@/components/Modals";
import Waterfall from "@/components/Weaterfall";
import { webSocketManager } from "@/utils/ws";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Image, Modal, message } from "antd";
import { FC, useEffect, useRef, useState } from "react";

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

const WebsocketAdmin: FC = () => {
  const imgMinWidth = 280;
  const scrollRef = useRef();
  const domRef = useRef<HTMLDivElement>(null);
  const [socketUsers, setSocketUsers] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState(null);
  const [imgSrc, setImgSrc] = useState(prewImg);
  const [itemNum, setItemNum] = useState<number>(3);

  useEffect(() => {
    webSocketManager.postMessage({ type: "room.join", data: { room: "admin-watch" } });
    webSocketManager.postMessage({ type: "presence.list" });
    return () => {
      webSocketManager.postMessage({ type: "room.leave", data: { room: "admin-watch" } });
    };
  }, []);

  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler(payload => {
      const { type, data = {} } = payload;
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
    return removeHandler;
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

  const resize = () => {
    const winW = domRef.current?.clientWidth || 0;
    setItemNum(Math.max(1, Math.floor(winW / imgMinWidth)));
  };
  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getList = async () => socketUsers;

  return (
    <div className="p-3" ref={domRef}>
      <div className="mb-3 h-[140px] w-[300px] select-none">
        <Image width={300} src={imgSrc} preview={{ src: imgSrc }} />
      </div>
      {socketUsers.length ? (
        <Waterfall
          scrollRef={scrollRef}
          getList={getList}
          key={`${itemNum}-${socketUsers.map(user => user.conn_id).join(",")}`}
          cols={itemNum}
          imgMinWidth={imgMinWidth}
          itemRender={(item, i) => {
            return (
              <div style={{ height: 147 }} key={item.conn_id || i}>
                <SocketCard userInfo={item} ForcedOffline={ForcedOffline} loadUserInfo={loadUserInfo} getUserView={getUserView} />
              </div>
            );
          }}
        />
      ) : null}

      {userInfo && <MetaDescModal userInfo={userInfo} onOk={() => setUserInfo(null)} />}
    </div>
  );
};

export default WebsocketAdmin;
