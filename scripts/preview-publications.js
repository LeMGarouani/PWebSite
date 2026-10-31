const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { handler: halHandler } = require('../functions/hal-publications');

const hugo = spawn(path.join(__dirname, '../node_modules/.bin/hugo/hugo'), [
  'server', '--bind=127.0.0.1', '--port=1314',
  '--baseURL=http://localhost:8888/', '--appendPort=false', '--disableLiveReload',
  '--disableFastRender',
], { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

const server = http.createServer(async (request, response) => {
  if (/^\/publications-(?:orcid|hal)\/?$/.test(request.url.split('?')[0])) {
    response.writeHead(301, { Location: '/publications/' });
    response.end();
    return;
  }
  if (request.url.split('?')[0] === '/.netlify/functions/hal-publications') {
    const result = await halHandler({ httpMethod: request.method });
    response.writeHead(result.statusCode, result.headers);
    response.end(result.body);
    return;
  }
  const upstream = http.request({
    hostname: '127.0.0.1',
    port: 1314,
    path: request.url,
    method: request.method,
    headers: { ...request.headers, host: 'localhost:8888' },
  }, (result) => {
    response.writeHead(result.statusCode, result.headers);
    result.pipe(response);
  });
  upstream.on('error', (error) => {
    console.error('Hugo preview proxy failed:', error);
    if (!response.headersSent) response.writeHead(502, { 'Content-Type': 'text/plain' });
    response.end('The Hugo preview is unavailable. Check the preview terminal.');
  });
  request.pipe(upstream);
});

server.listen(8888, '127.0.0.1', () => {
  console.log('Publications: http://localhost:8888/publications/');
});

server.on('error', (error) => {
  console.error('Publications preview server failed:', error);
  hugo.kill();
  process.exitCode = 1;
});
hugo.on('error', (error) => {
  console.error('Unable to start Hugo:', error);
  server.close();
  process.exitCode = 1;
});
hugo.on('exit', (code) => {
  server.close();
  if (code) process.exitCode = code;
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    hugo.kill();
    server.close();
  });
}
