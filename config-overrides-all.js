const {
  override,
  fixBabelImports,
  addLessLoader,
  // addWebpackAlias,
  addBabelPlugins,
  addWebpackPlugin,
  //   useBabelRc,
  // disableChunk,
  // adjustWorkbox,
  setWebpackPublicPath
  // addBundleVisualizer,
  // disableEsLint
  // addWebpackExternals
  // addBundleVisualizer
} = require('customize-cra');

// const path = require('path');
// const paths = require('react-scripts/config/paths');
// const rewireReactHotLoader = require('react-app-rewire-hot-loader');
// const CompressionWebpackPlugin = require('compression-webpack-plugin');
// const rewireCompressionPlugin = require('react-app-rewire-compression-plugin')
// const rewireUglifyjs = require('react-app-rewire-uglifyjs');
// const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//const LodashWebpackPlugin = require('lodash-webpack-plugin'); // 补充：对开发友好，打包完成桌面提醒
// const WebpackBuildNotifierPlugin = require('webpack-build-notifier');

// const webpackConfig = require('./webpack.config.js');
// const ProgressBarPlugin = require('progress-bar-webpack-plugin')

// const Dashboard = require('webpack-dashboard')
// const DashboardPlugin = require('webpack-dashboard/plugin')
// const dashboard = new Dashboard()

// const theme = require('./theme');
// SKIP_PREFLIGHT_CHECK = true

/**
 * 生产环境是否打包 Source Map 两种方法
 *
 */
// const rewiredMap = () => config => {
//   config.devtool = config.mode === 'development' ? 'cheap-module-source-map' : false;

//   return config;
// };
process.env.PORT = 3006;

// eslint-disable-next-line no-unused-expressions
process.env.GENERATE_SOURCEMAP !== 'false';

console.log(process.env.NODE_ENV);

// const addWebpackModules = () => config => {
//   const loaders = config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf
//   loaders[loaders.length - 4] = Object.assign(
//     loaders[loaders.length - 4],
//     webpackConfig.module.rules[0]
//   )
//   return config
// }

// path
// const resolveAlias = dir => path.join(__dirname, '.', dir);
// 热跟新
// const hotLoader = () => (config, env) => {
//   config = rewireReactHotLoader(config, env);
//   return config;
// };
// build--->prod --->文件设置
// const appBuildPathFile = () => config => {
//   if (config.mode === 'development') {
//     console.log('evn is development, skip build path change...');
//   } else if (config.mode === 'production') {
//     console.log('evn is production, change build path...');
//     // 关闭sourceMap
//     config.devtool = false;
//     //  // 配置打包后的文件位置修改path目录
//     paths.appBuild = path.join(path.dirname(paths.appBuild), 'dist');
//     config.output.path = path.join(path.dirname(config.output.path), 'dist');
//     // 添加js打包gzip配置
//     config.plugins.push(
//       new CompressionWebpackPlugin({
//         test: /\.js$|\.css$/,
//         threshold: 1024
//       })
//     );
//     // 更改生产模式输出的文件名
//     // config.output.filename = 'static/js/[name].js?_v=[chunkhash:8]'
//     // config.output.chunkFilename = 'static/js/[name].chunk.js?_v=[chunkhash:8]'
//   }
//   return config;
// };
//生产环境去除console.* functions
// const dropConsole = () => {
//   return config => {
//     if (config.optimization.minimizer) {
//       config.optimization.minimizer.forEach(minimizer => {
//         if (minimizer.constructor.name === 'TerserPlugin') {
//           minimizer.options.terserOptions.compress.drop_console = true;
//         }
//       });
//     }
//     return config;
//   };
// };
/**
 *
 * @description 解决打包的时候如下报错
 * @url{https://github.com/ant-design/ant-design/issues/15696}
 * https://blog.csdn.net/peade/article/details/84890399
chunk 3 [mini-css-extract-plugin]
Conflicting order between:
 * css ./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-7-1!./node_modules/postcss-loader/src??postcss!./node_modules/less-loader/dist/cjs.js??ref--6-oneOf-7-3!./node_modules/antd/es/input/style/index.less
 * css ./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-7-1!./node_modules/postcss-loader/src??postcss!./node_modules/less-loader/dist/cjs.js??ref--6-oneOf-7-3!./node_modules/antd/es/message/style/index.less
 */
// const delConflictingOrder = () => {
//   return config => {
//     for (let i = 0; i < config.plugins.length; i++) {
//       const p = config.plugins[i];
//       if (!!p.constructor && p.constructor.name === MiniCssExtractPlugin.name) {
//         const miniCssExtractOptions = { ...p.options, ignoreOrder: true };
//         config.plugins[i] = new MiniCssExtractPlugin(miniCssExtractOptions);
//         break;
//       }
//     }
//   };
// };

// const addMiniCssExtractPlugin = () => {
//   return config => {
//     config.plugins.unshift(
//       new FilterWarningsPlugin({
//         // exclude: /any-warnings-matching-this-will-be-hidden/
//         // exclude: /mini-css-extract-plugin[^]*Conflicting order between:/
//         exclude: /\[mini-css-extract-plugin\][^]*Conflicting order between:/
//       })
//     );
//   };
// };

// const proxyApi = {
//   '/api': {
//     // target: '', // prod
//     changeOrigin: true,
//     secure: false,
//     xfwd: false,
//     pathRewrite: {
//       '^/api': '/'
//     }
//   },
//   '/store': {
//     // target: '', // staging
//     changeOrigin: true,
//     secure: false,
//     xfwd: false,
//     pathRewrite: {
//       '^/store': '/'
//     }
//   }
// };

module.exports = {
  webpack: override(
    fixBabelImports('import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true
    }),
    addLessLoader({
      // strictMath: true,
      noIeCompat: true,
      javascriptEnabled: true,
      modifyVars: {
        // antd 定制主题颜色，自己修改
        '@primary-color': '#1890ff', // 全局主色
        '@link-color': '#1890ff', // 链接色
        '@success-color': '#52c41a', // 成功色
        '@warning-color': '#faad14', // 警告色
        '@error-color': '#f5222d', // 错误色
        '@font-size-base': '12px', // 主字号
        '@heading-color': 'rgba(0, 0, 0, 0.85)', // 标题色
        '@text-color': 'rgba(0, 0, 0, 0.65)', // 主文本色
        '@text-color-secondary': 'rgba(0, 0, 0, 0.45)', // 次文本色
        '@disabled-color': 'rgba(0, 0, 0, 0.25)', // 失效色
        '@border-radius-base': '2px', // 组件/浮层圆角
        '@border-color-base': '#d9d9d9', // 边框色
        '@box-shadow-base':
          '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)' // 浮层阴影
      }
      // localIdentName: '[local]--[hash:base64:5]', // 自定义 CSS Modules 的 localIdentName
    }),
    setWebpackPublicPath('/'), // 修改 publicPath
    // addWebpackExternals({
    //   React: 'React',
    //   lodash: 'Lodash'
    // }),
    // addWebpackModules(),
    // addWebpackAlias({
    //   '@': resolveAlias('src'),
    //   lib: resolveAlias('src/lib'),
    //   components: resolveAlias('src/components'),
    //   images: resolveAlias('src/assets/images'),
    //   styled: resolveAlias('src/assets/styled'),
    //   views: resolveAlias('src/views'),
    //   store: resolveAlias('src/store'),
    //   router: resolveAlias('src/router'),
    //   locale: resolveAlias('src/locale'),
    //   // 处理警告  React-Hot-Loader: react-🔥-dom patch is not detected. React 16.6+ features may not work.
    //   'react-dom': '@hot-loader/react-dom'
    //   // 解决antd 的icon图标打包体积大
    //   // '@ant-design/icons': 'purched-antd-icons'
    // }),

    // disableEsLint(),
    // appBuildPathFile(),
    // disableChunk(),
    // dropConsole(),
    // 关闭mapSource
    // rewiredMap(),
    // 热跟新
    // hotLoader(),
    // 配置babel解析器
    addBabelPlugins(['@babel/plugin-proposal-decorators', { legacy: true }])
    //启用ES7的修改器语法（babel 7）
    // ['@babel/plugin-proposal-decorators', {legacy: true}],
    // ['@babel/plugin-proposal-class-properties', {loose: true}],
    // 打包编译完成提醒
    // addWebpackPlugin(
    // new WebpackBuildNotifierPlugin({
    //   title: '',
    //   logo: path.resolve('./public/logo.svg'),
    //   suppressSuccess: true
    // }),
    // new MiniCssExtractPlugin({
    //   filename: 'static/css/[name].[contenthash].css',
    //   chunkFilename: 'static/css/[id].[contenthash].css',
    //   ignoreOrder: false
    //   // moduleFilename: ({ name }) => `${name.replace('/js/', '/css/')}.css`
    // }),
    // new LodashWebpackPlugin({ collections: true, paths: true }) // 美化控制台
    // new DashboardPlugin(dashboard.setData),
    // 进度条
    // new ProgressBarPlugin(),
    // delConflictingOrder()
    // addMiniCssExtractPlugin()
    // ),
    // rewireUglifyjs
    // rewireCompressionPlugin,
    // 允许使用.babelrc文件进行Babel配置。
    // useBabelRc(),
    // add webpack bundle visualizer if BUNDLE_VISUALIZE flag is enabled
    // process.env.BUNDLE_VISUALIZE === 1 && addBundleVisualizer(),

    // adjustWorkbox(wb =>
    //   Object.assign(wb, {
    //     skipWaiting: true,
    //     exclude: (wb.exclude || []).concat('index.html')
    //   })
    // )
    // addDecoratorsLegacy() // 解析器,
  )
  // 配置devServer
  // devServer: overrideDevServer(
  //   // dev server plugin
  //   watchAll(),
  // ),
  // 配置devServer
  // devServer: configFunction => (proxy, allowedHost) => {
  //   proxy = process.env.NODE_ENV === 'development' ? proxyApi : null;
  //   // allowedHost： 添加额外的地址
  //   const config = configFunction(proxy, allowedHost);
  //   return config;
  // }
};
