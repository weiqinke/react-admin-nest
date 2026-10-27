import avatarImg from "@/assets/user/defaultAvatar.jpg";
import { Avatar } from "antd";
import styles from "./index.module.scss";

const AvatarData = ({ info }) => {
  return (
    <div className={styles.container}>
      <div className={styles.userAvatar}>
        <Avatar src={info?.avatar || avatarImg} style={{ width: 128, height: 128 }} />
      </div>
      <div className={styles.info}>
        <div className={styles.title}>
          <b>{info?.nick}</b>
        </div>
        <h4 className={styles.desc}>{info?.signature}</h4>
      </div>
    </div>
  );
};

export default AvatarData;
