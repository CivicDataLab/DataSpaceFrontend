import { getSitemapBaseUrl } from '@/lib/sitemap-utils';
import { isSitemapEnabled } from '@/lib/utils';

export async function GET() {
  const lines = ['User-agent: *', 'Allow: /'];

  if (isSitemapEnabled()) {
    lines.push('', `Sitemap: ${getSitemapBaseUrl()}/sitemap.xml`);
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
