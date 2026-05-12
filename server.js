import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, 'dist');
const prdsDir = join(__dirname, 'prds');
const sessionsDir = join(__dirname, 'sessions');
const sessionsIndexFile = join(sessionsDir, 'index.json');

if (!existsSync(distDir)) {
  console.error('dist/ 目录不存在，请先执行 npm run build');
  process.exit(1);
}

mkdirSync(prdsDir, { recursive: true });
mkdirSync(sessionsDir, { recursive: true });

function readSessionsIndex() {
  try {
    if (existsSync(sessionsIndexFile)) {
      return JSON.parse(readFileSync(sessionsIndexFile, 'utf-8'));
    }
  } catch { /* ignore */ }
  return [];
}

function writeSessionsIndex(list) {
  writeFileSync(sessionsIndexFile, JSON.stringify(list), 'utf-8');
}

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

// ---- 会话历史本地保存端点 ----
app.get('/api/sessions', (_req, res) => {
  try {
    res.json(readSessionsIndex());
  } catch (err) {
    res.status(500).json({ error: '读取会话列表失败' });
  }
});

app.post('/api/save-session', (req, res) => {
  try {
    const data = req.body;
    if (!data?.meta?.id) {
      return res.status(400).json({ error: '无效的会话数据' });
    }
    const id = data.meta.id;
    const safeId = id.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const filepath = join(sessionsDir, `${safeId}.json`);
    writeFileSync(filepath, JSON.stringify(data), 'utf-8');

    const index = readSessionsIndex();
    const existingIdx = index.findIndex((m) => m.id === id);
    if (existingIdx >= 0) {
      index[existingIdx] = data.meta;
    } else {
      index.unshift(data.meta);
    }
    writeSessionsIndex(index);

    console.log(`会话已保存：sessions/${safeId}.json`);
    res.json({ ok: true });
  } catch (err) {
    console.error('保存会话失败:', err);
    res.status(500).json({ error: '保存失败' });
  }
});

app.post('/api/delete-session', (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: '缺少 id' });
    const safeId = id.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const filepath = join(sessionsDir, `${safeId}.json`);
    if (existsSync(filepath)) unlinkSync(filepath);

    const index = readSessionsIndex().filter((m) => m.id !== id);
    writeSessionsIndex(index);

    console.log(`会话已删除：sessions/${safeId}.json`);
    res.json({ ok: true });
  } catch (err) {
    console.error('删除会话失败:', err);
    res.status(500).json({ error: '删除失败' });
  }
});

app.get('/api/sessions/:id', (req, res) => {
  try {
    const safeId = req.params.id.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const filepath = join(sessionsDir, `${safeId}.json`);
    if (!existsSync(filepath)) return res.status(404).json({ error: '会话不存在' });
    res.json(JSON.parse(readFileSync(filepath, 'utf-8')));
  } catch (err) {
    res.status(500).json({ error: '读取会话失败' });
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
