import { Metadata } from 'next';
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
    other?: any;
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
  [key: string]: any;
}

export function generateJsonLd(schema: JsonLdSchema): string {
  return JSON.stringify(schema, null, 2);
}

export function cn(...inputs: ClassNameValue[]) {
  return twMerge(inputs);
}

export function formatDate(input: string | number): string {
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

const convertMap: any = {
  border: (value: { width: any; style: any; color: any }) => {
    return `${value.width} ${value.style} ${value.color}`;
  },
  shadow: (value: {
    offsetX: any;
    offsetY: any;
    blur: any;
    spread: any;
    color: any;
  }) => {
    return `${value.offsetX} ${value.offsetY} ${value.blur} ${value.spread} ${value.color}`;
  },
  default: (value: any) => {
    return value;
  },
};

export function convertValue(value: any, category: any) {
  return convertMap[category] ? convertMap[category](value) : value;
}

export const blobToBase64 = function (blob: Blob) {
  let reader = new FileReader();
  reader.onload = function () {
    let dataUrl: any = reader.result;
    let base64 = dataUrl?.split(',')[1];

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
  let arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

export function handleRedirect(event: any, link: any) {
  event.preventDefault();
  const confirmation = window.confirm(
    `You are being redirected to "${link}". `
  );
  if (confirmation) {
    window.open(link, '_blank');
  }
}

export function formatDateString(
  input: string | number | any,
  isHyphenated = false
): string {
  const date = new Date(input);
  // If hyphendated it would return date in this format - 2023-01-01 else in April 1, 2021
  return isHyphenated
    ? new Date(
        date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'numeric',
          // day: 'numeric',
        })
      )
        .toISOString()
        .split('T')[0]
        date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'numeric',
          // day: 'numeric',
        })
      )
        .toISOString()
        .split('T')[0]
    : date.toLocaleDateString('en-US', {
        month: 'long',
        // day: 'numeric',
        year: 'numeric',
      });
        month: 'long',
        // day: 'numeric',
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
// Get configuration from environment
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
    path: string;
    priority: string;
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
    // ?=&size=9&page=1&sort=recent
    path: 'datasets',
    priority: '0.8',
  },
  usecases: {
    source: 'graphql',
    graphqlQuery: `query UseCasesList {
      useCases {
        id
        slug
      }
    }`,
    queryResKey: 'useCases',
    path: 'usecases',
    priority: '0.7',
  },
  contributors: {
    source: 'graphql',
    graphqlQuery: `query getContributors {
    getPublishers {
        __typename
        ... on TypeOrganization {
          id
        }
        ... on TypeUser {
          id
        }
      }
    }`,
    queryResKey: 'getPublishers',
    path: 'publishers',
    priority: '0.6',
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
    priority: '0.6',
  },
};
export const extractPublisherId = (publisherSlug: any) => {
  // If the param contains an underscore, split and take the last part
  if (publisherSlug.includes('_')) {
    return publisherSlug.split('_').pop();
  }

  // Otherwise, return the param as is (it's already just the ID)
  return publisherSlug;
};
