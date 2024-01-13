import { Button, List, message } from "antd";
import React, { useEffect, useState } from "react";
import { webSocketManager } from "@/utils/ws";

interface SocketUser {
  id: string;
  name: string;
}

const WsOnlineList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [DataList, setDataList] = useState<any>([]);

  const getSocketOnLine = () => {
    //如果此时websocket未初始化。在一秒钟后重新发起吧
    if (!webSocketManager || !webSocketManager.socket || !webSocketManager.socket.connected) {
      return setLoading(true);
    }
    webSocketManager.postMessage({
      type: "GetAllOnLineClient"
    });
  };

  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler(payload => {
      setLoading(false);
      if (payload?.type === "OnlineUsers") {
        setDataList(payload?.data?.OnlineUser || []);
      }
    });
    return removeHandler;
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (webSocketManager?.socket?.connected) getSocketOnLine();
    }, 1000);
  }, []);

  const ForcedOffline = (item: SocketUser) => {
    if (webSocketManager.MySocketID === item.id) {
      return message.info("不允许让自己强制下线");
    }
    webSocketManager.postMessage({
      type: "HandleForcedOffline",
      data: { receiver: item.id }
    });
    getSocketOnLine();
  };

  return (
    <div className="OnlineList">
      <p>OnlineList</p>
      <List
        className="demo-loadmore-list"
        loading={loading}
        itemLayout="horizontal"
        dataSource={DataList}
        renderItem={(item: any) => (
          <List.Item>
            <List.Item.Meta title={<b>{item.name}</b>} description={webSocketManager.MySocketID === item.id ? "当前用户" : item.id} />
            {webSocketManager.MySocketID === item.id ?null:<div className="listinfo">
              <Button
                danger
                type="primary"
                onClick={() => {
                  ForcedOffline(item);
                }}
              >
                强制下线
              </Button>
            </div>}
          </List.Item>
        )}
      />
    </div>
  );
};

export default WsOnlineList;
