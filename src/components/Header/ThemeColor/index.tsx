import { SunOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { Tooltip } from "antd";
import ProjectContext from "@/contexts/ProjectContext";
import type { ThemeName } from "@/theme/palette";

const ThemeColor = () => {
  const { theme, setTheme } = useContext<any>(ProjectContext);
  const nextTheme: Record<ThemeName, ThemeName> = {
    light: "dark",
    dark: "light"
  };

  function handleChangeTheme() {
    const current: ThemeName = theme === "light" ? "light" : "dark";
    setTheme(nextTheme[current]);
  }
  return (
    <Tooltip title="切换主题" placement="bottom">
      <span
        className="inline-flex h-12 cursor-pointer select-none items-center px-3 text-base text-header-icon hover:bg-header-icon-hover-bg hover:text-header-icon-hover"
        onClick={handleChangeTheme}>
        <SunOutlined />
      </span>
    </Tooltip>
  );
};

export default ThemeColor;
