import { DownloadOutlined, LikeFilled, LikeOutlined, PlayCircleFilled, ShareAltOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useState } from "react";

const MusicItem = ({ data }) => {
  const [music, setMusic] = useState(data);

  const like = () => {
    setMusic({ ...music, action: 1 });
  };

  return (
    <div>
      <div className="text-center">{music.name}</div>
      <div className="text-xs text-[#333]">演唱者: 未知</div>
      <div>
        <div className="mx-auto my-1.5 inline-block text-center">
          <PlayCircleFilled style={{ fontSize: "20px" }} />
        </div>
      </div>
      <div className="mx-1.5">
        <Tooltip key="comment-basic-like" title="Like">
          <span onClick={like} className="mx-3">
            {music?.action ? <LikeFilled /> : <LikeOutlined />}
            <span className="comment-action">{music?.action ? "1" : "0"}</span>
          </span>
        </Tooltip>
        <Tooltip key="comment-basic-share" title="share">
          <span className="mx-3">
            <ShareAltOutlined />
          </span>
        </Tooltip>

        <Tooltip key="comment-basic-download" title="download">
          <span className="mx-3">
            <DownloadOutlined />
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export default MusicItem;
