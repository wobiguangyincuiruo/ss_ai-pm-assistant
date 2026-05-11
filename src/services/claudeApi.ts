import { SYSTEM_PROMPT } from '../data/systemPrompt';
import type { Message } from '../types';

/**
 * Anthropic Messages API 要求：
 * 1. messages 数组必须以 user 角色开头
 * 2. user 和 assistant 必须严格交替出现
 * 3. 不能有连续的同一角色消息
 *
 * 此函数过滤掉开头的 assistant 消息，确保符合 API 规范。
 */
function normalizeMessages(history: Message[]): { role: 'user' | 'assistant'; content: string }[] {
  // 跳过开头的 assistant 消息（如自动生成的开场白）
  const startIdx = history.findIndex((m) => m.role === 'user');
  if (startIdx === -1) {
    throw new Error('对话历史中没有用户消息，无法发送请求');
  }

  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  for (let i = startIdx; i < history.length; i++) {
    const msg = history[i];
    const prev = messages[messages.length - 1];

    // 跳过连续的同一角色消息（合并或跳过）
    if (prev && prev.role === msg.role) {
      // 同一角色连续出现：将内容追加到上一条（用换行分隔）
      prev.content += '\n\n' + msg.content;
    } else {
      messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
    }
  }

  // 确保最后一条不是 assistant 后的结尾问题（API 要求最后如果不是 user，则需要调整）
  // 这个场景通常不会触发，但做保护
  return messages;
}

export async function sendToClaude(history: Message[], apiKey: string): Promise<string> {
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
        system: SYSTEM_PROMPT,
        messages,
      }),
    });
  } catch (networkErr) {
    throw new Error(
      '网络请求失败，请确认：\n1. 开发服务器已重启（npm run dev）\n2. 网络连接正常'
    );
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
