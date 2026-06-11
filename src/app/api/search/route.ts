import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: '查询词不能为空' }, { status: 400 });
    }

    const searchApiUrl = process.env.SEARCH_API_URL?.trim();

    if (!searchApiUrl) {
      return NextResponse.json({
        summary: '搜索服务尚未配置，请在 Cloudflare 环境变量中设置 SEARCH_API_URL。',
        results: [],
      });
    }

    const response = await fetch(searchApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.SEARCH_API_KEY
          ? { Authorization: `Bearer ${process.env.SEARCH_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        query: `${query} 玉米种植 农业技术`,
        count: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`Search service returned ${response.status}`);
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: '搜索服务暂时不可用' }, { status: 500 });
  }
}
