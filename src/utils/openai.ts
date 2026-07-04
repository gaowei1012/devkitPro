export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAiOptions {
  apiKey: string;
  baseUrl?: string;
  model: string;
  messages: ChatMessage[];
  timeout?: number;
  stream?: boolean;
  onChunk?: (text: string) => void;
  signal?: AbortSignal;
}

export class OpenAiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'OpenAiError';
  }
}

export async function callOpenAi(options: OpenAiOptions): Promise<string> {
  const {
    apiKey,
    baseUrl = 'https://api.openai.com/v1',
    model,
    messages,
    timeout = 60000,
    stream = false,
    onChunk,
    signal,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const combinedSignal = controller.signal;
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, stream }),
      signal: combinedSignal,
    });

    if (!res.ok) {
      let errMsg = `请求失败 (${res.status})`;
      try {
        const errBody = (await res.json()) as { error?: { message?: string } };
        errMsg = errBody.error?.message ?? errMsg;
      } catch {
        // ignore parse error
      }

      if (res.status === 401) {
        throw new OpenAiError('API Key 无效，请检查是否正确', 401);
      }
      if (res.status === 429) {
        throw new OpenAiError('请求频率超限或余额不足', 429);
      }
      throw new OpenAiError(errMsg, res.status);
    }

    if (!stream || !onChunk) {
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content ?? '';
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new OpenAiError('无法读取流式响应');
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            onChunk(content);
          }
        } catch {
          // skip malformed chunk
        }
      }
    }

    return fullText;
  } catch (e) {
    if (e instanceof OpenAiError) throw e;
    if (e instanceof Error && e.name === 'AbortError') {
      throw new OpenAiError('请求超时或已取消');
    }
    throw new OpenAiError(e instanceof Error ? e.message : '网络请求失败');
  } finally {
    clearTimeout(timeoutId);
  }
}
