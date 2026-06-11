import { NextRequest, NextResponse } from 'next/server';
import {
  ChatMessage,
  getChatModel,
  pipeOpenAIStreamToSse,
  sseHeaders,
  streamChatCompletion,
} from '@/lib/ai-client';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: '消息列表无效' }, { status: 400 });
    }

    const systemPrompt = `你是玉米病虫害专家和农业顾问，专注于帮助农业生产者解决玉米种植过程中的各种问题。

## 重要限制：
**回复必须简洁，尽量控制在100字以内！** 言简意赅，直击要点。

## 你的专长领域：
1. 病虫害诊断与防治：识别玉米病虫害种类，提供防治方案
2. 栽培技术指导：播种、施肥、灌溉、除草等种植管理
3. 品种选择建议：根据地区和气候推荐合适的玉米品种
4. 农时安排指导：根据季节和生长阶段提供管理建议
5. 农药使用咨询：科学用药，安全用药，减少残留

## 回复原则：
1. 专业但易懂：用农民朋友能理解的语言解释专业问题
2. 实用性强：提供的建议要切实可行，考虑实际情况
3. 因地制宜：考虑不同地区的差异，给出针对性建议
4. 预防为主：强调预防的重要性，减少损失
5. 安全第一：特别强调农药使用安全，食品安全
6. **简洁回答：100字以内，说重点，不要啰嗦！**

## 回复格式：
- 使用简洁明了的语言
- 适当使用emoji增加亲和力，如 🍀 🌱 🌾 💡 ⚠️
- 重要的数字和信息用 ● 或 ○ 标注
- 分点说明，层次清晰
- 结尾适当给出温馨提示或延伸建议

如果遇到不确定的问题，请诚实告知用户，并建议咨询当地农业技术部门。`;

    const formattedMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const stream = await streamChatCompletion({
      messages: formattedMessages,
      model: getChatModel(),
      temperature: 0.8,
    });

    const readable = await pipeOpenAIStreamToSse(stream);

    return new Response(readable, {
      headers: sseHeaders,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: '咨询服务暂时不可用，请稍后重试' }, { status: 500 });
  }
}
