import ProjectContext from "@/contexts/ProjectContext";
import { UserOutlined } from "@ant-design/icons";
import { webSocketManager } from "@/utils/ws";
import { Avatar, Dropdown, MenuProps, Modal } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderNotice from "../HeaderNotice";
import { getPlacardListByType, readOnePlacard } from "@/api/caravan/Placard";
import html2canvas from "html2canvas";

import styles from "./index.module.scss";

const DefaultLayoutHeader = () => {
  const { username, setValue } = useContext(ProjectContext);
  const navigate = useNavigate();

  const [readPlacard, setReadPlacard] = useState(false);

  const src = window.localStorage.getItem("avatar");

  const toggleLanguage = () => {
    const language = localStorage.getItem("language");
    if (language === "zh") {
      localStorage.setItem("language", "en");
    } else {
      localStorage.setItem("language", "zh");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setValue({});
    navigate("/login");
  };

  const items: MenuProps["items"] = [
    {
      label: "个人中心",
      key: "1",
    },
    {
      label: "切换语言",
      key: "2",
    },
    {
      label: "退出登录",
      key: "3",
    },
  ];
  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "1") return navigate("/account");
    if (key === "2") return toggleLanguage();
    if (key === "3") return logout();
  };

  const GetPageView = async (payload) => {
    // 开始截屏
    const result = await html2canvas(document.body, {
      useCORS: true, // 【重要】开启跨域配置
      scale: window.devicePixelRatio < 3 ? window.devicePixelRatio : 2,
      allowTaint: true, // 允许跨域图片
    });

    result.toBlob((res) => {
      webSocketManager.postMessage({
        type: "PageViewBlob",
        data: { blob: res, receiver: payload.receiver },
      });
    });
  };
  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler((payload) => {
      if (payload?.type === "HandleForcedOffline") logout();
      if (payload?.type === "GetPageView") {
        GetPageView(payload);
      }
    });
    return removeHandler;
  }, []);

  useEffect(() => {
    if (readPlacard) return;
    getPlacardListByType({
      type: "system",
      status: "broadcasting",
    })
      .then((result) => {
        //如果请求成功，需要弹出对应数量的公告modal
        result.data.data.map((item: any, index: number) => {
          return Modal.info({
            title: item.title,
            mask: index === 0,
            okText: "确认收到",
            width: 600,
            content: (
              <div className="systemCard">
                <p>{item.description.slice(0, 300)}</p>
              </div>
            ),
            onOk: () => readOnePlacard(item),
          });
        });
      })
      .finally(() => {
        setReadPlacard(true);
      });
  }, [readPlacard]);

  return (
    <div className={styles.container}>
      <div className={styles.logo} onClick={() => navigate("/workplace")}>
        <span className={styles.title}>nest-admin</span>
      </div>
      <div className={styles.user}>
        <Dropdown menu={{ items, onClick }}>
          <div className={styles.nameContainer}>
            <Avatar src={src} icon={<UserOutlined />} />
            <span className={styles.name}>{username}</span>
          </div>
        </Dropdown>
      </div>
      <HeaderNotice />
    </div>
  );
};

export default DefaultLayoutHeader;
