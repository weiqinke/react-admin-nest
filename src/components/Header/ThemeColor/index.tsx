import { SunOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";
import { useState } from "react";
import { Tooltip } from "antd";

const ThemeColor = () => {
  const themeDict = {
    light: "dark",
    dark: "light"
  };
  const [theme, setTheme] = useState(localStorage.getItem("data-theme") || "light");

  function handleChangeTheme() {
    localStorage.setItem("data-theme", themeDict[theme]);
    window.document.documentElement.setAttribute("data-theme", themeDict[theme]);
    setTheme(themeDict[theme]);
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
