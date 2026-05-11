import type { Message, ApiProvider } from '../types';

interface ApiConfig {
  proxyPath: string;       // Vite 代理路径
  isAnthropic: boolean;     // Anthropic Messages 格式 vs OpenAI Chat Completions 格式
  extraHeaders: Record<string, string>;
}

function getApiConfig(provider: ApiProvider, apiBaseUrl: string): ApiConfig {
  switch (provider) {
    case 'anthropic':
      return {
        proxyPath: '/api/anthropic',
        isAnthropic: true,
        extraHeaders: { 'anthropic-version': '2023-06-01' },
      };
    case 'deepseek':
      return {
        proxyPath: '/api/deepseek',
        isAnthropic: false,
        extraHeaders: {},
      };
    case 'openai':
      return {
        proxyPath: '/api/openai',
        isAnthropic: false,
        extraHeaders: {},
      };
    case 'custom':
      return {
        proxyPath: '/api/custom',
        isAnthropic: false,
        extraHeaders: apiBaseUrl ? { 'x-proxy-target': apiBaseUrl } : {},
      };
  }
}

export async function sendToApi(
  history: Message[],
  apiKey: string,
  systemPrompt: string,
  model: string,
  provider: ApiProvider,
  apiBaseUrl: string
): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('请先在顶部填入 API Key');
  }

  const config = getApiConfig(provider, apiBaseUrl);

  let endpoint: string;
  let body: string;
  let headers: Record<string, string>;

  if (config.isAnthropic) {
    // === Anthropic Messages API 格式 ===
    endpoint = `${config.proxyPath}/v1/messages`;
    headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...config.extraHeaders,
    };
    body = JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: normalizeMessagesForAnthropic(history),
    });
  } else {
    // === OpenAI Chat Completions 格式（DeepSeek/OpenAI/自定义） ===
    endpoint = `${config.proxyPath}/v1/chat/completions`;
    headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey,
      ...config.extraHeaders,
    };
    body = JSON.stringify({
      model,
      max_tokens: 4096,
      messages: buildOpenAiMessages(systemPrompt, history),
    });
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body,
    });
  } catch {
    throw new Error('网络请求失败，请确认：\n1. 开发服务器已重启（npm run dev）\n2. 网络连接正常');
  }

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      errorMsg =
        err.error?.message || err.message || JSON.stringify(err).slice(0, 200);
    } catch {
      // ignore
    }
    throw new Error(`API 请求失败: ${errorMsg}`);
  }

  const data = await response.json();

  if (config.isAnthropic) {
    return data.content?.[0]?.text || '';
  }
  return data.choices?.[0]?.message?.content || '';
}

/** Anthropic 要求 messages 以 user 开头且严格交替 */
function normalizeMessagesForAnthropic(
  history: Message[]
): { role: 'user' | 'assistant'; content: string }[] {
  const startIdx = history.findIndex((m) => m.role === 'user');
  if (startIdx === -1) throw new Error('对话历史中没有用户消息');

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

/** OpenAI 兼容格式：system 消息 + user/assistant 交替 */
function buildOpenAiMessages(
  systemPrompt: string,
  history: Message[]
): { role: string; content: string }[] {
  const messages: { role: string; content: string }[] = [
    { role: 'system', content: systemPrompt },
  ];

  const startIdx = history.findIndex((m) => m.role === 'user');
  if (startIdx === -1) throw new Error('对话历史中没有用户消息');

  for (let i = startIdx; i < history.length; i++) {
    const msg = history[i];
    const prev = messages[messages.length - 1];
    if (prev && prev.role === msg.role) {
      prev.content += '\n\n' + msg.content;
    } else {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  return messages;
}
