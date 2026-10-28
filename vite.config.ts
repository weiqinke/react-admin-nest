import path from "path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
// https://vitejs.dev/config/
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import dayjs from "dayjs";
import { visualizer } from "rollup-plugin-visualizer";
import { compression } from "vite-plugin-compression2";
import packageJson from "./package.json" with { type: "json" };

const { dependencies, devDependencies, name, version } = packageJson;
const dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV === "development";
// 开发走 Vite 代理，浏览器同源访问。
// 生产默认直连本机 goadmin。CI 传入 DEPLOY_API_ORIGIN：
// 空字符串 = 同源（由 Nginx 反代 /api）；非空 = 该源（已开 CORS）。
function productionApiOrigin() {
  const configured = process.env.DEPLOY_API_ORIGIN;
  if (configured === undefined) return "http://127.0.0.1:8080";
  return configured.replace(/\/$/, "");
}
const goAdminOrigin = productionApiOrigin();
const httpUrl = isDev ? "" : goAdminOrigin;

// 开发时代理和线上 Nginx 一样带上真实 IP。浏览器和 Vite 在同一台机器时，这个地址本来就是 127.0.0.1。
function goAdminProxyEntry() {
  return {
    target: goAdminOrigin,
    changeOrigin: true,
    xfwd: true,
    configure(proxy) {
      proxy.on("proxyReq", (proxyReq, req) => {
        const raw = req.socket.remoteAddress || "";
        const ip = raw.startsWith("::ffff:") ? raw.slice(7) : raw;
        if (ip) proxyReq.setHeader("X-Real-IP", ip);
      });
    }
  };
}
const goAdminProxy = {
  "/api": goAdminProxyEntry(),
  "/health": goAdminProxyEntry()
};

function vendorChunkName(id: string) {
  // pnpm: .../node_modules/.pnpm/<pkg>@ver/node_modules/<pkg>/...
  // npm/yarn: .../node_modules/<pkg>/...
  const match = id.match(/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/);
  return match?.[1] || "vendor";
}

export default defineConfig({
  // Vite 8 CJS 默认导出互操作变更：部分 CJS 包（如 react-card-flip、react-countup）
  // 的 default import 会变成 { default: Component }，导致 JSX 报 type is invalid。
  // 临时恢复旧行为；后续可改为 `import X from 'pkg'; const Comp = X.default ?? X`
  legacy: {
    inconsistentCjsInterop: true
  },
  plugins: [
    tailwindcss(),
    react(),
    // 构建时生成 gzip 预压缩资源（替代已停更的 vite-plugin-compression）
    compression({
      algorithms: ["gzip"],
      threshold: 10240,
      logLevel: "info"
    }),
    visualizer({
      emitFile: false,
      filename: "analysis-chart.html", // 分析图生成的文件名
      open: false // 打包后不自动打开，避免 CI/本地构建被打断
    })
  ],
  define: {
    REACT_APP_API_URL: JSON.stringify(httpUrl),
    REACT_APP_WS_ORIGIN: JSON.stringify(goAdminOrigin),
    REACT_PACKAGE: JSON.stringify({
      dependencies,
      devDependencies,
      name,
      version,
      lastBuildTime: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss")
    }),
    NODE_ENV: JSON.stringify(process.env.NODE_ENV)
  },
  resolve: {
    // 强制全项目使用同一份 React，避免 Vite 预构建误解析到残留的 react@18
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(dirname, "./src"),
      react: path.resolve(dirname, "node_modules/react"),
      "react-dom": path.resolve(dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(dirname, "node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(dirname, "node_modules/react/jsx-dev-runtime.js")
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "react-dom/client"]
  },
  preview: {
    proxy: goAdminProxy
  },
  server: {
    hmr: {},
    proxy: goAdminProxy
  },
  build: {
    minify: "terser", // 必须开启：使用 terserOptions 才有效果
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production" ? true : false,
        drop_debugger: process.env.NODE_ENV === "production" ? true : false
      }
    },
    rolldownOptions: {
      // 静态资源分类打包
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {},
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]",
        // Vite 8 / Rolldown：用 codeSplitting 替代已弃用的 manualChunks
        codeSplitting: {
          groups: [
            {
              test: /node_modules/,
              debugName: "vendor-by-package",
              name(id: string) {
                return vendorChunkName(id);
              }
            }
          ]
        }
      }
    }
  }
});
