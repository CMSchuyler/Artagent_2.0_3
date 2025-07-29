# PayloadTooLargeError 错误解决方案

## 问题描述
`PayloadTooLargeError: request entity too large` 错误是因为base64图片数据太大，超过了Express服务器默认的请求体大小限制。

## 已实施的解决方案

### 1. 服务器配置更新
已在 `server.cjs` 中更新了Express中间件配置：

```javascript
// 增加请求体大小限制以支持base64图片数据（设置为100MB以确保足够大）
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 50000 }));
```

### 2. 手动重启服务器步骤

1. **停止当前服务器**：
   - 在运行服务器的终端中按 `Ctrl+C`
   - 或者关闭运行服务器的终端窗口

2. **重新启动服务器**：
   ```bash
   cd "d:\Artagent\git\Artagent"
   node server.cjs
   ```

3. **验证服务器状态**：
   - 访问 `http://localhost:3002/api/health`
   - 应该看到包含 `limits: { json: '100mb', urlencoded: '100mb' }` 的响应

### 3. 测试健康检查
运行测试脚本检查服务器状态：
```bash
node test-server.js
```

### 4. 验证修复
重启服务器后，再次尝试生成图片，错误应该消失。

## 数据大小分析
- 单个base64图片文件约 1.5MB
- 设置100MB限制足以处理多张高质量图片
- 前端请求现在应该能够正常发送base64数据

## 备用解决方案（如果问题仍然存在）

如果重启后仍有问题，可以考虑：

1. **进一步增加限制**：
   ```javascript
   app.use(express.json({ limit: '200mb' }));
   app.use(express.urlencoded({ limit: '200mb', extended: true, parameterLimit: 100000 }));
   ```

2. **添加压缩中间件**：
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

3. **检查Nginx配置**（如果使用）：
   ```nginx
   client_max_body_size 100M;
   ```

## 注意事项
- 重启服务器是必须的，配置更改只有在重启后才会生效
- 确保没有其他Node.js进程占用端口3002
- 如果部署到生产环境，确保生产服务器也有相同的配置
