/** 这是用于开发环境的webpack配置文件 **/
const path = require("path"); // 获取绝对路径用
const webpack = require("webpack"); // webpack核心
const webpackbar = require("webpackbar"); // 进度条
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 动态生成html插件
const AntdDayjsWebpackPlugin = require("antd-dayjs-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin"); // 用于直接复制public中的文件到打包的最终文件夹中
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");

const envConfig = {
  // REACT_APP_API_URL: "https://nest-admin.com/nest3011/api/"
  REACT_APP_API_URL: "http://localhost:3011/api/"
};

// css/css module 正则表达式
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
// sass/sass module 正则表达式
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
// less/less module 正则表达式
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;
// stylus/stylus module 正则表达式
const stylRegex = /\.styl$/;
const stylModuleRegex = /\.module\.styl$/;

module.exports = {
  mode: "development",
  devtool: "eval-cheap-module-source-map", // 报错的时候在控制台输出哪一行报错eval-source-map
  target: ["web", "es5"],
  devServer: {
    open: true,
    hot: true,
    port: 8080,
    client: {
      progress: true
    }
  },
  // 入口文件，webpack 会首先从这里开始编译
  entry: {
    app: "./src/index.tsx"
  },
  // 定义了打包后输出的位置，以及对应的文件名
  output: {
    path: path.resolve(__dirname, "./dist"), // 将打包好的文件放在此路径下，dev模式中，只会在内存中存在，不会真正的打包到此路径
    // [name] 是个占位符，等价于 entry 中定义的 key 值，即 app
    filename: "bundle-[contenthash].js", // 编译后的文件名字
    assetModuleFilename: "assets/[name].[hash:4][ext]"
  },

  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [path.resolve(__dirname, "src")],
        use: [
          "thread-loader",
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env" //使用这个预设，会根据浏览器来选择插件转化ES5
              ]
            }
          }
        ]
      },
      {
        test: cssRegex,
        include: [path.resolve(__dirname, "src")],
        exclude: cssModuleRegex,
        use: ["style-loader", "css-loader", "postcss-loader"]
      },
      {
        test: cssModuleRegex,
        include: [path.resolve(__dirname, "src")],
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                getLocalIdent: getCSSModuleLocalIdent
              }
            }
          },
          "postcss-loader"
        ]
      },
      {
        test: cssRegex, // antd样式处理
        exclude: [/src/],
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1
            }
          }
        ]
      },
      // less 解析规则
      {
        test: lessRegex,
        exclude: lessModuleRegex,
        include: [path.resolve(__dirname, "src")],
        use: [
          "style-loader",
          "css-loader",
          "postcss-loader",
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                paths: [path.resolve(__dirname, "src"), path.resolve(__dirname, "node_modules/antd")],
                javascriptEnabled: true
              }
            }
          }
        ]
      },
      {
        test: lessModuleRegex,
        include: [path.resolve(__dirname, "src")],
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                getLocalIdent: getCSSModuleLocalIdent
              }
            }
          },
          "postcss-loader",
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      },
      // scss 解析规则
      {
        test: sassModuleRegex,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                getLocalIdent: getCSSModuleLocalIdent
              }
            }
          },
          "postcss-loader",
          "sass-loader"
        ]
      },
      {
        test: sassRegex,
        exclude: sassModuleRegex,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("autoprefixer")]
              }
            }
          },
          {
            loader: "sass-loader",
            options: {
              // `dart-sass` 是首选
              implementation: require("sass"),
              sourceMap: true
            }
          }
        ]
      },
      // stylus 解析规则
      {
        test: stylRegex,
        exclude: stylModuleRegex,
        use: ["style-loader", "css-loader", "postcss-loader", "stylus-loader"]
      },
      {
        test: stylModuleRegex,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                getLocalIdent: getCSSModuleLocalIdent
              }
            }
          },
          "postcss-loader",
          "stylus-loader"
        ]
      },
      {
        // 文件解析
        test: /\.(eot|woff|otf|svg|ttf|woff2|appcache|mp3|mp4|pdf)(\?|$)/,
        include: path.resolve(__dirname, "src"),
        type: "asset/resource"
      },
      {
        // 图片解析
        test: /\.(png|jpg|jpeg|gif)(\?|$)/i,
        include: path.resolve(__dirname, "src"),
        type: "asset"
      },
      {
        // wasm文件解析
        test: /\.wasm$/,
        include: path.resolve(__dirname, "src"),
        type: "webassembly/experimental"
      },
      {
        // xml文件解析
        test: /\.xml$/,
        include: path.resolve(__dirname, "src"),
        use: ["xml-loader"]
      }
    ]
  },
  plugins: [
    new webpackbar({
      name: "Caravan",
      color: "#000"
    }),
    new webpack.HotModuleReplacementPlugin(), // 热更新插件
    new AntdDayjsWebpackPlugin(),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(envConfig)
    }),
    new HtmlWebpackPlugin({
      // 根据模板插入css/js等生成最终HTML
      title: "Caravan",
      favicon: path.resolve(__dirname, "./public/favicon.ico"), // 自动把根目录下的favicon.ico图片加入html
      template: path.resolve(__dirname, "./public/index.html"),
      filename: "index.html", //生成的html存放路径，相对于 output.path
      inject: true // 是否将js放在body的末尾
    }),
    /**
     * 拷贝public中的文件到最终打包文件夹里
     * https://github.com/webpack-contrib/copy-webpack-plugin
     * */
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: "./",
          globOptions: {
            ignore: ["**/favicon.ico", "**/index.html"]
          },
          noErrorOnMissing: true
        }
      ]
    })
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", "json"], // 后缀名自动补全
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
};
