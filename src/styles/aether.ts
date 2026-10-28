/**
 * Aether 配色里需要交给 Ant Design 的实色。
 * 色阶和随 data-theme 切换的语义色在 tailwind.css。
 * 按钮和链接落在浅色内容区上，主色用 signal-700，保证白字可读。
 * 亮青 signal-400 只用于深色表面（侧栏选中字、暗色强调）。
 */
export const aether = {
  white: "#ffffff",
  ink950: "#060912",
  ink900: "#0b1220",
  ink800: "#121b2e",
  ink300: "#a8b3c7",
  ink50: "#f4f7fb",
  signal900: "#164e63",
  signal700: "#0e7490",
  signal600: "#0891b2",
  signal300: "#67e8f9",
  ion500: "#8b5cf6",
  sky500: "#0ea5e9",
  ok: "#059669",
  warn: "#d97706",
  danger: "#e11d48",
  info: "#2563eb"
} as const;
