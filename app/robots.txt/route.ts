// app/robots.txt/route.ts
import { isSitemapEnabled } from '@/lib/utils';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL;

  const robotsTxt = `User-agent: *
    Allow: /

    Sitemap: ${baseUrl}/sitemap/main.xml
    `;

  if (!isSitemapEnabled()) {
    return new Response('Sitemaps are not enabled', { status: 404 });
  }

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
