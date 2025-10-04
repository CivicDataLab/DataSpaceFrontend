'use client'  

import GraphqlPagination from '@/app/[locale]/dashboard/components/GraphqlPagination/graphqlPagination';
import Image from 'next/image';
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
import { fetchData } from '@/fetch';
import { cn, formatDate } from '@/lib/utils';
import Filter from '../datasets/components/FIlter/Filter';
import Styles from '../datasets/dataset.module.scss';

// Helper function to strip markdown and HTML tags for card preview
const stripMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  return markdown
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
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove extra whitespace and newlines
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
  buckets: Bucket[];
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
}

type Action =
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_FILTERS'; payload: { category: string; values: string[] } }
  | { type: 'REMOVE_FILTER'; payload: { category: string; value: string } }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_SORT'; payload: string }
  | { type: 'SET_ORDER'; payload: string }
  | { type: 'INITIALIZE'; payload: QueryParams };

// Initial State
const initialState: QueryParams = {
  pageSize: 9,
  currentPage: 1,
  filters: {},
  query: '',
  sort: 'recent',
  order: '',
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
    const filters: FilterOptions = {};

    urlParams.forEach((value, key) => {
      if (!['size', 'page', 'query'].includes(key)) {
        filters[key] = value.split(',');
      }
    });

    const initialParams: QueryParams = {
      pageSize: sizeParam ? Number(sizeParam) : 9,
      currentPage: pageParam ? Number(pageParam) : 1,
      filters,
      query: urlParams.get('query') || '',
    };

    setQueryParams({ type: 'INITIALIZE', payload: initialParams });
  }, [setQueryParams]);

  useEffect(() => {
    const filtersString = Object.entries(queryParams.filters)
      .filter(([_, values]) => values.length > 0)
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
    const variablesString = `?${filtersString}&size=${queryParams.pageSize}&page=${queryParams.currentPage}${searchParam}${sortParam}${orderParam}`;
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
    router.replace(currentUrl.toString());
  }, [queryParams, setVariables, router]);
};

// Listing Component Props
interface ListingProps {
  type: string;
  breadcrumbData?: { href: string; label: string }[];
  headerComponent?: React.ReactNode;
  categoryName?: string;
  categoryDescription?: string;
  categoryImage?: string;
  placeholder: string;
  redirectionURL: string;
}

const ListingComponent: React.FC<ListingProps> = ({
  type,
  breadcrumbData,
  headerComponent,
  categoryName,
  categoryDescription,
  categoryImage,
  placeholder,
  redirectionURL,
}) => {
  const [facets, setFacets] = useState<{
    results: any[];
    total: number;
    aggregations: Aggregations;
  } | null>(null);
  const [variables, setVariables] = useState('');
  const [open, setOpen] = useState(false);
  const [queryParams, setQueryParams] = useReducer(queryReducer, initialState);
  const [view, setView] = useState<'collapsed' | 'expanded'>('collapsed');

  const count = facets?.total ?? 0;
  const datasetDetails = facets?.results ?? [];

  useUrlParams(queryParams, setQueryParams, setVariables);
  const latestFetchId = useRef(0);

  useEffect(() => {
    if (variables) {
      const currentFetchId = ++latestFetchId.current;

      fetchData(type,variables)
        .then((res) => {
          // Only set if this is the latest call
          if (currentFetchId === latestFetchId.current) {
            setFacets(res);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [variables, type]);

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

  const aggregations: Aggregations = facets?.aggregations || {};

  const filterOptions = Object.entries(aggregations).reduce(
    (acc: Record<string, { label: string; value: string }[]>, [key, value]) => {
      // Check if value exists and has buckets array (Elasticsearch format)
      if (value && value.buckets && Array.isArray(value.buckets)) {
        acc[key] = value.buckets.map((bucket) => ({
          label: bucket.key,
          value: bucket.key,
        }));
      } 
      // Handle key-value object format (current backend format)
      else if (value && typeof value === 'object' && !Array.isArray(value)) {
        acc[key] = Object.entries(value).map(([label, count]) => ({
          label: label,
          value: label,
        }));
      }
      return acc;
    },
    {}
  );

  return (
    <div className="bg-basePureWhite">
      {breadcrumbData && <BreadCrumbs data={breadcrumbData} />}
      <div className="container">
        {/* Optional Category Header */}
        {(categoryName || categoryDescription || categoryImage) && (
          <div className="flex  flex-wrap items-center justify-center gap-6 py-6 lg:flex-nowrap lg:items-start lg:gap-10 lg:pb-10 lg:pt-14">
            {categoryImage && (
              <div className="flex flex-col items-center justify-center rounded-6 border-4 border-solid border-greyExtralight p-2">
                <Image
                  src={`/Sectors/${categoryName}.svg`}
                  width={164}
                  height={164}
                  alt={`${categoryName} Logo`}
                />
              </div>
            )}
            <div className="flex-start flex flex-col gap-6 p-2">
              {categoryName && (
                <Text
                  variant="heading2xl"
                  className="text-primaryBlue"
                  fontWeight="bold"
                >
                  {categoryName}
                </Text>
              )}

              <Text
                variant="headingLg"
                fontWeight="regular"
                className=" leading-3 "
              >
                {categoryDescription
                  ? categoryDescription
                  : 'No Description Provided'}
              </Text>
            </div>
          </div>
        )}

        {/* Optional Header Component */}
        {headerComponent}

        <div className="mt-5 lg:mt-10">
          <div className="row mb-16 flex gap-5 ">
            <div className="hidden min-w-64 max-w-64 lg:block">
              <Filter
                options={filterOptions}
                setSelectedOptions={handleFilterChange}
                selectedOptions={queryParams.filters}
              />
            </div>

            <div className="flex w-full flex-col gap-4 px-2">
              <div className="flex flex-wrap items-center justify-between gap-5 rounded-2 py-2 lg:flex-nowrap">
                <div className="w-full md:block">
                  <SearchInput
                    label="Search"
                    name="Search"
                    className={cn(Styles.Search)}
                    placeholder={placeholder}
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
                        .filter((value) => category !== 'sort')
                        .map((value) => (
                          <Pill
                            key={`${category}-${value}`}
                            onRemove={() => handleRemoveFilter(category, value)}
                          >
                            {value}
                          </Pill>
                        ))
                  )}
                </div>
              )}

              {facets === null ? (
                <Loading />
              ) : facets.results.length > 0 ? (
                <GraphqlPagination
                  totalRows={count}
                  pageSize={queryParams.pageSize}
                  currentPage={queryParams.currentPage}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  view={view}
                >
                  {datasetDetails.map((item: any) => {
                    const image = item.is_individual_dataset
                      ? item?.user?.profile_picture
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.user.profile_picture}`
                        : '/profile.png'
                      : item?.organization?.logo
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.organization.logo}`
                        : '/org.png';
                    const Geography = item.metadata.filter(
                      (item: any) => item.metadata_item.label === 'Geography'
                    )[0]?.value;

                    const MetadataContent = [
                      {
                        icon: Icons.calendar,
                        label: 'Date',
                        value: formatDate(item.modified),
                        tooltip: 'Date',
                      },
                    ];

                    if (item.download_count > 0) {
                      MetadataContent.push({
                        icon: Icons.download,
                        label: 'Download',
                        value: item.download_count?.toString() || '0',
                        tooltip: 'Download',
                      });
                    }

                    if (Geography) {
                      MetadataContent.push({
                        icon: Icons.globe,
                        label: 'Geography',
                        value: Geography,
                        tooltip: 'Geography',
                      });
                    }

                    if (item.has_charts && view === 'expanded') {
                      MetadataContent.push({
                        icon: Icons.chart,
                        label: '',
                        value: 'With Charts',
                        tooltip: 'Charts',
                      });
                    }

                    const FooterContent = [
                      {
                        icon: `/Sectors/${item.sectors?.[0]}.svg`,
                        label: 'Sectors',
                        tooltip: `${item.sectors?.[0]}`,
                      },
                      ...(item.has_charts && view !== 'expanded'
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
                        tooltip: `${item.is_individual_dataset ? item.user?.name : item.organization?.name}`,
                      },
                    ];

                    const commonProps = {
                      title: item.title,
                      description: stripMarkdown(item.description || ''),
                      metadataContent: MetadataContent,
                      tag: item.tags,
                      formats: item.formats,
                      footerContent: FooterContent,
                      imageUrl: '',
                    };

                    if (item.logo) {
                      commonProps.imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.logo}`;
                    }

                    return (
                      <Card
                        {...commonProps}
                        key={item.id}
                        variation={
                          view === 'expanded' ? 'expanded' : 'collapsed'
                        }
                        iconColor="warning"
                        href={`${redirectionURL}/${item.id}`}
                      />
                    );
                  })}
                </GraphqlPagination>
              ) : (
                <div className="flex h-screen items-center justify-center">
                  <Text variant="heading2xl">No datasets found</Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingComponent;
