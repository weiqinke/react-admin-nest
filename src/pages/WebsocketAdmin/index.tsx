import prewImg from "@/assets/prewview.png";
import { MetaDescModal } from "@/components/Modals";
import Waterfall from "@/components/Weaterfall";
import { webSocketManager } from "@/utils/ws";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Image, Modal, message } from "antd";
import { FC, useEffect, useRef, useState } from "react";

import { userinfo } from "@/api/microservice/user";
import SocketCard from "@/components/SocketCard";
import styles from "./index.module.scss";

const WebsocketAdmin: FC = () => {
  const imgMinWidth = 280; // 允许瀑布流单列最低宽度，可能再低就变形和会重叠
  const timer = useRef();
  const scrollRef = useRef();
  const domRef = useRef<HTMLDivElement>();
  const [socketUsers, setSocketUsers] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [imgSrc, setImgSrc] = useState(prewImg);
  const [itemNum, setItemNum] = useState<number>(3);
  const getOnlintUsers = () => {
    webSocketManager.postMessage({
      type: "GetAllOnLineClient"
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
    const removeHandler = webSocketManager.addEventHandler(payload => {
      const { type, data } = payload;
      if (type === "OnlineUsers") {
        const { OnlineUser = [] } = data;
        setSocketUsers(OnlineUser.filter(v => v?.login));
      }
    });
    return removeHandler;
  }, []);

  const ForcedOffline = item => {
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
          data: { receiver: item.id }
        });
        message.info("请求已发送");
        getOnlintUsers();
      },
      onCancel() {}
    });
  };

  const loadUserInfo = user => {
    userinfo({ uid: user?.uid }).then(result => {
      if (result.data.code === 200) {
        setUserInfo(result.data.data);
      }
    });
  };

  const getUserView = item => {
    webSocketManager.postMessage({
      type: "GetPageView",
      data: { receiver: item.id }
    });
  };

  const ceatt = Bdata => {
    return "data:image/png;base64," + window.btoa(new Uint8Array(Bdata).reduce((data, byte) => data + String.fromCharCode(byte), ""));
  };
  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler(payload => {
      if (payload?.type === "PageViewBlob") {
        const Bdata = payload.data.blob;
        setImgSrc(ceatt(Bdata));
      }
    });
    return removeHandler;
  }, []);

  const resize = () => {
    const winW = domRef.current.clientWidth;
    const value = Math.floor(winW / imgMinWidth); // 当每一个项的宽度都是固定的时候，需要计算出浏览器一行可以排列几个。
    setItemNum(value);
  };
  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window && window.removeEventListener("resize", resize);
    };
  }, []);

  const getList = async () => {
    return socketUsers;
  };

  return (
    <div className={styles.websocketAdmin} ref={domRef}>
      <div className={styles.imgbg}>
        <Image
          width={300}
          src={imgSrc}
          preview={{
            src: imgSrc
          }}
        />
      </div>
      {/* socketUsers */}
      {socketUsers.length && (
        <Waterfall
          scrollRef={scrollRef}
          getList={getList}
          key={itemNum}
          cols={itemNum}
          imgMinWidth={imgMinWidth}
          itemRender={(item, i) => {
            return (
              <div style={{ height: 147 }} key={i}>
                <SocketCard userInfo={item} ForcedOffline={ForcedOffline} loadUserInfo={loadUserInfo} getUserView={getUserView} />
              </div>
            );
          }}
        />
      )}

      {userInfo && <MetaDescModal userInfo={userInfo} onOk={() => setUserInfo(null)} />}
    </div>
  );
};

export default WebsocketAdmin;
