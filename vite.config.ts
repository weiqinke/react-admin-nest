import path from "path";
import { defineConfig } from "vite";
// https://vitejs.dev/config/
import react from "@vitejs/plugin-react";
import dayjs from "dayjs";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import { dependencies, devDependencies, name, version } from "./package.json";

import { createHtmlPlugin } from "vite-plugin-html";

const isDev = process.env.NODE_ENV === "development";
const httpUrl = isDev ? "http://localhost:5000/api/" : "https://nest-admin.com/micro/api/";

export default defineConfig({
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
      open: true // 如果存在本地服务端口，将在打包后自动展示
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
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
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
    rollupOptions: {
      // 静态资源分类打包
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {},
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]",
        manualChunks(id) {
          // 静态资源分拆打包
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        }
      }
    }
  }
});
