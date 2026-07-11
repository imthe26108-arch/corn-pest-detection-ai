interface Env {
  AI_BASE_URL: string;
  AI_API_KEY: string;
  AI_CHAT_MODEL?: string;
  AI_VISION_MODEL?: string;
  SEARCH_API_URL?: string;
  SEARCH_API_KEY?: string;
}

interface FunctionContext {
  request: Request;
  env: Env;
}

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<Record<string, unknown>>;
};

const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}

async function streamCompletion(env: Env, messages: ChatMessage[], model: string) {
  if (!env.AI_BASE_URL || !env.AI_API_KEY) {
    throw new Error('AI 服务尚未配置');
  }

  const baseUrl = env.AI_BASE_URL.replace(/\/+$/, '');
  const endpoint = baseUrl.endsWith('/chat/completions')
    ? baseUrl
    : `${baseUrl}/chat/completions`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${env.AI_API_KEY}` },
    body: JSON.stringify({ model, messages, temperature: 0.7, stream: true }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `AI 服务返回 ${response.status}`);
  }
  return response.body;
}

function toClientSse(source: ReadableStream<Uint8Array>) {
  const reader = source.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim().startsWith('data:')) continue;
            const payload = line.trim().slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
              };
              const content = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {
              // Ignore provider keep-alive chunks.
            }
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'AI 响应流读取失败' })}\n\n`));
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
  });
}

function sseResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}

async function handleChat(request: Request, env: Env) {
  const body = (await request.json()) as { messages?: ChatMessage[] };
  if (!Array.isArray(body.messages)) return json({ error: '消息列表无效' }, 400);
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: '你是玉米病虫害专家和农业顾问。请用简洁、准确、易懂的中文回答，优先给出可执行建议，并提醒用户科学安全用药。',
    },
    ...body.messages,
  ];
  const source = await streamCompletion(env, messages, env.AI_CHAT_MODEL || 'gpt-4o-mini');
  return sseResponse(toClientSse(source));
}

async function handleDetect(request: Request, env: Env) {
  const body = (await request.json()) as { imageUrl?: string; prompt?: string };
  if (!body.imageUrl) return json({ error: '图片是必需的' }, 400);
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: '你是玉米病虫害识别专家。请分析名称、症状、原因、严重程度、防治和预防措施；无法确定时必须明确说明。',
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: body.prompt || '请分析这张玉米图片并给出诊断和防治建议。' },
        { type: 'image_url', image_url: { url: body.imageUrl, detail: 'high' } },
      ],
    },
  ];
  const model = env.AI_VISION_MODEL || env.AI_CHAT_MODEL || 'gpt-4o-mini';
  const source = await streamCompletion(env, messages, model);
  return sseResponse(toClientSse(source));
}

async function handleSearch(request: Request, env: Env) {
  const body = (await request.json()) as { query?: string };
  if (!body.query) return json({ error: '查询词不能为空' }, 400);
  if (!env.SEARCH_API_URL) return json({ summary: '搜索服务尚未配置。', results: [] });
  const response = await fetch(env.SEARCH_API_URL, {
    method: 'POST',
    headers: { ...jsonHeaders, ...(env.SEARCH_API_KEY ? { Authorization: `Bearer ${env.SEARCH_API_KEY}` } : {}) },
    body: JSON.stringify({ query: `${body.query} 玉米种植 农业技术`, count: 10 }),
  });
  if (!response.ok) throw new Error(`搜索服务返回 ${response.status}`);
  return json(await response.json());
}

export async function onRequest({ request, env }: FunctionContext): Promise<Response> {
  const path = new URL(request.url).pathname;
  if (request.method === 'GET' && path === '/api/health') {
    return json({ status: 'ok', service: 'corn-pest-detection-pages' });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    if (path === '/api/chat') return await handleChat(request, env);
    if (path === '/api/detect') return await handleDetect(request, env);
    if (path === '/api/search') return await handleSearch(request, env);
    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('Pages Function request failed', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return json({ error: `AI 服务请求失败：${message}` }, 500);
  }
}
