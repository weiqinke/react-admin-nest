import { type ThemeConfig } from "antd";

export type ThemeName = "light" | "dark";

/** 中文后台用系统字体，不另载展示字体。 */
export const fontFamily = '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

/**
 * 一套浅色工作区。暗色只改顶栏和侧栏，页面里的白底卡片不用跟着翻色。
 * 强调色只用于当前位置和主操作。
 */
export const themePalette = {
  light: {
    canvas: "#F4F5F7",
    surface: "#FFFFFF",
    ink: "#1C1F24",
    muted: "#5C6570",
    line: "#E6E8EC",
    accent: "#1F6F5B",
    accentSoft: "#E7F2EF",
    hover: "#F0F1F4",
    headerBg: "#FFFFFF",
    headerText: "#1C1F24",
    headerIcon: "#1C1F24",
    headerIconHoverBg: "#F0F1F4",
    headerIconHoverText: "#1C1F24"
  },
  dark: {
    canvas: "#F4F5F7",
    surface: "#1C1F24",
    ink: "#F3F4F6",
    muted: "#C5CAD3",
    line: "#2E333B",
    accent: "#7DCEC0",
    accentSoft: "#243833",
    hover: "#262B33",
    headerBg: "#1C1F24",
    headerText: "#F3F4F6",
    headerIcon: "#F3F4F6",
    headerIconHoverBg: "#262B33",
    headerIconHoverText: "#F3F4F6"
  }
} as const;

const headerVars = {
  "--header-bg": "headerBg",
  "--header-text": "headerText",
  "--header-icon": "headerIcon",
  "--header-icon-hover-bg": "headerIconHoverBg",
  "--header-icon-hover": "headerIconHoverText"
} as const;

const shellVars = {
  "--canvas": "canvas",
  "--surface": "surface",
  "--ink": "ink",
  "--muted": "muted",
  "--line": "line",
  "--accent": "accent",
  "--accent-soft": "accentSoft"
} as const;

type Palette = (typeof themePalette)[ThemeName];
type PaletteKey = keyof Palette;

export function readStoredTheme(): ThemeName {
  return localStorage.getItem("data-theme") === "light" ? "light" : "dark";
}

export function applyHeaderTheme(theme: ThemeName) {
  const colors = themePalette[theme];
  const root = document.documentElement;
  (Object.entries({ ...headerVars, ...shellVars }) as [string, PaletteKey][]).forEach(([name, key]) => {
    root.style.setProperty(name, colors[key]);
  });
  root.style.fontFamily = fontFamily;
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("data-theme", theme);
}

/** 全局 token 管字体和主色，菜单按明暗分别覆盖，避免暗色侧栏把正文一起染深。 */
export function buildAntdTheme(theme: ThemeName): ThemeConfig {
  const colors = themePalette[theme];
  const menu =
    theme === "dark"
      ? {
          darkItemBg: colors.surface,
          darkSubMenuItemBg: colors.surface,
          darkPopupBg: colors.surface,
          darkItemColor: colors.muted,
          darkItemHoverColor: colors.ink,
          darkItemHoverBg: colors.hover,
          darkItemSelectedColor: colors.accent,
          darkItemSelectedBg: colors.accentSoft,
          darkGroupTitleColor: colors.muted,
          itemBorderRadius: 0,
          activeBarBorderWidth: 2
        }
      : {
          itemBg: colors.surface,
          subMenuItemBg: colors.surface,
          popupBg: colors.surface,
          itemColor: colors.ink,
          itemHoverColor: colors.ink,
          itemHoverBg: colors.hover,
          itemSelectedColor: colors.accent,
          itemSelectedBg: colors.accentSoft,
          groupTitleColor: colors.muted,
          itemBorderRadius: 0,
          activeBarBorderWidth: 2
        };

  return {
    token: {
      colorPrimary: "#1F6F5B",
      colorText: "#1C1F24",
      colorTextSecondary: "#5C6570",
      colorBorder: "#E6E8EC",
      colorBgLayout: colors.canvas,
      colorBgContainer: "#FFFFFF",
      borderRadius: 6,
      fontFamily,
      fontSize: 14
    },
    components: {
      Button: {
        primaryShadow: "none",
        defaultShadow: "none",
        dangerShadow: "none"
      },
      Layout: {
        siderBg: colors.surface,
        bodyBg: colors.canvas,
        headerBg: colors.surface,
        headerHeight: 48
      },
      Menu: menu
    }
  };
}
