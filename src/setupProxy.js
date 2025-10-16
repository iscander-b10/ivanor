// const { createProxyMiddleware } = require('http-proxy-middleware');

// module.exports = function(app) {
//   app.use(
//     '/api/',
//     createProxyMiddleware({
//       target: 'https://api.4tochki.ru',
//       changeOrigin: true,
//       secure: false
//     })
//   );
// };

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/shinservice',
    createProxyMiddleware({
      target: 'http://vendor.shinservice.ru',
      changeOrigin: true,
      pathRewrite: {
        '^/api/shinservice': '',
      },
    })
  );
};