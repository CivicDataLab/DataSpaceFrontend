import { Metadata } from 'next';
import { twMerge, type ClassNameValue } from 'tailwind-merge';

type MetadataOptions = {
  title?: string;
  url?: string;
  image?: string;
  description?: string;
  keywords?: string[];
  openGraph?: {
    type: 'website' | 'article' | 'dataset' | 'profile';
    locale: string;
    url: string;
    title: string;
    description: string;
    siteName?: string;
    image?: string;
    other?: Metadata['other'];
  };
};

export function generatePageMetadata(options: MetadataOptions = {}): Metadata {
  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: options.openGraph?.url,
      title: options.openGraph?.title,
      description: options.openGraph?.description,
      siteName: options.openGraph?.siteName,
      images: options.openGraph?.image,
    },
    other: options.openGraph?.other,
    twitter: {
      card: 'summary_large_image',
      title: options.openGraph?.title,
      description: options.openGraph?.description,
      images: options.openGraph?.image,
      creator: 'CivicDataLab',
    },
  };
}

export interface JsonLdSchema {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: unknown;
}

export function generateJsonLd(schema: JsonLdSchema): string {
  return JSON.stringify(schema, null, 2);
}

export function cn(...inputs: ClassNameValue[]) {
  return twMerge(inputs);
}

export function formatDate(input: string | number | null): string | null {
  if (input === null || input === undefined) return null;
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function toTitleCase(str: string) {
  return str.replace(/\b\w/g, function (char: string) {
    return char.toUpperCase();
  });
}

/** Converts sector slug (e.g. "climate-action") to filter param format (e.g. "Climate+Action") */
export function buildSectorSlugParam(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('+');
}

type TokenValue = Record<string, unknown> | string | number;

const convertMap: Record<string, (value: TokenValue) => unknown> = {
  border: (value) => {
    if (typeof value !== 'object' || value === null) return value;
    return `${value.width} ${value.style} ${value.color}`;
  },
  shadow: (value) => {
    if (typeof value !== 'object' || value === null) return value;
    return `${value.offsetX} ${value.offsetY} ${value.blur} ${value.spread} ${value.color}`;
  },
  default: (value) => {
    return value;
  },
};

export function convertValue(value: TokenValue, category: string): unknown {
  return convertMap[category] ? convertMap[category](value) : value;
}

export const blobToBase64 = function (blob: Blob) {
  const reader = new FileReader();
  reader.onload = function () {
    const dataUrl = reader.result;
    const base64 =
      typeof dataUrl === 'string' ? dataUrl.split(',')[1] : undefined;

    return base64;
  };
  reader.readAsDataURL(blob);
};

// function to convert bytes into friendly format
export function bytesToSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}

export const range = (len: number) => {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

export function handleRedirect(
  event: { preventDefault: () => void },
  link: string
): void {
  event.preventDefault();
  const confirmation = window.confirm(
    `You are being redirected to "${link}". `
  );
  if (confirmation) {
    window.open(link, '_blank');
  }
}

export function formatDateString(
  input: string | number | Date,
  isHyphenated = false
): string {
  const date = new Date(input);
  // If hyphendated it would return date in this format - 2023-01-01 else in April 1, 2021
  return isHyphenated
    ? new Date(
        date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'numeric',
        })
      )
        .toISOString()
        .split('T')[0]
    : date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
}

export async function getWebsiteTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.querySelector('title');
    return title?.innerText || null;
  } catch (error) {
    console.error('Failed to fetch website title:', error);
    return null;
  }
}

// Feature Sitemaps
export const getSiteMapConfig = () => ({
  itemsPerPage: parseInt(process.env.FEATURE_SITEMAP_ITEMS_PER_PAGE || '1000'),
  cacheDuration: parseInt(process.env.FEATURE_SITEMAP_CACHE_DURATION || '3600'),
  childCacheDuration: parseInt(
    process.env.FEATURE_SITEMAP_CHILD_CACHE_DURATION || '21600'
  ),
});

export type ENTITY_CONFIG_TYPE = Record<
  string,
  {
    // search for Elasticsearch type queries
    // graphql for GraphQL type queries
    source: 'search' | 'graphql';
    // For Elasticsearch type queries
    endpoint?: string;
    // For GraphQL type queries
    graphqlQuery?: string;
    queryResKey?: string;
    // Optional filter when a GraphQL union returns mixed types
    filterTypename?: 'TypeOrganization' | 'TypeUser';
    path: string;
  }
>;

// Check if sitemap is enabled
export const isSitemapEnabled = () => {
  return (
    process.env.FEATURE_SITEMAPS === 'true' ||
    process.env.NODE_ENV === 'production'
  );
};

// Entity Config
export const ENTITY_CONFIG: ENTITY_CONFIG_TYPE = {
  datasets: {
    source: 'search',
    endpoint: '/search/dataset/',
    path: 'datasets',
  },
  aimodels: {
    source: 'graphql',
    graphqlQuery: `query SitemapAIModels {
      aiModels(filters: { isPublic: true, status: ACTIVE }) {
        id
        updatedAt
      }
    }`,
    queryResKey: 'aiModels',
    path: 'aimodels',
  },
  usecases: {
    source: 'graphql',
    graphqlQuery: `query PublishedUseCasesList {
      publishedUseCases {
        id
        slug
      }
    }`,
    queryResKey: 'publishedUseCases',
    path: 'usecases',
  },
  collaboratives: {
    source: 'graphql',
    graphqlQuery: `query PublishedCollaborativesList {
      publishedCollaboratives {
        id
        slug
      }
    }`,
    queryResKey: 'publishedCollaboratives',
    path: 'collaboratives',
  },
  organizations: {
    source: 'graphql',
    graphqlQuery: `query SitemapOrganizations {
      getPublishers {
        __typename
        ... on TypeOrganization {
          id
          name
          slug
        }
      }
    }`,
    queryResKey: 'getPublishers',
    filterTypename: 'TypeOrganization',
    path: 'publishers/organization',
  },
  users: {
    source: 'graphql',
    graphqlQuery: `query SitemapUsers {
      getPublishers {
        __typename
        ... on TypeUser {
          id
          fullName
        }
      }
    }`,
    queryResKey: 'getPublishers',
    filterTypename: 'TypeUser',
    path: 'publishers',
  },
  sectors: {
    source: 'graphql',
    graphqlQuery: `query SectorsLists {
      activeSectors {
        id
        slug
      }
    }`,
    queryResKey: 'activeSectors',
    path: 'sectors',
  },
};
export const extractPublisherId = (publisherSlug: string): string => {
  // If the param contains an underscore, split and take the last part
  if (publisherSlug.includes('_')) {
    return publisherSlug.split('_').pop() ?? publisherSlug;
  }

  // Otherwise, return the param as is (it's already just the ID)
  return publisherSlug;
};
