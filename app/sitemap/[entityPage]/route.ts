// app/sitemap-[entity]-[page].xml/route.ts
import { type NextRequest } from 'next/server';

import { ENTITY_CONFIG, getSiteMapConfig, isSitemapEnabled } from '@/lib/utils';
import {
  escapeXml,
  getGraphqlEntityCount,
  getSearchEntityCount,
  getSitemapBaseUrl,
} from '@/lib/sitemap-utils';

interface EntityItem {
  id: string;
  slug?: string;
  name?: string;
  fullName?: string;
  updated_at?: string;
  updatedAt?: string;
  modified?: string;
  __typename?: 'TypeUser' | 'TypeOrganization';
}

async function fetchEntityData(
  entity: string,
  page: number
): Promise<EntityItem[]> {
  const config = ENTITY_CONFIG[entity];

  if (!config) return [];

  const itemsPerPage = getSiteMapConfig().itemsPerPage;

  if (config.source === 'search') {
    const response = await getSearchEntityCount(entity, itemsPerPage, page);
    if (!response || !response.list) return [];
    return response.list;
  }

  if (config.source === 'graphql') {
    const response = await getGraphqlEntityCount(entity, config);
    if (!response || !response.list) return [];

    // GraphQL endpoints return the full list; slice for the requested page.
    const start = (page - 1) * itemsPerPage;
    return response.list.slice(start, start + itemsPerPage);
  }

  return [];
}

function getEntityLoc(
  baseUrl: string,
  entity: string,
  item: EntityItem,
  path: string
): string {
  switch (entity) {
    case 'organizations': {
      const orgSlug = item.slug || item.name || item.id;
      return `${baseUrl}/publishers/organization/${orgSlug}_${item.id}`;
    }
    case 'users': {
      const userSlug = item.fullName || item.id;
      return `${baseUrl}/publishers/${userSlug}_${item.id}`;
    }
    case 'collaboratives':
      return `${baseUrl}/collaboratives/${item.slug || item.id}`;
    case 'datasets':
      return `${baseUrl}/datasets/${item.slug || item.id}`;
    case 'aimodels':
      return `${baseUrl}/aimodels/${item.id}`;
    case 'usecases':
      return `${baseUrl}/usecases/${item.slug || item.id}`;
    case 'sectors':
      return `${baseUrl}/sectors/${item.slug || item.id}`;
    default:
      return `${baseUrl}/${path}/${item.slug || item.id}`;
  }
}

function generateEntitySitemap(items: EntityItem[], entity: string): string {
  const baseUrl = getSitemapBaseUrl();
  const config = ENTITY_CONFIG[entity];

  if (!config) {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    </urlset>`;
  }

  const urls = items
    ?.map((item) => {
      const loc = escapeXml(getEntityLoc(baseUrl, entity, item, config.path));
      const modifiedAt = item.updated_at || item.updatedAt || item.modified;
      const lastmod = modifiedAt
        ? new Date(modifiedAt).toISOString()
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
  { params }: { params: Promise<{ entityPage: string }> }
) {
  if (!isSitemapEnabled()) {
    return new Response('Sitemaps are not enabled', { status: 404 });
  }

  try {
    const { entityPage } = await params;

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
