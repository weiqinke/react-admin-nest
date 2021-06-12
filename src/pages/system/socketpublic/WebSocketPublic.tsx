import { Modal, notification } from 'antd';
import { readOnePlacard } from 'api/nest-admin/placard';
import React, { FC, useEffect, useRef } from 'react';
import { webSocketManager } from 'utils/websocket';
const WebSocketPublic: FC = () => {
  const PlacardIndex: any = useRef(1);

  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler(payload => {
      const { type, data } = payload;
      if (type === 'NewPlacard') {
        //这是新的系统公告我要显示出来
        Modal.info({
          title: <p>{data.title}</p>,
          mask: PlacardIndex.current === 1,
          okText: '确认收到',
          width: 600,
          content: (
            <div className="systemCard">
              <p>{data.description}</p>
            </div>
          ),
          onOk() {
            readOnePlacard(data);
            PlacardIndex.current -= 1;
          }
        });
        PlacardIndex.current += 1;
      }
      if (type === 'joinRoom') {
        // 加入房间
        notification.open({
          message: '通知',
          description: data.name + '进入了系统'
        });
      }
      if (type === 'leaveRoom') {
        // 离开房间
        notification.open({
          message: '通知',
          description: data.name + '离开了系统'
        });
      }
    });
    return removeHandler;
  }, []);
  return <></>;
};

export default WebSocketPublic;
