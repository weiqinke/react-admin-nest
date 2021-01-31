const { override, addLessLoader, setWebpackPublicPath, fixBabelImports } = require('customize-cra');
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
    },
    javascriptEnabled: true
  }),
  setWebpackPublicPath('/'), // 修改 publicPath
  // new BundleAnalyzerPlugin(),
  rewiredSourceMap()
);
