import { DownloadOutlined, LikeFilled, LikeOutlined, PlayCircleFilled, ShareAltOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useState } from "react";
import styles from "./index.module.scss";
const MusicItem = ({ data }) => {
  const [music, setMusic] = useState(data);

  const like = () => {
    setMusic({ ...music, action: 1 });
  };

  return (
    <div>
      <div className={styles.title}>{music.name}</div>
      <div className={styles.user}>演唱者: 未知</div>
      <div>
        <div className={styles.playIconNode}>
          <PlayCircleFilled style={{ fontSize: "20px" }} />
        </div>
      </div>
      <div className={styles.btns}>
        <Tooltip key="comment-basic-like" title="Like">
          <span onClick={like} className={styles.share}>
            {music?.action ? <LikeFilled /> : <LikeOutlined />}
            <span className="comment-action">{music?.action ? "1" : "0"}</span>
          </span>
        </Tooltip>
        <Tooltip key="comment-basic-share" title="share">
          <span className={styles.share}>
            <ShareAltOutlined />
          </span>
        </Tooltip>

        <Tooltip key="comment-basic-download" title="download">
          <span className={styles.share}>
            <DownloadOutlined />
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export default MusicItem;
