import type { Message } from '../types';

export async function sendToDeepSeek(
  history: Message[],
  apiKey: string,
  systemPrompt: string,
  model: string
): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('请先在顶部填入 DeepSeek API Key（以 sk- 开头）');
  }

  // DeepSeek 使用 OpenAI 兼容格式：system 消息 + user/assistant 交替
  const messages: { role: string; content: string }[] = [
    { role: 'system', content: systemPrompt },
  ];

  // 跳过开头的 assistant 消息（开场白），确保第一条 user
  const startIdx = history.findIndex((m) => m.role === 'user');
  if (startIdx === -1) {
    throw new Error('对话历史中没有用户消息，无法发送请求');
  }

  for (let i = startIdx; i < history.length; i++) {
    const msg = history[i];
    const prev = messages[messages.length - 1];
    if (prev && prev.role === msg.role) {
      prev.content += '\n\n' + msg.content;
    } else {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  let response: Response;
  try {
    response = await fetch('/api/deepseek/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
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
      errorMsg = err.error?.message || err.message || errorMsg;
    } catch {
      // ignore parse failure
    }
    throw new Error(`API 请求失败: ${errorMsg}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
