// app/sitemap-[entity]-[page].xml/route.ts
import { type NextRequest } from 'next/server';

import { ENTITY_CONFIG, getSiteMapConfig, isSitemapEnabled } from '@/lib/utils';
import { getGraphqlEntityCount, getSearchEntityCount } from '../main.xml/route';

interface EntityItem {
  id: string;
  slug?: string;
  updated_at?: string;
  __typename?: 'TypeUser' | 'TypeOrganization';
}

async function fetchEntityData(
  entity: string,
  page: number
): Promise<EntityItem[]> {
  const config = ENTITY_CONFIG[entity];

  // If no config is found, return empty array
  if (!config) return [];

  if (config.source === 'search') {
    // Fetch entity based on general rest query
    const response = await getSearchEntityCount(
      entity,
      getSiteMapConfig().itemsPerPage,
      page
    );
    if (!response || !response.list) return [];
    return response.list;
  } else if (config.source === 'graphql') {
    // Fetch entity based on graphql query
    const response = await getGraphqlEntityCount(entity, config);
    if (!response || !response.list) return [];
    return response.list;
  } else {
    return [];
  }
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
      console.log(item, entity);

      // Function to handle loc or URLs for different types of entities especially for contributors or organizations
      const getLoc = () => {
        if (item.__typename === 'TypeOrganization') {
          return `${baseUrl}/${config.path}/organization/${item.id}`;
        } else if (item.__typename === 'TypeUser') {
          return `${baseUrl}/${config.path}/${item.id}`;
        } else {
          return `${baseUrl}/${config.path}/${item.slug || item.id}`;
        }
      };

      const loc = getLoc();
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

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { entityPage: string } }
) {
  // Check if sitemaps are enabled via feature flag
  if (!isSitemapEnabled()) {
    return new Response('Sitemaps are not enabled', { status: 404 });
  }

  try {
    const { entityPage } = params;

    const m = entityPage.match(/^([a-zA-Z0-9_]+)-(\d+)\.xml$/);
    if (!m) {
      return new Response('Invalid Route', { status: 404 });
    }

    const entity = m[1];
    const pageNumber = Number(m[2]);

    if (!ENTITY_CONFIG[entity]) {
      return new Response('Entity not found', { status: 404 });
    }

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
