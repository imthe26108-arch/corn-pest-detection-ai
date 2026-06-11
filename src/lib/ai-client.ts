type ChatRole = 'system' | 'user' | 'assistant';

type TextContentPart = {
  type: 'text';
  text: string;
};

type ImageContentPart = {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
};

export type ChatMessage = {
  role: ChatRole;
  content: string | Array<TextContentPart | ImageContentPart>;
};

type ChatCompletionChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
    message?: {
      content?: string;
    };
  }>;
};

type StreamChatOptions = {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
};

const jsonHeaders = {
  'Content-Type': 'application/json',
};

function getEnv(name: string) {
  return process.env[name]?.trim();
}

function requireEnv(name: string) {
  const value = getEnv(name);

  if (!value) {
    throw new Error(`缺少环境变量 ${name}`);
  }

  return value;
}

function getChatCompletionsUrl() {
  const baseUrl = requireEnv('AI_BASE_URL').replace(/\/+$/, '');
  return `${baseUrl}/chat/completions`;
}

export function getChatModel() {
  return getEnv('AI_CHAT_MODEL') || 'gpt-4o-mini';
}

export function getVisionModel() {
  return getEnv('AI_VISION_MODEL') || getChatModel();
}

export async function streamChatCompletion({
  messages,
  model,
  temperature = 0.7,
}: StreamChatOptions) {
  const response = await fetch(getChatCompletionsUrl(), {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${requireEnv('AI_API_KEY')}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `AI 服务返回 ${response.status}`);
  }

  if (!response.body) {
    throw new Error('AI 服务没有返回可读取的响应流');
  }

  return response.body;
}

export async function pipeOpenAIStreamToSse(source: ReadableStream<Uint8Array>) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = source.getReader();
  let buffer = '';

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();

            if (!trimmedLine.startsWith('data:')) {
              continue;
            }

            const payload = trimmedLine.slice(5).trim();

            if (!payload || payload === '[DONE]') {
              continue;
            }

            try {
              const data = JSON.parse(payload) as ChatCompletionChunk;
              const content =
                data.choices?.[0]?.delta?.content || data.choices?.[0]?.message?.content;

              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
                );
              }
            } catch {
              // Ignore malformed provider keep-alive chunks.
            }
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'AI 响应流读取失败' })}\n\n`),
        );
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
  });
}

export const sseHeaders = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
};
