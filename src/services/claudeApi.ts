import { SYSTEM_PROMPT } from '../data/systemPrompt';
import type { Message } from '../types';

export async function sendToClaude(history: Message[], apiKey: string): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('请先在顶部填入 Anthropic API Key（以 sk-ant- 开头）');
  }

  const messages = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let response: Response;
  try {
    response = await fetch('/api/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });
  } catch (networkErr) {
    throw new Error(
      '网络请求失败，请确认：\n1. Vite 代理已配置（检查 vite.config.ts）\n2. 开发服务器已重启（npm run dev）\n3. 网络连接正常'
    );
  }

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      errorMsg = err.error?.message || errorMsg;
    } catch {
      // ignore parse failure
    }
    throw new Error(`API 请求失败: ${errorMsg}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}
