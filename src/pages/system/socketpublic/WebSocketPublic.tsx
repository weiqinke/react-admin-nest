import { Modal } from 'antd';
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
    });
    return removeHandler;
  }, []);
  return <div className="users-list-page"></div>;
};

export default WebSocketPublic;
