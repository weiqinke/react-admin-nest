/**
 * 交给 Ant Design 的实色。色阶和随 data-theme 切换的语义色在 tailwind.css。
 * 壳层是中性石墨，主色是钴蓝 signal-600。白字落在 #2563eb 上对比足够。
 */
export const aether = {
  white: "#ffffff",
  ink950: "#101216",
  ink900: "#16181d",
  ink800: "#1e222b",
  ink300: "#c5cad3",
  ink50: "#f5f6f8",
  signal900: "#1e3a8a",
  signal700: "#1d4ed8",
  signal600: "#2563eb",
  signal300: "#93b4ff",
  ion500: "#d4920a",
  sky500: "#5b8def",
  ok: "#0f9f6e",
  warn: "#d4920a",
  danger: "#e11d48",
  info: "#2563eb"
} as const;
