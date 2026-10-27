import path from "path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
// https://vitejs.dev/config/
import react from "@vitejs/plugin-react";
import dayjs from "dayjs";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import packageJson from "./package.json" with { type: "json" };

import { createHtmlPlugin } from "vite-plugin-html";

const { dependencies, devDependencies, name, version } = packageJson;
const dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV === "development";
const httpUrl = isDev ? "https://nest-admin.com/micro/api/" : "https://nest-admin.com/micro/api/";

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
    react(),
    createHtmlPlugin({
      minify: true,
      /**
       * 在这里写entry后，你将不需要在`index.html`内添加 script 标签，原有标签需要删除
       * @default src/main.ts
       */
      entry: "/src/main.tsx",
      /**
       * 需要注入 index.html ejs 模版的数据
       */
      template: "public/index.html",
      inject: {
        data: {
          // 查找.env.test文件里面的VITE_PROJECT_TITLE，请以VITE_标识开头
          title: "编程的奇思妙想" || name,
          injectScript: `<script type="module" crossorigin src="/src/main.tsx"></script>`
        },
        tags: [
          {
            injectTo: "body-prepend",
            tag: "div",
            attrs: {
              id: "tag"
            }
          }
        ]
      }
    }),
    // 构建压缩文件
    viteCompression({
      // 记录压缩文件及其压缩率。默认true
      verbose: true,
      // 是否启用压缩，默认false
      disable: false,
      // 需要使用压缩前的最小文件大小，单位字节（byte） b，1b(字节)=8bit(比特), 1KB=1024B
      threshold: 10240, // 即10kb以上即会压缩
      // 压缩算法 可选 'gzip' | 'brotliCompress' | 'deflate' | 'deflateRaw'
      algorithm: "gzip",
      // 压缩后的文件格式
      ext: ".gz"
    }),
    visualizer({
      emitFile: false,
      filename: "analysis-chart.html", // 分析图生成的文件名
      open: false // 打包后不自动打开，避免 CI/本地构建被打断
    })
  ],
  define: {
    REACT_APP_API_URL: JSON.stringify(httpUrl),
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
    proxy: {
      // 使用 proxy 实例
      // "/nest3011": {
      //   target: "https://nest-admin.com/nest3011/",
      //   changeOrigin: true,
      //   secure: false,
      //   configure: (proxy, options) => {
      //     return proxy;
      //   },
      // },
    }
  },
  server: {
    hmr: {}
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
