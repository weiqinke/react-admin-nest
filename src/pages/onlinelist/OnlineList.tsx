import { Button, List, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { webSocketManager } from 'utils/websocket';
import './OnlineList.less';

interface SocketUser {
  id: string;
  name: string;
}
const OnlineList: React.FC = () => {
  const [initLoading, setInitLoading] = useState<boolean>(true);
  const [DataList, setDataList] = useState<any>([]);

  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler(payload => {
      setInitLoading(false);
      const { type, data } = payload;
      if (type === 'OnlineUsers') {
        setDataList(data.OnlineUser || []);
      }
    });
    getSocketOnLine();
    return removeHandler;
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    setTimeout(() => {
      getSocketOnLine();
    }, 1000);
  }, []);
  const ForcedOffline = (item: SocketUser) => {
    if (webSocketManager.MySocketID === item.id) {
      message.info('不允许让自己强制下线');
      return;
    }
    webSocketManager.postMessage({
      name: 'nest-admin',
      type: 'Handle_CAR_ForcedOffline',
      message: '强制下线',
      data: {
        receiver: item.id
      }
    });
    getSocketOnLine();
  };
  const getSocketOnLine = () => {
    //如果此时websocket未初始化。在一秒钟后重新发起吧
    if (!webSocketManager || !webSocketManager.socket || !webSocketManager.socket.connected) {
      return;
    }
    webSocketManager.postMessage({
      name: 'nest-admin',
      type: 'getOnlineUsers',
      message: '获取在线人数',
      data: {}
    });
  };
  return (
    <div className="OnlineList">
      <p>OnlineList</p>
      <List
        className="demo-loadmore-list"
        loading={initLoading}
        itemLayout="horizontal"
        dataSource={DataList}
        renderItem={(item: any) => (
          <List.Item>
            <List.Item.Meta
              title={<b>{item.name}</b>}
              description={webSocketManager.MySocketID === item.id ? '当前用户' : item.id}
            />
            <div className="listinfo">
              <Button
                type="primary"
                danger
                onClick={() => {
                  ForcedOffline(item);
                }}
              >
                强制下线
              </Button>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default OnlineList;
