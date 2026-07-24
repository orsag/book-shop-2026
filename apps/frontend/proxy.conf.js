module.exports = [
  {
    context: ['/api/videos'],
    target: 'http://localhost:3000',
    secure: false,
    logLevel: 'debug',
    changeOrigin: true,
    // Disable response buffering so streaming/Range requests work
    onProxyRes(proxyRes, req) {
      proxyRes.headers['X-Accel-Buffering'] = 'no';
    },
  },
  {
    context: ['/api'],
    target: 'http://localhost:3000',
    secure: false,
    logLevel: 'debug',
    changeOrigin: true,
  },
];
