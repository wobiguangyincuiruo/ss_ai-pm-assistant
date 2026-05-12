import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, 'dist');
const prdsDir = join(__dirname, 'prds');

if (!existsSync(distDir)) {
  console.error('dist/ 目录不存在，请先执行 npm run build');
  process.exit(1);
}

mkdirSync(prdsDir, { recursive: true });

const app = express();
app.use(express.json({ limit: '2mb' }));

// ---- PRD 本地保存端点 ----
app.post('/api/save-prd', (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!filename || !content) {
      return res.status(400).json({ error: 'filename 和 content 为必填字段' });
    }
    const safeName = filename.replace(/[^a-zA-Z0-9一-龥\-_\.]/g, '_').slice(0, 120);
    const filepath = join(prdsDir, safeName);
    writeFileSync(filepath, content, 'utf-8');
    console.log(`PRD 已保存：prds/${safeName}`);
    res.json({ ok: true, path: `prds/${safeName}` });
  } catch (err) {
    console.error('保存 PRD 失败:', err);
    res.status(500).json({ error: '保存失败' });
  }
});

// ---- API Proxy Routes (same logic as vite.config.ts) ----

const proxyOpts = (target) => ({
  target,
  changeOrigin: true,
  pathRewrite: (path) => path.replace(/^\/api\/(anthropic|deepseek|openai|custom)/, ''),
});

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
  console.log(`PRD 保存目录：${prdsDir}`);
  console.log('按 Ctrl+C 停止');
});
