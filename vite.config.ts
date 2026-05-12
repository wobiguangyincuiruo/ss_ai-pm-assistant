import { defineConfig, type ProxyOptions, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sessionsDir = join(__dirname, 'sessions');
const prdsDir = join(__dirname, 'prds');
const sessionsIndexFile = join(sessionsDir, 'index.json');

mkdirSync(sessionsDir, { recursive: true });
mkdirSync(prdsDir, { recursive: true });

function readSessionsIndex() {
  try {
    if (existsSync(sessionsIndexFile)) {
      return JSON.parse(readFileSync(sessionsIndexFile, 'utf-8'));
    }
  } catch { /* ignore */ }
  return [];
}

function writeSessionsIndex(list: unknown[]) {
  writeFileSync(sessionsIndexFile, JSON.stringify(list), 'utf-8');
}

function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: string) => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function fileEndpointsPlugin(): Plugin {
  return {
    name: 'file-endpoints',
    configureServer(server) {
      // GET /api/sessions — list all sessions
      server.middlewares.use('/api/sessions', async (req, res, next) => {
        if (req.method !== 'GET') return next();
        // Check if this is /api/sessions/:id
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const idFromPath = url.pathname.replace(/^\/api\/sessions\/?/, '');
        if (idFromPath) {
          const safeId = idFromPath.replace(/[^a-zA-Z0-9\-_]/g, '_');
          const filepath = join(sessionsDir, `${safeId}.json`);
          if (!existsSync(filepath)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: '会话不存在' }));
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(JSON.parse(readFileSync(filepath, 'utf-8'))));
          return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(readSessionsIndex()));
      });

      // POST /api/save-session
      server.middlewares.use('/api/save-session', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        const data = await parseBody(req);
        if (!data?.meta?.id) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: '无效的会话数据' }));
          return;
        }
        const id = data.meta.id;
        const safeId = id.replace(/[^a-zA-Z0-9\-_]/g, '_');
        const filepath = join(sessionsDir, `${safeId}.json`);
        writeFileSync(filepath, JSON.stringify(data), 'utf-8');

        const index = readSessionsIndex();
        const existingIdx = index.findIndex((m: any) => m.id === id);
        if (existingIdx >= 0) {
          index[existingIdx] = data.meta;
        } else {
          index.unshift(data.meta);
        }
        writeSessionsIndex(index);
        console.log(`[Vite] 会话已保存：sessions/${safeId}.json`);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      });

      // POST /api/delete-session
      server.middlewares.use('/api/delete-session', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        const { id } = await parseBody(req);
        if (!id) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: '缺少 id' }));
          return;
        }
        const safeId = id.replace(/[^a-zA-Z0-9\-_]/g, '_');
        const filepath = join(sessionsDir, `${safeId}.json`);
        if (existsSync(filepath)) unlinkSync(filepath);
        const index = readSessionsIndex().filter((m: any) => m.id !== id);
        writeSessionsIndex(index);
        console.log(`[Vite] 会话已删除：sessions/${safeId}.json`);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      });

      // POST /api/save-prd
      server.middlewares.use('/api/save-prd', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        const { filename, content } = await parseBody(req);
        if (!filename || !content) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'filename 和 content 为必填字段' }));
          return;
        }
        const safeName = filename.replace(/[^a-zA-Z0-9一-龥\-_\.]/g, '_').slice(0, 120);
        const filepath = join(prdsDir, safeName);
        writeFileSync(filepath, content, 'utf-8');
        console.log(`[Vite] PRD 已保存：prds/${safeName}`);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, path: `prds/${safeName}` }));
      });
    },
  };
}

const anthropicProxy: ProxyOptions = {
  target: 'https://api.anthropic.com',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
};

const deepseekProxy: ProxyOptions = {
  target: 'https://api.deepseek.com',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/deepseek/, ''),
};

const openaiProxy: ProxyOptions = {
  target: 'https://api.openai.com',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/openai/, ''),
};

// 自定义端点：通过 X-Proxy-Target 头动态路由到用户指定的 URL
// http-proxy 的 router 选项 Vite 类型未包含，使用 any 绕过
const customProxy = {
  changeOrigin: true,
  rewrite: (path: string) => path.replace(/^\/api\/custom/, ''),
  router: (req: { headers: Record<string, string | undefined> }) => {
    const target = req.headers['x-proxy-target'];
    return target ? target.replace(/\/$/, '') : 'https://api.deepseek.com';
  },
} as unknown as ProxyOptions;

export default defineConfig({
  plugins: [react(), fileEndpointsPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api/anthropic': anthropicProxy,
      '/api/deepseek': deepseekProxy,
      '/api/openai': openaiProxy,
      '/api/custom': customProxy,
    },
  },
});
