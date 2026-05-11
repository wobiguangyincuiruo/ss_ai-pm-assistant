import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, 'dist');

if (!existsSync(distDir)) {
  console.error('dist/ 目录不存在，请先执行 npm run build');
  process.exit(1);
}

const app = express();

// ---- API Proxy Routes (same logic as vite.config.ts) ----

const proxyOpts = (target) => ({
  target,
  changeOrigin: true,
  pathRewrite: (path) => path.replace(/^\/api\/(anthropic|deepseek|openai|custom)/, ''),
});

// 自定义端点：从 X-Proxy-Target 头读取目标地址
const customProxy = createProxyMiddleware({
  changeOrigin: true,
  pathRewrite: (path) => path.replace(/^\/api\/custom/, ''),
  router: (req) => {
    const target = req.headers['x-proxy-target'];
    return target ? target.replace(/\/$/, '') : 'https://api.deepseek.com';
  },
});

app.use('/api/anthropic', createProxyMiddleware(proxyOpts('https://api.anthropic.com')));
app.use('/api/deepseek', createProxyMiddleware(proxyOpts('https://api.deepseek.com')));
app.use('/api/openai', createProxyMiddleware(proxyOpts('https://api.openai.com')));
app.use('/api/custom', customProxy);

// ---- Serve static files ----
app.use(express.static(distDir));

// ---- SPA fallback ----
app.get('*', (_req, res) => {
  res.sendFile(join(distDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`数字员工服务已启动：http://localhost:${PORT}`);
  console.log('按 Ctrl+C 停止');
});
