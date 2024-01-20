import { Button } from "antd";

import styles from "./index.module.scss";
import { webSocketManager } from "@/utils/ws";

const SocketCard = ({ userInfo, loadUserInfo, getUserView, ForcedOffline }) => {
  const isMe = webSocketManager.MySocketID === userInfo.id;

  return (
    <div className={styles.container}>
      <div className={styles.imgbox}>
        <div className={styles.img}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.details}>
          <h2>
            {userInfo?.nick || userInfo?.name}
            {isMe ? "(自己)" : ""}
            <br />
            <span>Web Front-end developer</span>
          </h2>
          <div className={styles.actionBtn}>
            <Button className={styles.btn} type="link" size="small" onClick={() => loadUserInfo(userInfo)}>
              查看详情
            </Button>
            <Button className={styles.btn} type="link" size="small" onClick={() => getUserView(userInfo)}>
              查看用户界面
            </Button>
            <Button danger className={styles.btn} type="link" size="small" onClick={() => ForcedOffline(userInfo)}>
              强制下线
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocketCard;
