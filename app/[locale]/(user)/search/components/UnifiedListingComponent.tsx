'use client';

import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GraphqlPagination from '@/app/[locale]/dashboard/components/GraphqlPagination/graphqlPagination';
import { useMounted } from '@/hooks/use-mounted';
import {
  Button,
  Card,
  Pill,
  SearchInput,
  Select,
  Text,
  Tray,
} from 'opub-ui';

import { cn, formatDate } from '@/lib/utils';
import { getCollaborativeDetailUrl } from '@/lib/collaborativesRouting';
import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import Filter from '../../datasets/components/FIlter/Filter';
import Styles from '../../datasets/dataset.module.scss';

// Helper function to strip markdown and HTML tags for card preview
export const stripMarkdown = (markdown: string): string => {
  if (!markdown) return '';

  const cleaned = markdown
    // Remove code blocks first (before other replacements)
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove blockquotes
    .replace(/^\s*>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '')
    // Remove list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove HTML tags (improved to handle self-closing tags and attributes)
    .replace(/<[^>]*\/?>/g, '')
    // Replace HTML entities (like &nbsp;) with regular spaces - MUST come before other replacements
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    // Replace numeric HTML entities (like &#160;)
    .replace(/&#\d+;/g, ' ')
    // Replace hex HTML entities (like &#xA0;)
    .replace(/&#x[0-9A-Fa-f]+;/g, ' ')
    // Replace any remaining HTML entities with space
    .replace(/&[#\w]+;/g, ' ')
    // Remove extra whitespace and newlines
    .replace(/\n\s*\n/g, '\n')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
};

// Interfaces
interface Bucket {
  key: string;
  doc_count: number;
}

interface Aggregation {
  buckets?: Bucket[];
  [key: string]: unknown;
}

interface Aggregations {
  [key: string]: Aggregation;
}

interface SearchPublisher {
  name?: string;
  logo?: string;
  profile_picture?: string;
}

interface SearchSdg {
  code: string;
  name: string;
}

interface SearchSector {
  name?: string;
}

interface SearchResult {
  type?: string;
  id: string | number;
  slug?: string;
  publisher_type?: string;
  is_individual_dataset?: boolean;
  is_individual_usecase?: boolean;
  is_individual_model?: boolean;
  is_individual_collaborative?: boolean;
  logo?: string;
  profile_picture?: string;
  user?: SearchPublisher;
  organization?: SearchPublisher;
  geographies?: string[];
  sdgs?: SearchSdg[];
  created?: string;
  published_datasets_count?: number;
  published_usecases_count?: number;
  members_count?: number;
  started_on?: string;
  dataset_count?: number;
  modified?: string;
  updated_at?: string;
  download_count?: number;
  has_charts?: boolean;
  sectors?: Array<string | SearchSector>;
  title?: string;
  name?: string;
  description?: string;
  bio?: string;
  tags?: string[];
  formats?: string[];
}

interface UnifiedSearchResponse {
  results: SearchResult[];
  total: number;
  aggregations: Aggregations;
  types_searched: string[];
}

interface CardMetadataItem {
  icon: (typeof Icons)[keyof typeof Icons];
  stroke?: number;
  label: string;
  value: string | number;
  tooltip?: string;
}

type CardMetadataTuple =
  | []
  | [CardMetadataItem]
  | [CardMetadataItem, CardMetadataItem]
  | [CardMetadataItem, CardMetadataItem, CardMetadataItem];

interface FooterChip {
  icon: string;
  label: string;
  tooltip?: string;
}

interface FilterOptions {
  [key: string]: string[];
}

interface QueryParams {
  pageSize: number;
  currentPage: number;
  filters: FilterOptions;
  query?: string;
  sort?: string;
  order?: string;
  types?: string; // New: comma-separated list of types to search
}

const ALL_LISTING_TYPES = 'dataset,usecase,aimodel,publisher';

type Action =
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_FILTERS'; payload: { category: string; values: string[] } }
  | { type: 'REMOVE_FILTER'; payload: { category: string; value: string } }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_SORT'; payload: string }
  | { type: 'SET_ORDER'; payload: string }
  | { type: 'SET_TYPES'; payload: string }
  | { type: 'INITIALIZE'; payload: QueryParams };

// Initial State
const initialState: QueryParams = {
  pageSize: 9,
  currentPage: 1,
  filters: {},
  query: '',
  sort: 'recent',
  order: '',
  types: ALL_LISTING_TYPES, // Default: search all listing types
};

// Query Reducer
const queryReducer = (state: QueryParams, action: Action): QueryParams => {
  switch (action.type) {
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload, currentPage: 1 };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.category]: action.payload.values,
        },
        currentPage: 1,
      };
    case 'REMOVE_FILTER': {
      const newFilters = { ...state.filters };
      newFilters[action.payload.category] = newFilters[
        action.payload.category
      ].filter((v) => v !== action.payload.value);
      return { ...state, filters: newFilters, currentPage: 1 };
    }
    case 'SET_QUERY':
      return { ...state, query: action.payload, currentPage: 1 };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'SET_ORDER':
      return { ...state, order: action.payload };
    case 'SET_TYPES':
      return { ...state, types: action.payload, currentPage: 1 };
    case 'INITIALIZE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// URL Params Hook
const useUrlParams = (
  queryParams: QueryParams,
  setQueryParams: React.Dispatch<Action>,
  setVariables: (vars: string) => void
) => {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sizeParam = urlParams.get('size');
    const pageParam = urlParams.get('page');
    const typesParam = urlParams.get('types');
    const filters: FilterOptions = {};

    urlParams.forEach((val, key) => {
      if (!['size', 'page', 'query', 'types'].includes(key)) {
        filters[key] = val.split(',');
      }
    });

    const initialParams: QueryParams = {
      pageSize: sizeParam ? Number(sizeParam) : 9,
      currentPage: pageParam ? Number(pageParam) : 1,
      filters,
      query: urlParams.get('query') || '',
      types: typesParam || ALL_LISTING_TYPES,
    };

    setQueryParams({ type: 'INITIALIZE', payload: initialParams });
  }, [setQueryParams]);

  useEffect(() => {
    const filtersString = Object.entries(queryParams.filters)
      .filter(([, values]) => values.length > 0)
      .map(([key, values]) => `${key}=${values.join(',')}`)
      .join('&');

    const searchParam = queryParams.query
      ? `&query=${encodeURIComponent(queryParams.query)}`
      : '';
    const sortParam = queryParams.sort
      ? `&sort=${encodeURIComponent(queryParams.sort)}`
      : '';
    const orderParam = queryParams.order
      ? `&order=${encodeURIComponent(queryParams.order)}`
      : '';
    const typesParam = queryParams.types
      ? `&types=${encodeURIComponent(queryParams.types)}`
      : '';

    // In landing mode we need enough mixed items to show all 4 sections.
    const effectiveSize =
      queryParams.types === ALL_LISTING_TYPES ? 120 : queryParams.pageSize;
    const effectivePage =
      queryParams.types === ALL_LISTING_TYPES ? 1 : queryParams.currentPage;

    const variablesString = `?${filtersString}&size=${effectiveSize}&page=${effectivePage}${searchParam}${sortParam}${orderParam}${typesParam}`;
    setVariables(variablesString);

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('size', queryParams.pageSize.toString());
    currentUrl.searchParams.set('page', queryParams.currentPage.toString());

    Object.entries(queryParams.filters).forEach(([key, values]) => {
      if (values.length > 0) {
        currentUrl.searchParams.set(key, values.join(','));
      } else {
        currentUrl.searchParams.delete(key);
      }
    });

    if (queryParams.query) {
      currentUrl.searchParams.set('query', queryParams.query);
    } else {
      currentUrl.searchParams.delete('query');
    }
    if (queryParams.sort) {
      currentUrl.searchParams.set('sort', queryParams.sort);
    } else {
      currentUrl.searchParams.delete('sort');
    }
    if (queryParams.order) {
      currentUrl.searchParams.set('order', queryParams.order);
    } else {
      currentUrl.searchParams.delete('order');
    }
    if (queryParams.types) {
      currentUrl.searchParams.set('types', queryParams.types);
    } else {
      currentUrl.searchParams.delete('types');
    }

    router.replace(currentUrl.toString());
  }, [queryParams, setVariables, router]);
};

// Fetch unified search data
const fetchUnifiedData = async (variables: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/unified/${variables}`
  );

  if (!response.ok) {
    const text = await response.text();
    console.error('API Error Response:', text.substring(0, 500));
    throw new Error(`API returned ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as UnifiedSearchResponse;
  } catch (e) {
    console.error(
      'JSON Parse Error. Response text:',
      text.substring(0, 600),
      'Error: ',
      e
    );
    throw new Error(`Failed to parse JSON response`);
  }
};

// Listing Component Props
interface UnifiedListingProps {
  breadcrumbData?: { href: string; label: string }[];
  placeholder: string;
  redirectionURL: string;
}

const UnifiedListingComponent: React.FC<UnifiedListingProps> = ({
  breadcrumbData,
  placeholder,
  redirectionURL,
}) => {
  const [facets, setFacets] = useState<UnifiedSearchResponse | null>(null);
  const [variables, setVariables] = useState('');
  const [open, setOpen] = useState(false);
  const [queryParams, setQueryParams] = useReducer(queryReducer, initialState);
  const [view] = useState<'collapsed' | 'expanded'>('collapsed');
  const [persistedTypeCounts, setPersistedTypeCounts] = useState<
    Record<string, number>
  >({});

  const count = facets?.total ?? 0;
  const results = facets?.results ?? [];

  useUrlParams(queryParams, setQueryParams, setVariables);
  const latestFetchId = useRef(0);

  const [, setError] = useState<string | null>(null);
  const [, setIsLoading] = useState(false);

  useEffect(() => {
    if (variables) {
      const currentFetchId = ++latestFetchId.current;

      fetchUnifiedData(variables)
        .then((res) => {
          if (currentFetchId === latestFetchId.current) {
            setFacets(res);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error('Search error:', err);
          if (currentFetchId === latestFetchId.current) {
            setError('Failed to load search results. Please try again.');
            setIsLoading(false);
          }
        });
    }
  }, [variables]);

  const hasMounted = useMounted();

  const handlePageChange = (newPage: number) => {
    setQueryParams({ type: 'SET_CURRENT_PAGE', payload: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    setQueryParams({ type: 'SET_PAGE_SIZE', payload: newSize });
  };

  const handleFilterChange = (category: string, values: string[]) => {
    setQueryParams({ type: 'SET_FILTERS', payload: { category, values } });
  };

  const handleRemoveFilter = (category: string, value: string) => {
    setQueryParams({ type: 'REMOVE_FILTER', payload: { category, value } });
  };

  const handleSearch = (searchTerm: string) => {
    setQueryParams({ type: 'SET_QUERY', payload: searchTerm });
  };

  const handleSortChange = (sortOption: string) => {
    setQueryParams({ type: 'SET_SORT', payload: sortOption });
  };

  const handleTypeFilter = (types: string) => {
    setQueryParams({ type: 'SET_TYPES', payload: types });
  };

  const aggregations: Aggregations = facets?.aggregations || {};

  const getFilterPriority = (key: string) => {
    const normalized = key.toLowerCase().replace(/[\s_-]/g, '');

    if (normalized === 'geographies') return 1;
    if (normalized === 'sectors') return 2;
    if (normalized === 'timeperiod') return 3;
    if (normalized === 'contributortype' || normalized === 'publishertype')
      return 4;
    if (normalized === 'fileformat' || normalized === 'formats') return 5;
    if (normalized === 'tags') return 6;
    if (normalized === 'status') return 7;

    return 999;
  };

  const filterOptions = Object.entries(aggregations)
    .sort(([a], [b]) => {
      const priorityDiff = getFilterPriority(a) - getFilterPriority(b);
      return priorityDiff !== 0 ? priorityDiff : a.localeCompare(b);
    })
    .reduce(
      (
        acc: Record<string, { label: string; value: string }[]>,
        [key, _value]
      ) => {
        // Skip the 'types' aggregation from filters
        if (key === 'types') return acc;

        // Check if _value exists and has buckets array (Elasticsearch format)
        if (_value && _value.buckets && Array.isArray(_value.buckets)) {
          acc[key] = _value.buckets.map((bucket) => ({
            label: bucket.key,
            value: bucket.key,
          }));
        }
        // Handle key-value object format (current backend format)
        else if (
          _value &&
          typeof _value === 'object' &&
          !Array.isArray(_value)
        ) {
          acc[key] = Object.entries(_value).map(([label]) => ({
            label: label,
            value: label,
          }));
        }
        return acc;
      },
      {}
    );

  // Get type counts from aggregations
  const typeCounts = useMemo(
    () => aggregations.types || {},
    [aggregations.types]
  );
  const liveTypeCounts = Object.entries(typeCounts).reduce(
    (acc, [key, value]) => {
      if (typeof value === 'number') {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, number>
  );
  const displayTypeCounts = { ...persistedTypeCounts, ...liveTypeCounts };

  const [prevTypeCounts, setPrevTypeCounts] = useState(typeCounts);
  if (typeCounts !== prevTypeCounts) {
    setPrevTypeCounts(typeCounts);
    const counts = Object.entries(typeCounts).reduce(
      (acc, [key, value]) => {
        if (typeof value === 'number') {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    if (Object.keys(counts).length > 0) {
      setPersistedTypeCounts((prev) => {
        const next = { ...prev };
        let changed = false;

        Object.entries(counts).forEach(([key, value]) => {
          if (next[key] !== value) {
            next[key] = value;
            changed = true;
          }
        });

        return changed ? next : prev;
      });
    }
  }

  const getTypeButtonClass = (type: string) => {
    return `font-normal rounded-full border-1 border-solid border-[#C9cccf] ${queryParams.types === type ? 'font-semibold bg-[#E5EFFD] text-primaryBlue border-[#E5EFFD]' : 'bg-[#F2F7FE]'} hover:bg-[#EDF4FE]`;
  };

  if (!hasMounted) return <Loading />;

  // Helper function to get redirect URL based on type
  const getRedirectUrl = (item: SearchResult) => {
    switch (item.type) {
      case 'dataset':
        return `/datasets/${item.id}`;
      case 'usecase':
        return `/usecases/${item.id}`;
      case 'aimodel':
        return `/aimodels/${item.id}`;
      case 'collaborative':
        return getCollaborativeDetailUrl(item.slug);
      case 'publisher':
        // For publishers, redirect based on publisher_type
        if (item.publisher_type === 'organization') {
          return `/publishers/organization/${item.id}`;
        } else {
          return `/publishers/${item.id}`;
        }
      default:
        return `${redirectionURL}/${item.id}`;
    }
  };

  const isSectionedLanding = queryParams.types === ALL_LISTING_TYPES;
  const selectedTypes = (queryParams.types || '')
    .split(',')
    .map((type) => type.trim())
    .filter(Boolean);
  const singleSelectedType =
    !isSectionedLanding && selectedTypes.length === 1 ? selectedTypes[0] : null;
  const tabResults = singleSelectedType
    ? results.filter((item) => item.type === singleSelectedType)
    : results;
  const tabTotalCount =
    singleSelectedType &&
    typeof displayTypeCounts[singleSelectedType] === 'number'
      ? displayTypeCounts[singleSelectedType]
      : count;

  const renderResultCard = (item: SearchResult) => {
    const isIndividual =
      item.is_individual_dataset ||
      item.is_individual_usecase ||
      item.is_individual_model ||
      item.is_individual_collaborative ||
      (item.type === 'publisher' && item.publisher_type === 'user');

    const image =
      item.type === 'publisher'
        ? item.logo
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.logo}`
          : item.publisher_type === 'user'
            ? '/profile.png'
            : '/org.png'
        : isIndividual
          ? item?.user?.profile_picture
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.user.profile_picture}`
            : '/profile.png'
          : item?.organization?.logo
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.organization.logo}`
            : '/org.png';

    const geographies =
      item.geographies && item.geographies.length > 0 ? item.geographies : null;
    const sdgs = item.sdgs && item.sdgs.length > 0 ? item.sdgs : null;

    const MetadataContent: CardMetadataItem[] = [];

    if (item.type === 'publisher') {
      MetadataContent.push({
        icon: Icons.calendarEvent,
        label: 'Joined',
        value: formatDate(item.created ?? null) || '',
        tooltip: 'Date joined',
        stroke: 1.2,
      });
      MetadataContent.push({
        icon: Icons.dataset,
        label: 'Datasets',
        value: item.published_datasets_count?.toString() || '0',
        tooltip: 'Published datasets',
      });
      MetadataContent.push({
        icon: Icons['usecase' as keyof typeof Icons],
        label: 'Use Cases',
        value: item.published_usecases_count?.toString() || '0',
        tooltip: 'Published use cases',
      });
      if (item.publisher_type === 'organization' && (item.members_count ?? 0) > 0) {
        MetadataContent.push({
          icon: Icons['users' as keyof typeof Icons],
          label: 'Members',
          value: item.members_count?.toString() || '0',
          tooltip: 'Organization members',
        });
      }
    } else if (item.type === 'collaborative') {
      MetadataContent.push({
        icon: Icons.calendarEvent,
        label: 'Started',
        value: formatDate(item.started_on || item.created || null) || '',
        stroke: 1.2,
      });
      MetadataContent.push({
        icon: Icons.dataset,
        label: 'Datasets',
        value: item.dataset_count?.toString() || '0',
      });
      if (geographies && geographies.length > 0) {
        const geoDisplay = geographies.join(', ');
        MetadataContent.push({
          icon: Icons.worldPin,
          label: 'Geography',
          value: geoDisplay,
          stroke: 1.2,
        });
      } else {
        MetadataContent.push({
          icon: Icons.worldPin,
          label: 'Geography',
          value: 'N/A',
          stroke: 1.2,
        });
      }
    } else {
      MetadataContent.push({
        icon: Icons.calendarEvent,
        label: 'Date',
        value: formatDate(item.modified || item.updated_at || null) || '',
        tooltip: 'Date',
        stroke: 1.2,
      });

      if (geographies && geographies.length > 0) {
        const geoDisplay = geographies.join(', ');
        MetadataContent.push({
          icon: Icons.worldPin,
          label: 'Geography',
          value: geoDisplay,
          tooltip: geoDisplay,
          stroke: 1.2,
        });
      }
    }

    if (item.type === 'dataset' && (item.download_count ?? 0) > 0) {
      MetadataContent.push({
        icon: Icons.fileDownload,
        label: 'Download',
        value: item.download_count || 0,
        tooltip: 'Download',
        stroke: 1.2,
      });
    }

    if (item.type === 'dataset' && sdgs && sdgs.length > 0) {
      const sdgDisplay = sdgs
        .map((sdg) => `${sdg.code} - ${sdg.name}`)
        .join(', ');
      MetadataContent.push({
        icon: Icons.star,
        label: 'SDG Goals',
        value: sdgDisplay,
        tooltip: sdgDisplay,
      });
    }

    if (item.type === 'dataset' && item.has_charts && view === 'expanded') {
      MetadataContent.push({
        icon: Icons.chart,
        label: '',
        value: 'With Charts',
        tooltip: 'Charts',
      });
    }

    const LeftFooterChips: FooterChip[] = [];
    const RightFooterChips: FooterChip[] = [];

    if (item.type === 'publisher') {
      LeftFooterChips.push({
        icon:
          item.publisher_type === 'organization' ? '/org.png' : '/profile.png',
        label:
          item.publisher_type === 'organization'
            ? 'Organization'
            : 'Individual Publisher',
        tooltip:
          item.publisher_type === 'organization'
            ? 'Organization Publisher'
            : 'Individual Publisher',
      });
    } else if (item.type === 'collaborative') {
      if (item.sectors && item.sectors.length > 0) {
        const sectorName =
          typeof item.sectors[0] === 'string'
            ? item.sectors[0]
            : item.sectors[0]?.name;
        LeftFooterChips.push({
          icon: sectorName
            ? `/Sectors/${sectorName}.svg`
            : '/Sectors/default.svg',
          label: 'Sectors',
        });
      } else {
        LeftFooterChips.push({
          icon: '/Sectors/default.svg',
          label: 'Sectors',
        });
      }
    } else if (item.sectors && item.sectors.length > 0) {
      LeftFooterChips.push({
        icon: `/Sectors/${item.sectors?.[0]}.svg`,
        label: 'Sectors',
        tooltip: `${item.sectors?.[0]}`,
      });
    }

    if (item.type === 'dataset' && item.has_charts && view !== 'expanded') {
      LeftFooterChips.push({
        icon: `/chart-bar.svg`,
        label: 'Charts',
        tooltip: 'Charts',
      });
    }

    if (item.type !== 'publisher') {
      RightFooterChips.push({
        icon: image,
        label: 'Published by',
        tooltip: `${isIndividual ? item.user?.name : item.organization?.name}`,
      });
    }

    const commonProps = {
      title: item.title || item.name || '',
      description: stripMarkdown(item.description || item.bio || ''),
      // ...((item.type === 'usecase' || item.type === 'dataset') && {
      //   description: stripMarkdown(item.description || item.bio || ''),
      // }),
      metadataContent: MetadataContent as CardMetadataTuple,
      tag: item.tags || [],
      formats: item.type === 'dataset' ? item.formats || [] : [],
      leftFooterChips: LeftFooterChips,
      rightFooterChips: RightFooterChips,
      imageUrl: '',
      ...(item.type === 'usecase'
        ? {
            withViewButton: true,
          }
        : {
            withViewButton: false,
          }),
      ...(item.type === 'usecase'
        ? {
            reserveDescriptionSpace: true,
          }
        : {
            reserveDescriptionSpace: false,
          }),
    };

    if (item.type === 'publisher') {
      if (item.logo) {
        commonProps.imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.logo}`;
      } else if (item.profile_picture) {
        commonProps.imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.profile_picture}`;
      }
    } else if (item.logo) {
      commonProps.imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.logo}`;
    }

    if (item.type === 'publisher') {
      return (
        <Link
          href={getRedirectUrl(item)}
          key={
            item.type === 'publisher'
              ? `${item.type}-${item.publisher_type}-${item.id}`
              : `${item.type}-${item.id}`
          }
          className="flex flex-col gap-4 rounded-4 p-6 shadow-card"
        >
          <div className="flex items-center gap-4">
            <Image
              height={80}
              width={80}
              src={
                item.publisher_type === 'user'
                  ? item.profile_picture
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.profile_picture}`
                    : '/profile.png'
                  : item.logo
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.logo}`
                    : '/org.png'
              }
              alt="publisher logo"
              className="rounded-2 border-2 border-solid border-greyExtralight object-contain p-2"
            />
            <div className="flex flex-col gap-2">
              <Text className="text-primaryBlue" fontWeight="semibold">
                {item.name || item.title}
              </Text>
              <div className="flex w-fit rounded-full border-1 border-solid border-[#D5E1EA] bg-[#E9EFF4] px-3 py-1">
                <Text variant="bodySm">
                  {item.publisher_type === 'user'
                    ? 'Individual Publisher'
                    : 'Organization'}
                </Text>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex w-fit rounded-full border-1 border-solid border-[#D5E1EA] px-3 py-1">
              <Text variant="bodySm" className="text-primaryBlue">
                {item.published_usecases_count || 0} Use Cases
              </Text>
            </div>
            <div className="flex w-fit rounded-full border-1 border-solid border-[#D5E1EA] px-3 py-1">
              <Text variant="bodySm" className="text-primaryBlue">
                {item.published_datasets_count || 0} Datasets
              </Text>
            </div>
          </div>
          {(item.bio || item.description) && (
            <div>
              <Text className="line-clamp-2">
                {(item.bio || item.description || '').length > 220
                  ? (item.bio || item.description || '').slice(0, 220) + '...'
                  : item.bio || item.description}
              </Text>
            </div>
          )}
        </Link>
      );
    }

    return (
      <Card
        {...commonProps}
        key={
          item.type === 'publisher'
            ? `${item.type}-${item.publisher_type}-${item.id}`
            : `${item.type}-${item.id}`
        }
        variation={view === 'expanded' ? 'expanded' : 'collapsed'}
        iconColor="metadata"
        href={getRedirectUrl(item)}
        // {...(item.type === 'usecase' && {
        //   type: [
        //     {
        //       label: 'Use Case',
        //       fillColor: '#fff',
        //       borderColor: '#000',
        //     },
        //   ],
        // })}
      />
    );
  };

  return (
    <div className="bg-basePureWhite">
      {breadcrumbData && <BreadCrumbs data={breadcrumbData} />}
      <div className="mx-6 flex flex-wrap items-center justify-between gap-5 rounded-2 py-8 lg:flex-nowrap">
        <div className="w-full md:block">
          <SearchInput
            key={queryParams.query}
            label="Search"
            name="Search"
            className={cn(Styles.Search)}
            placeholder={placeholder}
            defaultValue={queryParams.query}
            onSubmit={(value) => handleSearch(value)}
            onClear={(value) => handleSearch(value)}
          />
        </div>
        <div className="flex flex-wrap justify-between gap-3 lg:flex-nowrap lg:justify-normal lg:gap-5">
          {/* <div className="hidden items-center gap-2 lg:flex">
                    <ButtonGroup noWrap spacing="tight">
                      <Button
                        kind={'tertiary'}
                        className="h-fit w-fit"
                        onClick={() => setView('collapsed')}
                      >
                        <Icon
                          source={Icons.grid}
                          color={view === 'collapsed' ? 'highlight' : 'default'}
                        />
                      </Button>
                      <Button
                        onClick={() => setView('expanded')}
                        kind={'tertiary'}
                        className="h-fit w-fit"
                      >
                        <Icon
                          source={Icons.list}
                          color={view === 'expanded' ? 'highlight' : 'default'}
                        />
                      </Button>
                    </ButtonGroup>
                  </div> */}
          {/* <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        handleOrderChange(
                          queryParams.order === ''
                            ? 'desc'
                            : queryParams.order === 'desc'
                              ? 'asc'
                              : 'desc'
                        )
                      }
                      kind="tertiary"
                      className="h-fit w-fit"
                      aria-label={`Sort ${queryParams.order === 'asc' ? 'descending' : 'ascending'}`}
                    >
                      <Icon
                        source={Icons.sort}
                        className={cn(
                          queryParams.order === 'desc' && 'scale-x-[-1]'
                        )}
                      />
                    </Button>
                  </div> */}
          <div className="flex items-center">
            <Select
              label=""
              labelInline
              name="select"
              // className={cn(Styles.Select)}
              onChange={handleSortChange}
              options={[
                { label: 'Recent', value: 'recent' },
                { label: 'Alphabetical', value: 'alphabetical' },
              ]}
            />
          </div>

          <Tray
            size="narrow"
            open={open}
            onOpenChange={setOpen}
            trigger={
              <Button
                kind="secondary"
                className="lg:hidden"
                onClick={() => setOpen(true)}
              >
                Filter
              </Button>
            }
          >
            <Filter
              setOpen={setOpen}
              options={filterOptions}
              setSelectedOptions={handleFilterChange}
              selectedOptions={queryParams.filters}
              lockedFilters={{}}
            />
          </Tray>
        </div>
      </div>
      <div className="container">
        <div className="">
          <div className="row mb-16 flex gap-5 ">
            <div className="hidden min-w-64 max-w-64 lg:block">
              <Filter
                options={filterOptions}
                setSelectedOptions={handleFilterChange}
                selectedOptions={queryParams.filters}
                lockedFilters={{}}
              />
            </div>

            <div className="flex w-full flex-col gap-4 px-2">
              {/* Type Filter Buttons */}
              <div className="rounded-lg border border-gray-200 flex flex-wrap gap-2 bg-white p-3">
                <Button
                  kind={
                    queryParams.types === ALL_LISTING_TYPES
                      ? 'primary'
                      : 'secondary'
                  }
                  onClick={() => handleTypeFilter(ALL_LISTING_TYPES)}
                  size="large"
                  className={getTypeButtonClass(ALL_LISTING_TYPES)}
                >
                  All
                  {displayTypeCounts.dataset !== undefined &&
                    displayTypeCounts.usecase !== undefined &&
                    displayTypeCounts.aimodel !== undefined &&
                    displayTypeCounts.publisher !== undefined && (
                      <span className="text-xs ml-1">
                        (
                        {(displayTypeCounts.dataset || 0) +
                          (displayTypeCounts.usecase || 0) +
                          (displayTypeCounts.aimodel || 0) +
                          (displayTypeCounts.publisher || 0)}
                        )
                      </span>
                    )}
                </Button>
                <Button
                  kind={
                    queryParams.types === 'dataset' ? 'primary' : 'secondary'
                  }
                  onClick={() => handleTypeFilter('dataset')}
                  size="large"
                  className={getTypeButtonClass('dataset')}
                >
                  Datasets
                  {displayTypeCounts.dataset !== undefined && (
                    <span className="text-xs ml-1">
                      ({displayTypeCounts.dataset || 0})
                    </span>
                  )}
                </Button>
                <Button
                  kind={
                    queryParams.types === 'usecase' ? 'primary' : 'secondary'
                  }
                  onClick={() => handleTypeFilter('usecase')}
                  size="large"
                  className={getTypeButtonClass('usecase')}
                >
                  Use Cases
                  {displayTypeCounts.usecase !== undefined && (
                    <span className="text-xs ml-1">
                      ({displayTypeCounts.usecase || 0})
                    </span>
                  )}
                </Button>
                <Button
                  kind={
                    queryParams.types === 'aimodel' ? 'primary' : 'secondary'
                  }
                  onClick={() => handleTypeFilter('aimodel')}
                  size="large"
                  className={getTypeButtonClass('aimodel')}
                >
                  AI Models
                  {displayTypeCounts.aimodel !== undefined && (
                    <span className="text-xs ml-1">
                      ({displayTypeCounts.aimodel || 0})
                    </span>
                  )}
                </Button>
                <Button
                  kind={
                    queryParams.types === 'publisher' ? 'primary' : 'secondary'
                  }
                  onClick={() => handleTypeFilter('publisher')}
                  size="large"
                  className={getTypeButtonClass('publisher')}
                >
                  Publishers
                  {displayTypeCounts.publisher !== undefined && (
                    <span className="text-xs ml-1">
                      ({displayTypeCounts.publisher || 0})
                    </span>
                  )}
                </Button>
              </div>

              {Object.entries(queryParams.filters).some(
                ([key, value]) =>
                  key !== 'sort' && Array.isArray(value) && value.length > 0
              ) && (
                <div className="flex gap-2">
                  {Object.entries(queryParams.filters).map(
                    ([category, values]) =>
                      values
                        .filter(() => category !== 'sort')
                        .map((val) => (
                          <Pill
                            key={`${category}-${val}`}
                            onRemove={() => handleRemoveFilter(category, val)}
                          >
                            {val}
                          </Pill>
                        ))
                  )}
                </div>
              )}

              {facets === null ? (
                <Loading />
              ) : results.length > 0 ? (
                isSectionedLanding ? (
                  <div className="ml-4 flex flex-col gap-12">
                    {[
                      {
                        key: 'aimodel',
                        title: 'AI Models',
                        subtitle:
                          'The most popular AI models on CivicDataSpace',
                      },
                      {
                        key: 'dataset',
                        title: 'Datasets',
                        subtitle: 'The most popular datasets on CivicDataSpace',
                      },
                      {
                        key: 'usecase',
                        title: 'Use Cases',
                        subtitle:
                          'The most popular use cases on CivicDataSpace',
                      },
                      {
                        key: 'publisher',
                        title: 'Contributors',
                        subtitle:
                          'The most active contributors on CivicDataSpace',
                      },
                    ].map((section) => {
                      const sectionResults = Array.from(
                        new Map(
                          results
                            .filter((item) => item.type === section.key)
                            .map((item) => [
                              `${item.type}-${item.publisher_type || ''}-${item.id}`,
                              item,
                            ])
                        ).values()
                      ).slice(0, 3);

                      if (!sectionResults.length) return null;

                      return (
                        <div key={section.key} className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <Text variant="headingLg" fontWeight="semibold">
                                {section.title}
                              </Text>
                              <Text variant="bodyMd">{section.subtitle}</Text>
                            </div>
                            <Button
                              kind="tertiary"
                              className="!p-0"
                              onClick={() => handleTypeFilter(section.key)}
                            >
                              <span className="flex items-center gap-2">
                                <Text
                                  variant="bodyMd"
                                  fontWeight="semibold"
                                  color="inherit"
                                >
                                  See More
                                </Text>
                                <Icons.arrowRight size={16} />
                              </span>
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {sectionResults.map((item) =>
                              renderResultCard(item)
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <GraphqlPagination
                    totalRows={tabTotalCount}
                    pageSize={queryParams.pageSize}
                    currentPage={queryParams.currentPage}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    view={view}
                  >
                    {tabResults.map((item) => renderResultCard(item))}
                  </GraphqlPagination>
                )
              ) : (
                <div className="flex h-screen items-center justify-center">
                  <Text variant="heading2xl">No results found</Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedListingComponent;
