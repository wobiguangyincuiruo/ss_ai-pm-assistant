import type { Message } from '../types';

export async function sendToClaude(
  history: Message[],
  apiKey: string,
  systemPrompt: string
): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('请先在顶部填入 Anthropic API Key（以 sk-ant- 开头）');
  }

  const messages = normalizeMessages(history);

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
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages,
      }),
    });
  } catch {
    throw new Error('网络请求失败，请确认：\n1. 开发服务器已重启（npm run dev）\n2. 网络连接正常');
  }

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      const errDetail = err.error;
      if (errDetail) {
        errorMsg = `[${errDetail.type}] ${errDetail.message}`;
      }
    } catch {
      // ignore parse failure
    }
    throw new Error(`API 请求失败: ${errorMsg}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

/**
 * Anthropic Messages API 要求 messages 以 user 开头且严格交替。
 * 跳过开头的 assistant 消息，合并连续同角色消息。
 */
function normalizeMessages(history: Message[]): { role: 'user' | 'assistant'; content: string }[] {
  const startIdx = history.findIndex((m) => m.role === 'user');
  if (startIdx === -1) {
    throw new Error('对话历史中没有用户消息，无法发送请求');
  }

  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  for (let i = startIdx; i < history.length; i++) {
    const msg = history[i];
    const prev = messages[messages.length - 1];
    if (prev && prev.role === msg.role) {
      prev.content += '\n\n' + msg.content;
    } else {
      messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
    }
  }
  return messages;
}
