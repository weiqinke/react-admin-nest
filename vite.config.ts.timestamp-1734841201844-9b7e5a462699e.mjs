// vite.config.ts
import path from "path";
import { defineConfig } from "file:///D:/react/my/react-admin-nest/node_modules/.pnpm/vite@5.4.11_@types+node@20.14.9_sass@1.77.6_terser@5.37.0/node_modules/vite/dist/node/index.js";
import react from "file:///D:/react/my/react-admin-nest/node_modules/.pnpm/@vitejs+plugin-react@4.3.1_vite@5.4.11_@types+node@20.14.9_sass@1.77.6_terser@5.37.0_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import dayjs from "file:///D:/react/my/react-admin-nest/node_modules/.pnpm/dayjs@1.11.11/node_modules/dayjs/dayjs.min.js";
import { visualizer } from "file:///D:/react/my/react-admin-nest/node_modules/.pnpm/rollup-plugin-visualizer@5.12.0_rollup@4.28.1/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import viteCompression from "file:///D:/react/my/react-admin-nest/node_modules/.pnpm/vite-plugin-compression@0.5.1_vite@5.4.11_@types+node@20.14.9_sass@1.77.6_terser@5.37.0_/node_modules/vite-plugin-compression/dist/index.mjs";

// package.json
var name = "nest-admin-web";
var version = "2.0.0";
var dependencies = {
  "@ant-design/icons": "^5.2.6",
  "@react-spring/web": "^9.7.3",
  "animate.css": "^4.1.1",
  antd: "^5.13.1",
  axios: "^1.6.5",
  bytes: "^3.1.2",
  "captcha-mini": "^1.1.0",
  d3: "^7.8.5",
  dayjs: "^1.11.10",
  echarts: "^5.4.3",
  "echarts-wordcloud": "^2.1.0",
  html2canvas: "^1.4.1",
  "lodash-es": "^4.17.21",
  qs: "^6.11.2",
  react: "^18.2.0",
  "react-bmap": "^1.0.131",
  "react-card-flip": "^1.2.2",
  "react-countup": "^6.5.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.2",
  "react-transition-group": "^4.4.5",
  "socket.io-client": "^4.7.4"
};
var devDependencies = {
  "@types/bytes": "^3.1.4",
  "@types/d3": "^7.4.3",
  "@types/node": "^20.11.2",
  "@types/qs": "^6.9.11",
  "@types/react": "^18.2.43",
  "@types/react-dom": "^18.2.17",
  "@types/react-transition-group": "^4.4.10",
  "@typescript-eslint/eslint-plugin": "^6.19.0",
  "@typescript-eslint/parser": "^6.14.0",
  "@vitejs/plugin-react": "^4.2.1",
  eslint: "^8.56.0",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-react-refresh": "^0.4.5",
  "eslint-plugin-unused-imports": "^3.0.0",
  prettier: "3.2.4",
  "rollup-plugin-visualizer": "^5.12.0",
  sass: "^1.69.7",
  terser: "^5.37.0",
  typescript: "^5.7.2",
  vite: "^5.4.11",
  "vite-plugin-compression": "^0.5.1",
  "vite-plugin-html": "^3.2.2"
};

// vite.config.ts
import { createHtmlPlugin } from "file:///D:/react/my/react-admin-nest/node_modules/.pnpm/vite-plugin-html@3.2.2_vite@5.4.11_@types+node@20.14.9_sass@1.77.6_terser@5.37.0_/node_modules/vite-plugin-html/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\react\\my\\react-admin-nest";
var isDev = process.env.NODE_ENV === "development";
var httpUrl = isDev ? "http://localhost:5000/api/" : "https://nest-admin.com/micro/api/";
var vite_config_default = defineConfig({
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
          title: "\u7F16\u7A0B\u7684\u5947\u601D\u5999\u60F3",
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
      threshold: 10240,
      // 即10kb以上即会压缩
      // 压缩算法 可选 'gzip' | 'brotliCompress' | 'deflate' | 'deflateRaw'
      algorithm: "gzip",
      // 压缩后的文件格式
      ext: ".gz"
    }),
    visualizer({
      emitFile: false,
      filename: "analysis-chart.html",
      // 分析图生成的文件名
      open: true
      // 如果存在本地服务端口，将在打包后自动展示
    })
  ],
  define: {
    REACT_APP_API_URL: JSON.stringify(httpUrl),
    REACT_PACKAGE: JSON.stringify({
      dependencies,
      devDependencies,
      name,
      version,
      lastBuildTime: dayjs(/* @__PURE__ */ new Date()).format("YYYY-MM-DD HH:mm:ss")
    }),
    NODE_ENV: JSON.stringify(process.env.NODE_ENV)
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
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
    minify: "terser",
    // 必须开启：使用 terserOptions 才有效果
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
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxccmVhY3RcXFxcbXlcXFxccmVhY3QtYWRtaW4tbmVzdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxccmVhY3RcXFxcbXlcXFxccmVhY3QtYWRtaW4tbmVzdFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovcmVhY3QvbXkvcmVhY3QtYWRtaW4tbmVzdC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcclxuaW1wb3J0IGRheWpzIGZyb20gXCJkYXlqc1wiO1xyXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xyXG5pbXBvcnQgdml0ZUNvbXByZXNzaW9uIGZyb20gXCJ2aXRlLXBsdWdpbi1jb21wcmVzc2lvblwiO1xyXG5pbXBvcnQgeyBkZXBlbmRlbmNpZXMsIGRldkRlcGVuZGVuY2llcywgbmFtZSwgdmVyc2lvbiB9IGZyb20gXCIuL3BhY2thZ2UuanNvblwiO1xyXG5cclxuaW1wb3J0IHsgY3JlYXRlSHRtbFBsdWdpbiB9IGZyb20gXCJ2aXRlLXBsdWdpbi1odG1sXCI7XHJcblxyXG5jb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcImRldmVsb3BtZW50XCI7XHJcbmNvbnN0IGh0dHBVcmwgPSBpc0RldiA/IFwiaHR0cDovL2xvY2FsaG9zdDo1MDAwL2FwaS9cIiA6IFwiaHR0cHM6Ly9uZXN0LWFkbWluLmNvbS9taWNyby9hcGkvXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBjcmVhdGVIdG1sUGx1Z2luKHtcclxuICAgICAgbWluaWZ5OiB0cnVlLFxyXG4gICAgICAvKipcclxuICAgICAgICogXHU1NzI4XHU4RkQ5XHU5MUNDXHU1MTk5ZW50cnlcdTU0MEVcdUZGMENcdTRGNjBcdTVDMDZcdTRFMERcdTk3MDBcdTg5ODFcdTU3MjhgaW5kZXguaHRtbGBcdTUxODVcdTZERkJcdTUyQTAgc2NyaXB0IFx1NjgwN1x1N0I3RVx1RkYwQ1x1NTM5Rlx1NjcwOVx1NjgwN1x1N0I3RVx1OTcwMFx1ODk4MVx1NTIyMFx1OTY2NFxyXG4gICAgICAgKiBAZGVmYXVsdCBzcmMvbWFpbi50c1xyXG4gICAgICAgKi9cclxuICAgICAgZW50cnk6IFwiL3NyYy9tYWluLnRzeFwiLFxyXG4gICAgICAvKipcclxuICAgICAgICogXHU5NzAwXHU4OTgxXHU2Q0U4XHU1MTY1IGluZGV4Lmh0bWwgZWpzIFx1NkEyMVx1NzI0OFx1NzY4NFx1NjU3MFx1NjM2RVxyXG4gICAgICAgKi9cclxuICAgICAgdGVtcGxhdGU6IFwicHVibGljL2luZGV4Lmh0bWxcIixcclxuICAgICAgaW5qZWN0OiB7XHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgLy8gXHU2N0U1XHU2MjdFLmVudi50ZXN0XHU2NTg3XHU0RUY2XHU5MUNDXHU5NzYyXHU3Njg0VklURV9QUk9KRUNUX1RJVExFXHVGRjBDXHU4QkY3XHU0RUU1VklURV9cdTY4MDdcdThCQzZcdTVGMDBcdTU5MzRcclxuICAgICAgICAgIHRpdGxlOiBcIlx1N0YxNlx1N0EwQlx1NzY4NFx1NTk0N1x1NjAxRFx1NTk5OVx1NjBGM1wiIHx8IG5hbWUsXHJcbiAgICAgICAgICBpbmplY3RTY3JpcHQ6IGA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIiBjcm9zc29yaWdpbiBzcmM9XCIvc3JjL21haW4udHN4XCI+PC9zY3JpcHQ+YFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFnczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpbmplY3RUbzogXCJib2R5LXByZXBlbmRcIixcclxuICAgICAgICAgICAgdGFnOiBcImRpdlwiLFxyXG4gICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgIGlkOiBcInRhZ1wiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgIH0pLFxyXG4gICAgLy8gXHU2Nzg0XHU1RUZBXHU1MzhCXHU3RjI5XHU2NTg3XHU0RUY2XHJcbiAgICB2aXRlQ29tcHJlc3Npb24oe1xyXG4gICAgICAvLyBcdThCQjBcdTVGNTVcdTUzOEJcdTdGMjlcdTY1ODdcdTRFRjZcdTUzQ0FcdTUxNzZcdTUzOEJcdTdGMjlcdTczODdcdTMwMDJcdTlFRDhcdThCQTR0cnVlXHJcbiAgICAgIHZlcmJvc2U6IHRydWUsXHJcbiAgICAgIC8vIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOFx1NTM4Qlx1N0YyOVx1RkYwQ1x1OUVEOFx1OEJBNGZhbHNlXHJcbiAgICAgIGRpc2FibGU6IGZhbHNlLFxyXG4gICAgICAvLyBcdTk3MDBcdTg5ODFcdTRGN0ZcdTc1MjhcdTUzOEJcdTdGMjlcdTUyNERcdTc2ODRcdTY3MDBcdTVDMEZcdTY1ODdcdTRFRjZcdTU5MjdcdTVDMEZcdUZGMENcdTUzNTVcdTRGNERcdTVCNTdcdTgyODJcdUZGMDhieXRlXHVGRjA5IGJcdUZGMEMxYihcdTVCNTdcdTgyODIpPThiaXQoXHU2QkQ0XHU3Mjc5KSwgMUtCPTEwMjRCXHJcbiAgICAgIHRocmVzaG9sZDogMTAyNDAsIC8vIFx1NTM3MzEwa2JcdTRFRTVcdTRFMEFcdTUzNzNcdTRGMUFcdTUzOEJcdTdGMjlcclxuICAgICAgLy8gXHU1MzhCXHU3RjI5XHU3Qjk3XHU2Q0Q1IFx1NTNFRlx1OTAwOSAnZ3ppcCcgfCAnYnJvdGxpQ29tcHJlc3MnIHwgJ2RlZmxhdGUnIHwgJ2RlZmxhdGVSYXcnXHJcbiAgICAgIGFsZ29yaXRobTogXCJnemlwXCIsXHJcbiAgICAgIC8vIFx1NTM4Qlx1N0YyOVx1NTQwRVx1NzY4NFx1NjU4N1x1NEVGNlx1NjgzQ1x1NUYwRlxyXG4gICAgICBleHQ6IFwiLmd6XCJcclxuICAgIH0pLFxyXG4gICAgdmlzdWFsaXplcih7XHJcbiAgICAgIGVtaXRGaWxlOiBmYWxzZSxcclxuICAgICAgZmlsZW5hbWU6IFwiYW5hbHlzaXMtY2hhcnQuaHRtbFwiLCAvLyBcdTUyMDZcdTY3OTBcdTU2RkVcdTc1MUZcdTYyMTBcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MERcclxuICAgICAgb3BlbjogdHJ1ZSAvLyBcdTU5ODJcdTY3OUNcdTVCNThcdTU3MjhcdTY3MkNcdTU3MzBcdTY3MERcdTUyQTFcdTdBRUZcdTUzRTNcdUZGMENcdTVDMDZcdTU3MjhcdTYyNTNcdTUzMDVcdTU0MEVcdTgxRUFcdTUyQThcdTVDNTVcdTc5M0FcclxuICAgIH0pXHJcbiAgXSxcclxuICBkZWZpbmU6IHtcclxuICAgIFJFQUNUX0FQUF9BUElfVVJMOiBKU09OLnN0cmluZ2lmeShodHRwVXJsKSxcclxuICAgIFJFQUNUX1BBQ0tBR0U6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgZGVwZW5kZW5jaWVzLFxyXG4gICAgICBkZXZEZXBlbmRlbmNpZXMsXHJcbiAgICAgIG5hbWUsXHJcbiAgICAgIHZlcnNpb24sXHJcbiAgICAgIGxhc3RCdWlsZFRpbWU6IGRheWpzKG5ldyBEYXRlKCkpLmZvcm1hdChcIllZWVktTU0tREQgSEg6bW06c3NcIilcclxuICAgIH0pLFxyXG4gICAgTk9ERV9FTlY6IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52Lk5PREVfRU5WKVxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIilcclxuICAgIH1cclxuICB9LFxyXG4gIHByZXZpZXc6IHtcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIC8vIFx1NEY3Rlx1NzUyOCBwcm94eSBcdTVCOUVcdTRGOEJcclxuICAgICAgLy8gXCIvbmVzdDMwMTFcIjoge1xyXG4gICAgICAvLyAgIHRhcmdldDogXCJodHRwczovL25lc3QtYWRtaW4uY29tL25lc3QzMDExL1wiLFxyXG4gICAgICAvLyAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgLy8gICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAvLyAgIGNvbmZpZ3VyZTogKHByb3h5LCBvcHRpb25zKSA9PiB7XHJcbiAgICAgIC8vICAgICByZXR1cm4gcHJveHk7XHJcbiAgICAgIC8vICAgfSxcclxuICAgICAgLy8gfSxcclxuICAgIH1cclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG1yOiB7fVxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG1pbmlmeTogXCJ0ZXJzZXJcIiwgLy8gXHU1RkM1XHU5ODdCXHU1RjAwXHU1NDJGXHVGRjFBXHU0RjdGXHU3NTI4IHRlcnNlck9wdGlvbnMgXHU2MjREXHU2NzA5XHU2NTQ4XHU2NzlDXHJcbiAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgIGNvbXByZXNzOiB7XHJcbiAgICAgICAgZHJvcF9jb25zb2xlOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyB0cnVlIDogZmFsc2UsXHJcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gdHJ1ZSA6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIC8vIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NTIwNlx1N0M3Qlx1NjI1M1x1NTMwNVxyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAvLyBcdTU3MjggVU1EIFx1Njc4NFx1NUVGQVx1NkEyMVx1NUYwRlx1NEUwQlx1NEUzQVx1OEZEOVx1NEU5Qlx1NTkxNlx1OTBFOFx1NTMxNlx1NzY4NFx1NEY5RFx1OEQ1Nlx1NjNEMFx1NEY5Qlx1NEUwMFx1NEUyQVx1NTE2OFx1NUM0MFx1NTNEOFx1OTFDRlxyXG4gICAgICAgIGdsb2JhbHM6IHt9LFxyXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBcImpzL1tuYW1lXS1baGFzaF0uanNcIixcclxuICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJqcy9bbmFtZV0tW2hhc2hdLmpzXCIsXHJcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IFwiW2V4dF0vW25hbWVdLVtoYXNoXS5bZXh0XVwiLFxyXG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xyXG4gICAgICAgICAgLy8gXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU1MjA2XHU2MkM2XHU2MjUzXHU1MzA1XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlkLnRvU3RyaW5nKCkuc3BsaXQoXCJub2RlX21vZHVsZXMvXCIpWzFdLnNwbGl0KFwiL1wiKVswXS50b1N0cmluZygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiIsICJ7XHJcbiAgXCJuYW1lXCI6IFwibmVzdC1hZG1pbi13ZWJcIixcclxuICBcInZlcnNpb25cIjogXCIyLjAuMFwiLFxyXG4gIFwiZGVzY3JpcHRpb25cIjogXCJcIixcclxuICBcImF1dGhvclwiOiBcInFrc3RhcnRAZm94bWFpbC5jb21cIixcclxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcclxuICBcInNjcmlwdHNcIjoge1xyXG4gICAgXCJkZXZcIjogXCJ2aXRlIC0taG9zdFwiLFxyXG4gICAgXCJidWlsZFwiOiBcInZpdGUgYnVpbGRcIixcclxuICAgIFwibGludFwiOiBcImVzbGludCAuIC0tZXh0IHRzLHRzeCAtLXJlcG9ydC11bnVzZWQtZGlzYWJsZS1kaXJlY3RpdmVzIC0tbWF4LXdhcm5pbmdzIDBcIixcclxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlld1wiLFxyXG4gICAgXCJsaW50OmZpeFwiOiBcImVzbGludCAuIC0tZml4XCIsXHJcbiAgICBcInByZXR0aWVyXCI6IFwicHJldHRpZXIgLS13cml0ZSAuXCIsXHJcbiAgICBcInRlc3RcIjogXCJ2aXRlc3RcIlxyXG4gIH0sXHJcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xyXG4gICAgXCJAYW50LWRlc2lnbi9pY29uc1wiOiBcIl41LjIuNlwiLFxyXG4gICAgXCJAcmVhY3Qtc3ByaW5nL3dlYlwiOiBcIl45LjcuM1wiLFxyXG4gICAgXCJhbmltYXRlLmNzc1wiOiBcIl40LjEuMVwiLFxyXG4gICAgXCJhbnRkXCI6IFwiXjUuMTMuMVwiLFxyXG4gICAgXCJheGlvc1wiOiBcIl4xLjYuNVwiLFxyXG4gICAgXCJieXRlc1wiOiBcIl4zLjEuMlwiLFxyXG4gICAgXCJjYXB0Y2hhLW1pbmlcIjogXCJeMS4xLjBcIixcclxuICAgIFwiZDNcIjogXCJeNy44LjVcIixcclxuICAgIFwiZGF5anNcIjogXCJeMS4xMS4xMFwiLFxyXG4gICAgXCJlY2hhcnRzXCI6IFwiXjUuNC4zXCIsXHJcbiAgICBcImVjaGFydHMtd29yZGNsb3VkXCI6IFwiXjIuMS4wXCIsXHJcbiAgICBcImh0bWwyY2FudmFzXCI6IFwiXjEuNC4xXCIsXHJcbiAgICBcImxvZGFzaC1lc1wiOiBcIl40LjE3LjIxXCIsXHJcbiAgICBcInFzXCI6IFwiXjYuMTEuMlwiLFxyXG4gICAgXCJyZWFjdFwiOiBcIl4xOC4yLjBcIixcclxuICAgIFwicmVhY3QtYm1hcFwiOiBcIl4xLjAuMTMxXCIsXHJcbiAgICBcInJlYWN0LWNhcmQtZmxpcFwiOiBcIl4xLjIuMlwiLFxyXG4gICAgXCJyZWFjdC1jb3VudHVwXCI6IFwiXjYuNS4wXCIsXHJcbiAgICBcInJlYWN0LWRvbVwiOiBcIl4xOC4yLjBcIixcclxuICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiOiBcIl42LjIxLjJcIixcclxuICAgIFwicmVhY3QtdHJhbnNpdGlvbi1ncm91cFwiOiBcIl40LjQuNVwiLFxyXG4gICAgXCJzb2NrZXQuaW8tY2xpZW50XCI6IFwiXjQuNy40XCJcclxuICB9LFxyXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiQHR5cGVzL2J5dGVzXCI6IFwiXjMuMS40XCIsXHJcbiAgICBcIkB0eXBlcy9kM1wiOiBcIl43LjQuM1wiLFxyXG4gICAgXCJAdHlwZXMvbm9kZVwiOiBcIl4yMC4xMS4yXCIsXHJcbiAgICBcIkB0eXBlcy9xc1wiOiBcIl42LjkuMTFcIixcclxuICAgIFwiQHR5cGVzL3JlYWN0XCI6IFwiXjE4LjIuNDNcIixcclxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIl4xOC4yLjE3XCIsXHJcbiAgICBcIkB0eXBlcy9yZWFjdC10cmFuc2l0aW9uLWdyb3VwXCI6IFwiXjQuNC4xMFwiLFxyXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIl42LjE5LjBcIixcclxuICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L3BhcnNlclwiOiBcIl42LjE0LjBcIixcclxuICAgIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjogXCJeNC4yLjFcIixcclxuICAgIFwiZXNsaW50XCI6IFwiXjguNTYuMFwiLFxyXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0LWhvb2tzXCI6IFwiXjQuNi4wXCIsXHJcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3QtcmVmcmVzaFwiOiBcIl4wLjQuNVwiLFxyXG4gICAgXCJlc2xpbnQtcGx1Z2luLXVudXNlZC1pbXBvcnRzXCI6IFwiXjMuMC4wXCIsXHJcbiAgICBcInByZXR0aWVyXCI6IFwiMy4yLjRcIixcclxuICAgIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI6IFwiXjUuMTIuMFwiLFxyXG4gICAgXCJzYXNzXCI6IFwiXjEuNjkuN1wiLFxyXG4gICAgXCJ0ZXJzZXJcIjogXCJeNS4zNy4wXCIsXHJcbiAgICBcInR5cGVzY3JpcHRcIjogXCJeNS43LjJcIixcclxuICAgIFwidml0ZVwiOiBcIl41LjQuMTFcIixcclxuICAgIFwidml0ZS1wbHVnaW4tY29tcHJlc3Npb25cIjogXCJeMC41LjFcIixcclxuICAgIFwidml0ZS1wbHVnaW4taHRtbFwiOiBcIl4zLjIuMlwiXHJcbiAgfSxcclxuICBcImxpY2Vuc2VcIjogXCJNSVRcIlxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFEsT0FBTyxVQUFVO0FBQy9SLFNBQVMsb0JBQW9CO0FBRTdCLE9BQU8sV0FBVztBQUNsQixPQUFPLFdBQVc7QUFDbEIsU0FBUyxrQkFBa0I7QUFDM0IsT0FBTyxxQkFBcUI7OztBQ0wxQixXQUFRO0FBQ1IsY0FBVztBQWFYLG1CQUFnQjtBQUFBLEVBQ2QscUJBQXFCO0FBQUEsRUFDckIscUJBQXFCO0FBQUEsRUFDckIsZUFBZTtBQUFBLEVBQ2YsTUFBUTtBQUFBLEVBQ1IsT0FBUztBQUFBLEVBQ1QsT0FBUztBQUFBLEVBQ1QsZ0JBQWdCO0FBQUEsRUFDaEIsSUFBTTtBQUFBLEVBQ04sT0FBUztBQUFBLEVBQ1QsU0FBVztBQUFBLEVBQ1gscUJBQXFCO0FBQUEsRUFDckIsYUFBZTtBQUFBLEVBQ2YsYUFBYTtBQUFBLEVBQ2IsSUFBTTtBQUFBLEVBQ04sT0FBUztBQUFBLEVBQ1QsY0FBYztBQUFBLEVBQ2QsbUJBQW1CO0FBQUEsRUFDbkIsaUJBQWlCO0FBQUEsRUFDakIsYUFBYTtBQUFBLEVBQ2Isb0JBQW9CO0FBQUEsRUFDcEIsMEJBQTBCO0FBQUEsRUFDMUIsb0JBQW9CO0FBQ3RCO0FBQ0Esc0JBQW1CO0FBQUEsRUFDakIsZ0JBQWdCO0FBQUEsRUFDaEIsYUFBYTtBQUFBLEVBQ2IsZUFBZTtBQUFBLEVBQ2YsYUFBYTtBQUFBLEVBQ2IsZ0JBQWdCO0FB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
