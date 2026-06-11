import { NextRequest, NextResponse } from 'next/server';
import {
  ChatMessage,
  getVisionModel,
  pipeOpenAIStreamToSse,
  sseHeaders,
  streamChatCompletion,
} from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const { imageUrl, prompt } = formData;

    if (!imageUrl) {
      return NextResponse.json({ error: '图片 URL 是必需的' }, { status: 400 });
    }

    const systemPrompt = `你是玉米病虫害识别专家，专门帮助用户识别和诊断玉米病虫害。你的职责包括：

1. **病虫害识别**：根据用户上传的图片，准确识别玉米可能患有的病虫害类型
2. **症状分析**：详细分析病虫害的症状表现、发病阶段和严重程度
3. **防治建议**：提供科学有效的防治方案，包括农业管理措施和药剂防治
4. **专家指导**：给出专业的种植管理建议，帮助农户预防病虫害的发生

请用专业、友好、易懂的语言回复。对于每个病虫害诊断，请包含以下信息：
- 病虫害名称和类型
- 主要症状特征
- 发病原因和条件
- 严重程度评估
- 防治方案（分步骤）
- 预防措施

如果图片中无法明确判断病虫害，请诚实告知用户并建议进一步观察或咨询当地农业技术部门。`;

    const userPrompt = prompt || '请分析这张玉米叶片图片，识别可能存在的病虫害，并给出详细的诊断报告和防治建议。';

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high',
            },
          },
        ],
      },
    ];

    const stream = await streamChatCompletion({
      messages,
      model: getVisionModel(),
      temperature: 0.7,
    });

    const readable = await pipeOpenAIStreamToSse(stream);

    return new Response(readable, {
      headers: sseHeaders,
    });
  } catch (error) {
    console.error('Detection API Error:', error);
    return NextResponse.json({ error: '检测服务暂时不可用，请稍后重试' }, { status: 500 });
  }
}
