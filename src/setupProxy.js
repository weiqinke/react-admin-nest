/**
 * 代理跨域配置
 */
const proxy = require('http-proxy-middleware');
console.log('proxy: ', proxy);

module.exports = function(app) {
  app.use(
    // 一般使用
    // proxy('http://localhost:2000')

    proxy('/api', {
      target: `http://localhost:${process.env.PORT}/api`,
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    }),
    proxy('/nestapi', {
      target: `http://localhost:3011/api`,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      }
    })
  );
};
