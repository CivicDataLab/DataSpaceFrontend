'use client'

import GraphqlPagination from '@/app/[locale]/dashboard/components/GraphqlPagination/graphqlPagination';
import { useRouter } from 'next/navigation';
import {
  Button,
  ButtonGroup,
  Card,
  Icon,
  Pill,
  SearchInput,
  Select,
  Text,
  Tray,
} from 'opub-ui';
import React, { useEffect, useReducer, useRef, useState } from 'react';

import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import { cn, formatDate } from '@/lib/utils';
import Filter from '../../datasets/components/FIlter/Filter';
import Styles from '../../datasets/dataset.module.scss';

// Helper function to strip markdown and HTML tags for card preview
const stripMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/^\s*>\s+/gm, '')
    .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\n\s*\n/g, '\n')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Interfaces
interface Bucket {
  key: string;
  doc_count: number;
}

interface Aggregation {
  buckets?: Bucket[];
  [key: string]: any;
}

interface Aggregations {
  [key: string]: Aggregation;
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
  types: 'dataset,usecase,aimodel', // Default: search all types
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
      types: typesParam || 'dataset,usecase,aimodel',
    };

    setQueryParams({ type: 'INITIALIZE', payload: initialParams });
  }, [setQueryParams]);

  useEffect(() => {
    const filtersString = Object.entries(queryParams.filters)
      .filter(([_key, values]) => values.length > 0)
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
    
    const variablesString = `?${filtersString}&size=${queryParams.pageSize}&page=${queryParams.currentPage}${searchParam}${sortParam}${orderParam}${typesParam}`;
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
  const data = await response.json();
  return data;
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
  const [facets, setFacets] = useState<{
    results: any[];
    total: number;
    aggregations: Aggregations;
    types_searched: string[];
  } | null>(null);
  const [variables, setVariables] = useState('');
  const [open, setOpen] = useState(false);
  const [queryParams, setQueryParams] = useReducer(queryReducer, initialState);
  const [view, setView] = useState<'collapsed' | 'expanded'>('collapsed');

  const count = facets?.total ?? 0;
  const results = facets?.results ?? [];

  useUrlParams(queryParams, setQueryParams, setVariables);
  const latestFetchId = useRef(0);

  useEffect(() => {
    if (variables) {
      const currentFetchId = ++latestFetchId.current;

      fetchUnifiedData(variables)
        .then((res) => {
          if (currentFetchId === latestFetchId.current) {
            setFacets(res);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [variables]);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return <Loading />;

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

  const handleOrderChange = (sortOrder: string) => {
    setQueryParams({ type: 'SET_ORDER', payload: sortOrder });
  };

  const handleTypeFilter = (types: string) => {
    setQueryParams({ type: 'SET_TYPES', payload: types });
  };

  const aggregations: Aggregations = facets?.aggregations || {};

  const filterOptions = Object.entries(aggregations).reduce(
    (acc: Record<string, { label: string; value: string }[]>, [key, _value]) => {
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
      else if (_value && typeof _value === 'object' && !Array.isArray(_value)) {
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
  const typeCounts = aggregations.types || {};

  // Helper function to get redirect URL based on type
  const getRedirectUrl = (item: any) => {
    switch (item.type) {
      case 'dataset':
        return `/datasets/${item.id}`;
      case 'usecase':
        return `/usecases/${item.id}`;
      case 'aimodel':
        return `/aimodels/${item.id}`;
      default:
        return `${redirectionURL}/${item.id}`;
    }
  };


  return (
    <div className="bg-basePureWhite">
      {breadcrumbData && <BreadCrumbs data={breadcrumbData} />}
      <div className="container">
        <div className="mt-5 lg:mt-10">
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
              <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-3">
                <Button
                  kind={queryParams.types === 'dataset,usecase,aimodel' ? 'primary' : 'secondary'}
                  onClick={() => handleTypeFilter('dataset,usecase,aimodel')}
                  size="slim"
                >
                  All Results
                  {typeCounts.dataset !== undefined && typeCounts.usecase !== undefined && typeCounts.aimodel !== undefined && (
                    <span className="ml-1 text-xs">
                      ({(typeCounts.dataset || 0) + (typeCounts.usecase || 0) + (typeCounts.aimodel || 0)})
                    </span>
                  )}
                </Button>
                <Button
                  kind={queryParams.types === 'dataset' ? 'primary' : 'secondary'}
                  onClick={() => handleTypeFilter('dataset')}
                  size="slim"
                >
                  Datasets
                  {typeCounts.dataset !== undefined && (
                    <span className="ml-1 text-xs">({typeCounts.dataset || 0})</span>
                  )}
                </Button>
                <Button
                  kind={queryParams.types === 'usecase' ? 'primary' : 'secondary'}
                  onClick={() => handleTypeFilter('usecase')}
                  size="slim"
                >
                  Use Cases
                  {typeCounts.usecase !== undefined && (
                    <span className="ml-1 text-xs">({typeCounts.usecase || 0})</span>
                  )}
                </Button>
                <Button
                  kind={queryParams.types === 'aimodel' ? 'primary' : 'secondary'}
                  onClick={() => handleTypeFilter('aimodel')}
                  size="slim"
                >
                  AI Models
                  {typeCounts.aimodel !== undefined && (
                    <span className="ml-1 text-xs">({typeCounts.aimodel || 0})</span>
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-5 rounded-2 py-2 lg:flex-nowrap">
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
                  <div className="hidden items-center gap-2 lg:flex">
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
                  </div>
                  <div className="flex items-center gap-2">
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
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      label=""
                      labelInline
                      name="select"
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
                <GraphqlPagination
                  totalRows={count}
                  pageSize={queryParams.pageSize}
                  currentPage={queryParams.currentPage}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  view={view}
                >
                  {results.map((item: any) => {
                    // Determine if it's individual or organization
                    const isIndividual = 
                      item.is_individual_dataset || 
                      item.is_individual_usecase || 
                      item.is_individual_model;
                    
                    const image = isIndividual
                      ? item?.user?.profile_picture
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.user.profile_picture}`
                        : '/profile.png'
                      : item?.organization?.logo
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.organization.logo}`
                        : '/org.png';
                    
                    const geographies = item.geographies && item.geographies.length > 0
                      ? item.geographies
                      : null;

                    const sdgs = item.sdgs && item.sdgs.length > 0
                      ? item.sdgs
                      : null;

                    const MetadataContent = [
                      {
                        icon: Icons.calendar,
                        label: 'Date',
                        value: formatDate(item.modified || item.updated_at),
                        tooltip: 'Date',
                      },
                    ];

                    // Type-specific metadata for datasets
                    if (item.type === 'dataset' && item.download_count > 0) {
                      MetadataContent.push({
                        icon: Icons.download,
                        label: 'Download',
                        value: item.download_count?.toString() || '0',
                        tooltip: 'Download',
                      });
                    }

                    if (geographies && geographies.length > 0) {
                      const geoDisplay = geographies.join(', ');
                      MetadataContent.push({
                        icon: Icons.globe,
                        label: 'Geography',
                        value: geoDisplay,
                        tooltip: geoDisplay,
                      });
                    }

                    // Add SDGs for datasets
                    if (item.type === 'dataset' && sdgs && sdgs.length > 0) {
                      const sdgDisplay = sdgs.map((sdg: any) => `${sdg.code} - ${sdg.name}`).join(', ');
                      MetadataContent.push({
                        icon: Icons.star,
                        label: 'SDG Goals',
                        value: sdgDisplay,
                        tooltip: sdgDisplay,
                      });
                    }

                    // Add charts indicator for datasets
                    if (item.type === 'dataset' && item.has_charts && view === 'expanded') {
                      MetadataContent.push({
                        icon: Icons.chart,
                        label: '',
                        value: 'With Charts',
                        tooltip: 'Charts',
                      });
                    }

                    const FooterContent = [
                      ...(item.sectors && item.sectors.length > 0
                        ? [{
                            icon: `/Sectors/${item.sectors?.[0]}.svg`,
                            label: 'Sectors',
                            tooltip: `${item.sectors?.[0]}`,
                          }]
                        : []),
                      ...(item.type === 'dataset' && item.has_charts && view !== 'expanded'
                        ? [
                            {
                              icon: `/chart-bar.svg`,
                              label: 'Charts',
                              tooltip: 'Charts',
                            },
                          ]
                        : []),
                      {
                        icon: image,
                        label: 'Published by',
                        tooltip: `${isIndividual ? item.user?.name : item.organization?.name}`,
                      },
                    ];

                    const commonProps = {
                      title: item.title,
                      description: stripMarkdown(item.description || ''),
                      metadataContent: MetadataContent,
                      tag: item.tags,
                      formats: item.type === 'dataset' ? item.formats : [],
                      footerContent: FooterContent,
                      imageUrl: '',
                    };

                    if (item.logo) {
                      commonProps.imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.logo}`;
                    }

                    return (
                      <Card
                        {...commonProps}
                        key={`${item.type}-${item.id}`}
                        variation={
                          view === 'expanded' ? 'expanded' : 'collapsed'
                        }
                        iconColor="warning"
                        href={getRedirectUrl(item)}
                      />
                    );
                  })}
                </GraphqlPagination>
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
