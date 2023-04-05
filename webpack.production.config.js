/** 这是用于生产环境的webpack配置文件 **/
const path = require("path");
const sass = require("sass");
const webpack = require("webpack"); // webpack核心
const webpackbar = require("webpackbar"); // 进度条
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 将CSS提取出来，而不是和js混在一起
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); // 对CSS进行压缩
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 生成html
const AntdDayjsWebpackPlugin = require("antd-dayjs-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // 每次打包前清除旧的build文件夹
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin"); // 用于直接复制public中的文件到打包的最终文件夹中
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");

// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin; // 分析打包后各个包的大小

const prodConfig = {
  REACT_APP_API_URL: "https://nest-admin.com/nest3011/api/"
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
  mode: "production",
  target: "browserslist",
  entry: path.resolve(__dirname, "src", "index"),
  output: {
    path: path.resolve(__dirname, "dist"), // 将文件打包到此目录下
    filename: "js/[name].[chunkhash:8].js",
    chunkFilename: "js/[name].[chunkhash:8].chunk.js"
  },
  stats: {
    children: false // 不输出子模块的打包信息
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true, // 多线程并行构建
        terserOptions: {
          // https://github.com/terser/terser#minify-options
          compress: {
            warnings: false, // 删除无用代码时是否给出警告
            drop_debugger: true, // 删除所有的debugger
            drop_console: false // 删除所有的console.*
            // pure_funcs: ["console.log"], // 删除所有的console.log
          }
        }
      }),
      new CssMinimizerPlugin()
    ],
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
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"]
      },
      {
        test: cssModuleRegex,
        include: [path.resolve(__dirname, "src")],
        use: [
          MiniCssExtractPlugin.loader,
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
          MiniCssExtractPlugin.loader,
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
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          {
            loader: "less-loader",
            options: { lessOptions: { javascriptEnabled: true } }
          }
        ],
        sideEffects: true
      },
      {
        test: lessModuleRegex,
        include: [path.resolve(__dirname, "src")],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              modules: {
                getLocalIdent: getCSSModuleLocalIdent
              }
            }
          },
          "postcss-loader",
          "less-loader"
        ]
      },
      // scss 解析规则
      {
        test: sassModuleRegex,
        use: [
          MiniCssExtractPlugin.loader,
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
          MiniCssExtractPlugin.loader,
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
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "stylus-loader"]
      },
      {
        test: stylModuleRegex,
        use: [
          MiniCssExtractPlugin.loader,
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
        type: "asset/resource",
        generator: {
          // geneator 中是个对象，配置下 filename，和output中设置 assetModuleFilename 一样，将资源打包至 files 文件夹
          filename: "files/[name].[hash:6][ext]" //[name]指原来的名字，[hash:6]取哈希的前六位，[ext]指原来的扩展名
        }
      },
      {
        // 图片解析
        test: /\.(png|jpg|jpeg|gif)(\?|$)/i,
        include: path.resolve(__dirname, "src"),
        type: "asset",
        parser: {
          //data转成url的条件，也就是转成bas64的条件,maxSize相当于limit
          dataUrlCondition: { maxSize: 8 * 1024 }
        },
        generator: {
          //geneator中是个对象，配置下filename，和output中设置assetModuleFilename一样，将资源打包至images文件夹
          filename: "images/[name].[hash:6][ext]" //[name]指原来的名字，[hash:6]取哈希的前六位，[ext]指原来的扩展名
        }
      },
      {
        // wasm文件解析
        test: /\.wasm$/,
        include: path.resolve(__dirname, "src"),
        type: "webassembly/experimental",
        generator: {
          //geneator中是个对象，配置下filename，和output中设置assetModuleFilename一样，将资源打包至 files 文件夹
          filename: "files/[name].[hash:6][ext]" //[name]指原来的名字，[hash:6]取哈希的前六位，[ext]指原来的扩展名
        }
      },
      {
        // xml文件解析
        test: /\.xml$/,
        include: path.resolve(__dirname, "src"),
        use: ["xml-loader"],
        generator: {
          //geneator中是个对象，配置下filename，和output中设置assetModuleFilename一样，将资源打包至 files 文件夹
          filename: "files/[name].[hash:6][ext]" //[name]指原来的名字，[hash:6]取哈希的前六位，[ext]指原来的扩展名
        }
      }
    ]
  },
  plugins: [
    /**
     * 打包前删除上一次打包留下的旧代码（根据output.path）
     * https://github.com/johnagan/clean-webpack-plugin
     * **/
    new CleanWebpackPlugin(),
    new webpackbar({
      // 打包时美化进度条
      name: "Caravan",
      color: "#000"
    }),
    new AntdDayjsWebpackPlugin(),
    /**
     * 在window环境中注入全局变量,虽然暂时没用上，不过在真实开发中应该会用到
     * **/
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(prodConfig)
    }),
    /**
     * 提取CSS等样式生成单独的CSS文件,不然最终文件只有js； css全部包含在js中
     * https://github.com/webpack-contrib/mini-css-extract-plugin
     * **/
    new MiniCssExtractPlugin({
      filename: "css/[name].[chunkhash:8].css" // 生成的文件名
    }),
    /**
     * 自动生成HTML，并注入各参数
     * https://github.com/jantimon/html-webpack-plugin
     * **/
    new HtmlWebpackPlugin({
      title: "Caravan",
      filename: "index.html", // 生成的html存放路径，根据模板插入css/js等生成最终HTML,相对于 output.path
      template: path.resolve(__dirname, "./public/index.html"),
      favicon: path.resolve(__dirname, "./public/favicon.ico"), // 自动把根目录下的favicon.ico图片加入html
      hash: false, // 防止缓存，在引入的文件后面加hash (PWA就是要缓存，这里设置为false)
      inject: true // 是否将js放在body的末尾,
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
