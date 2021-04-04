const { override, addLessLoader, setWebpackPublicPath, fixBabelImports, adjustStyleLoaders } = require('customize-cra');
process.env.PORT = 3006;
// eslint-disable-next-line no-unused-expressions
process.env.GENERATE_SOURCEMAP !== 'false';
/***生产环境是否打包 Source Map 两种方法 */
const rewiredSourceMap = () => config => {
  config.devtool = config.mode === 'development' ? 'cheap-module-source-map' : 'cheap-module-source-map';
  return config;
};

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true
  }),
  addLessLoader({
    modifyVars: {
      // antd 定制主题颜色，自己修改
      '@primary-color': '#1890ff', // 全局主色
    },
    javascriptEnabled: true
  }),
  adjustStyleLoaders(rule => {
    if (rule.test.toString().includes("scss")) {
      rule.use.push({
        loader: require.resolve("sass-resources-loader"),
        options: {
          resources: "./src/style/scss/App.scss" //这里是你自己放公共scss变量的路径
        }
      });
    }
  }),
  setWebpackPublicPath('/'), // 修改 publicPath
  rewiredSourceMap()
);
