// 测试服务器是否正常启动
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers:`, res.headers);
  
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error('服务器连接失败:', error.message);
  console.log('请确保服务器正在运行：node server.cjs');
});

req.end();
