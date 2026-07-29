const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4200;
const PUBLIC_DIR = path.join(__dirname, 'dist/apps/frontend/browser');
const BACKEND_URL = 'http://127.0.0.1:3000';

const server = http.createServer((req, res) => {
  // 1. Proxy /api requests to NestJS backend
  if (req.url.startsWith('/api')) {
    const backendReq = http.request(
      `${BACKEND_URL}${req.url}`,
      {
        method: req.method,
        headers: req.headers,
      },
      (backendRes) => {
        res.writeHead(backendRes.statusCode, backendRes.headers);
        backendRes.pipe(res, { end: true });
      },
    );

    backendReq.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy Error: ' + err.message);
    });

    req.pipe(backendReq, { end: true });
    return;
  }

  // 2. Serve static Angular frontend files (with SPA fallback to index.html)
  let filePath = path.join(
    PUBLIC_DIR,
    req.url === '/' ? 'index.html' : req.url,
  );

  fs.stat(filePath, (err, stats) => {
    if (err || stats.isDirectory()) {
      // Fallback to index.html for SPA client-side routing
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      // Simple content-type resolver
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.json') contentType = 'application/json';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(
    `🚀 Custom Node proxy & static server running at http://127.0.0.1:${PORT}`,
  );
});
