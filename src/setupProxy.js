const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/deepseek',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api/deepseek': '/recommend', // Rewrite to the correct endpoint
      },
      onProxyReq: function(proxyReq, req, res) {
        // Log proxy request
        console.log('Proxying request:', {
          method: req.method,
          path: req.path,
          headers: req.headers
        });

        // Ensure content-length is correct after modifications
        if (req.body) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      onProxyRes: function(proxyRes, req, res) {
        // Log proxy response
        console.log('Proxy response:', {
          status: proxyRes.statusCode,
          headers: proxyRes.headers
        });

        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      },
      onError: function(err, req, res) {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );
}; 