export type ThemeName = "light" | "dark";

/** 顶栏 CSS 变量与 Ant Design Menu / Button 的同一份色值。 */
export const themePalette = {
  light: {
    headerBg: "#fedce0",
    headerText: "#fff",
    headerIcon: "#158670",
    headerIconHoverBg: "#158670",
    headerIconHoverText: "#fff",
    menu: {
      darkItemSelectedBg: "#fedce0",
      darkPopupBg: "#fedce0",
      darkSubMenuItemBg: "#000",
      // 原先写了两次 darkItemBg，后一次生效，侧栏底色保持深蓝
      darkItemBg: "#001529",
      darkItemSelectedColor: "#fafafc",
      darkItemColor: "#fafafc",
      darkGroupTitleColor: "#000"
    },
    button: {
      defaultBg: "#fedce0",
      primaryColor: "#fff"
    }
  },
  dark: {
    headerBg: "#001529",
    headerText: "#fff",
    headerIcon: "#fff",
    headerIconHoverBg: "#41b3a3",
    headerIconHoverText: "#fff",
    menu: {
      darkItemSelectedBg: "#41b3a3",
      darkItemSelectedColor: "#fafafc",
      darkItemColor: "#fafafc",
      darkGroupTitleColor: "#000"
    },
    button: {
      defaultBg: "#41b3a3",
      primaryColor: "#fff"
    }
  }
} as const;

const headerVars = {
  "--header-bg": "headerBg",
  "--header-text": "headerText",
  "--header-icon": "headerIcon",
  "--header-icon-hover-bg": "headerIconHoverBg",
  "--header-icon-hover": "headerIconHoverText"
} as const;

type HeaderVar = (typeof headerVars)[keyof typeof headerVars];

export function readStoredTheme(): ThemeName {
  return localStorage.getItem("data-theme") === "light" ? "light" : "dark";
}

export function applyHeaderTheme(theme: ThemeName) {
  const colors = themePalette[theme];
  const root = document.documentElement;
  (Object.entries(headerVars) as [string, HeaderVar][]).forEach(([name, key]) => {
    root.style.setProperty(name, colors[key]);
  });
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("data-theme", theme);
}
