import ProjectContext from "@/contexts/ProjectContext";
import { UserOutlined } from "@ant-design/icons";
import { webSocketManager } from "@/utils/ws";
import { Avatar, Dropdown, Menu, Modal } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderNotice from "../HeaderNotice";

import styles from "./index.module.scss";
import MenuTagContext from "@/contexts/MenuTagContext";
import { getPlacardListByType, readOnePlacard } from "@/api/caravan/Placard";
import IntlContext from "@/contexts/IntlContextProvider";
import { LocaleFormatter } from "@/locales";

const DefaultLayoutHeader = () => {
  const { setTags } = useContext(MenuTagContext);
  const { username, setValue } = useContext(ProjectContext);
  const navigate = useNavigate();
  const { setLocale } = useContext(IntlContext);

  const [readPlacard, setReadPlacard] = useState(false);

  const src = window.localStorage.getItem("avatar");

  const toggleLanguage = () => {
    const language = localStorage.getItem("language");
    if (language === "zh") {
      localStorage.setItem("language", "en");
    } else {
      localStorage.setItem("language", "zh");
    }
    setLocale(language === "zh" ? "en" : "zh");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setValue({});
    setTags([]);
    navigate("/login");
  };

  const overlay = (
    <Menu>
      <Menu.Item key="1" onClick={() => navigate("/accounts/AccountPages")}>
        {LocaleFormatter({ id: "app.settings.user.profile" })}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" onClick={() => toggleLanguage()}>
        {LocaleFormatter({ id: "gloabal.tips.toggle.language" })}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3" onClick={() => logout()}>
        {LocaleFormatter({ id: "gloabal.tips.logout" })}
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler(payload => {
      if (payload?.type === "HandleForcedOffline") logout();
    });
    return removeHandler;
  }, []);

  useEffect(() => {
    if (readPlacard) return;
    getPlacardListByType({
      type: "system",
      status: "broadcasting"
    })
      .then(result => {
        //如果请求成功，需要弹出对应数量的公告modal
        result.data.data.map((item: any, index: number) => {
          return Modal.info({
            title: <p>{item.title}</p>,
            mask: index === 0,
            okText: "确认收到",
            width: 600,
            content: (
              <div className="systemCard">
                <p>{item.description}</p>
              </div>
            ),
            onOk: () => readOnePlacard(item)
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
        {/* <span className={styles.title}>nest-admin</span> */}
      </div>

      <div className={styles.user}>
        <Dropdown overlay={overlay}>
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
