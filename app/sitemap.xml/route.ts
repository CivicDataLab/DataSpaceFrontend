import {
  generateSitemapIndexXml,
  getChildSitemapUrls,
} from '@/lib/sitemap-utils';
import { getSiteMapConfig, isSitemapEnabled } from '@/lib/utils';

export async function GET() {
  if (!isSitemapEnabled()) {
    return new Response('Sitemaps are not enabled', { status: 404 });
  }

  try {
    const flags = getSiteMapConfig();
    const childUrls = await getChildSitemapUrls();
    const sitemapIndex = generateSitemapIndexXml(childUrls);

    return new Response(sitemapIndex, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': `public, max-age=${flags.cacheDuration}`,
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</sitemapindex>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
        },
      }
    );
  }
}

export const dynamic = 'force-dynamic';
