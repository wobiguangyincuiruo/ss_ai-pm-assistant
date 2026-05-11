import { defineConfig, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

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
  plugins: [react()],
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
