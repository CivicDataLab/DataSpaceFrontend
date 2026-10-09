import { NextResponse } from 'next/server';

export async function GET(request: Request): Promise<Response> {
  const urlParam = new URL(request.url).searchParams.get('url');
  if (!urlParam) {
    return NextResponse.json({ title: null }, { status: 400 });
  }

  try {
    const parsed = new URL(urlParam);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return NextResponse.json({ title: null }, { status: 400 });
    }

    const response = await fetch(parsed.href, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return NextResponse.json({ title: null });
    }

    const html = await response.text();
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = match?.[1]?.replace(/\s+/g, ' ').trim() || null;
    return NextResponse.json({ title });
  } catch {
    return NextResponse.json({ title: null });
  }
}
