import React, { FC, useEffect, useRef, useState } from "react";

import styles from "./index.module.scss";
import { webSocketManager } from "@/utils/ws";
import { Card, Button, message, Row, Col, Modal, Image } from "antd";
import { MetaDescModal } from "@/components/Modals";
import { getUserInfoByUid } from "@/api/caravan/User";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import prewImg from "@/assets/prewview.png";

const WebsocketAdmin: FC = () => {
  const timer = useRef();
  const [socketUsers, setSocketUsers] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [imgSrc, setImgSrc] = useState(prewImg);
  const getOnlintUsers = () => {
    webSocketManager.postMessage({
      type: "GetAllOnLineClient",
    });
    clearTimeout(timer.current);
    timer.current = setTimeout(getOnlintUsers, 5000);
  };

  useEffect(() => {
    getOnlintUsers();
    return () => {
      clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler((payload) => {
      const { type, data } = payload;
      if (type === "OnlineUsers") {
        const { OnlineUser = [] } = data;
        setSocketUsers(OnlineUser.filter((v) => v?.login));
      }
    });
    return removeHandler;
  }, []);

  const ForcedOffline = (item) => {
    if (webSocketManager.MySocketID === item.id) {
      return message.info("不允许让自己强制下线");
    }
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span>{`是否将<${item.name}>强制下线？`}</span>,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        webSocketManager.postMessage({
          type: "HandleForcedOffline",
          data: { receiver: item.id },
        });
        message.info("请求已发送");
        getOnlintUsers();
      },
      onCancel() {},
    });
  };

  const loadUserInfo = (user) => {
    getUserInfoByUid({ uid: user?.uid }).then((result) => {
      if (result.data.code === 200) {
        setUserInfo(result.data.data);
      }
    });
  };

  const getUserView = (item) => {
    webSocketManager.postMessage({
      type: "GetPageView",
      data: { receiver: item.id },
    });
  };

  const ceatt = (Bdata) => {
    return (
      "data:image/png;base64," +
      window.btoa(
        new Uint8Array(Bdata).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      )
    );
  };
  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler((payload) => {
      if (payload?.type === "PageViewBlob") {
        console.log("payload: ", payload);
        const Bdata = payload.data.blob;
        setImgSrc(ceatt(Bdata));
      }
    });
    return removeHandler;
  }, []);

  return (
    <div className={styles.websocketAdmin}>
      <div className={styles.imgbg}>
        <Image
          width={300}
          src={imgSrc}
          preview={{
            src: imgSrc,
          }}
        />
      </div>

      <Row gutter={16}>
        {socketUsers.map((item) => {
          const isMe = webSocketManager.MySocketID === item.id;
          return (
            <Col span={6} key={item.id}>
              <Card
                size="small"
                title={
                  <div style={{ textAlign: "center" }}>
                    {item.nick || item.name}
                    {isMe ? "(自己)" : ""}
                  </div>
                }
              >
                <div style={{ textAlign: isMe ? "center" : "left" }}>
                  <Button type="link" onClick={() => loadUserInfo(item)}>
                    查看详情
                  </Button>
                  {!isMe && (
                    <Button
                      danger
                      type="link"
                      onClick={() => ForcedOffline(item)}
                    >
                      强制下线
                    </Button>
                  )}
                  <Button type="link" onClick={() => getUserView(item)}>
                    查看用户界面
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      {userInfo && (
        <MetaDescModal userInfo={userInfo} onOk={() => setUserInfo(null)} />
      )}
    </div>
  );
};

export default WebsocketAdmin;
