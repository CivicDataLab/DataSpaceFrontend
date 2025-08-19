// app/sitemap-[entity]-[page].xml/route.ts
import { type NextRequest } from 'next/server';

import { ENTITY_CONFIG, getSiteMapConfig } from '@/lib/utils';
import {
  getGraphqlEntityCount,
  getSearchEntityCount,
} from '../sitemap.xml/route';

// Check if sitemaps are enabled
const isSitemapEnabled = () => {
  return (
    process.env.FEATURE_SITEMAPS === 'true' ||
    process.env.NODE_ENV === 'production'
  );
};

interface EntityItem {
  id: string;
  slug?: string;
  updated_at?: string;
}

async function fetchEntityData(
  entity: string,
  page: number
): Promise<EntityItem[]> {
  const config = ENTITY_CONFIG[entity];
  if (!config) return [];
  if (config.source === 'search') {
    const response = await getSearchEntityCount(entity, 5, page);
    if (!response || !response.list) return [];
    console.log(entity, response);
    return response.list;
  } else if (config.source === 'graphql') {
    const response = await getGraphqlEntityCount(entity, config);
    if (!response || !response.list) return [];
    console.log(entity, response);
    return response.list;
  } else {
    return [];
  }
  // try {
  //   const flags = getSiteMapConfig();
  //   const response = await fetch(
  //     `${process.env.FEATURE_SITEMAP_BACKEND_BASE_URL}${config.endpoint}?page=${page}&page_size=${flags.itemsPerPage}`,
  //     {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       next: { revalidate: flags.childCacheDuration },
  //     }
  //   );

  // if (!response.ok) return [];

  // const data = await response.json();
  // return data.results || data;
}

function generateEntitySitemap(items: EntityItem[], entity: string): string {
  const baseUrl = process.env.NEXTAUTH_URL;
  const config = ENTITY_CONFIG[entity];

  if (!config) {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    </urlset>`;
  }

  const urls = items
    ?.map((item) => {
      const loc = `${baseUrl}/${config.path}/${item.slug || item.id}`;
      const lastmod = item.updated_at
        ? new Date(item.updated_at).toISOString()
        : new Date().toISOString();

      return `
        <url>
          <loc>${loc}</loc>
          <lastmod>${lastmod}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>${config.priority}</priority>
        </url>
      `;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { entity: string; page: string } }
) {
  // Check if sitemaps are enabled via feature flag
  if (!isSitemapEnabled()) {
    return new Response('Sitemaps are not enabled', { status: 404 });
  }

  try {
    const { entity, page } = params;

    if (!ENTITY_CONFIG[entity]) {
      return new Response('Entity not found', { status: 404 });
    }

    const pageNumber = parseInt(page);
    if (isNaN(pageNumber) || pageNumber < 1) {
      return new Response('Invalid page number', { status: 400 });
    }

    const items = await fetchEntityData(entity, pageNumber);
    const sitemap = generateEntitySitemap(items, entity);

    const flags = getSiteMapConfig();
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': `public, max-age=${flags.childCacheDuration}`,
      },
    });
  } catch (error) {
    console.error('Error generating entity sitemap:', error);

    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    </urlset>`;

    return new Response(errorSitemap, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}

export const dynamic = 'force-dynamic';
