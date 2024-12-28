import { SunOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";
import { useContext, useState } from "react";
import { Tooltip } from "antd";
import ProjectContext from "@/contexts/ProjectContext";

const ThemeColor = () => {
  const { theme, setTheme } = useContext<any>(ProjectContext);
  const themeDict = {
    light: "dark",
    dark: "light"
  };

  function handleChangeTheme() {
    const data = themeDict[theme];
    setTheme(data);
  }
  return (
    <Tooltip title="切换 Theme" placement="bottom" className={styles.themetooltip}>
      <span className={styles.ThemeColor} onClick={handleChangeTheme}>
        <SunOutlined />
      </span>
    </Tooltip>
  );
};

export default ThemeColor;
