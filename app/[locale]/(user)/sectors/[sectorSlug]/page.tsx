'use client';

import { useEffect, useReducer, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import GraphqlPagination from '@/app/[locale]/dashboard/components/GraphqlPagination/graphqlPagination';
import { fetchDatasets } from '@/fetch';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonGroup,
  Card,
  Divider,
  Icon,
  Pill,
  SearchInput,
  Select,
  Text,
  Tray,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { ErrorPage } from '@/components/error';
import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import Filter from '../../datasets/components/FIlter/Filter';
import Styles from '../../datasets/dataset.module.scss';

const sectorQueryDoc: any = graphql(`
  query CategoryDetails($filters: SectorFilter) {
    sectors(filters: $filters) {
      id
      name
      description
      datasetCount
    }
  }
`);

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
  sort?: string; // Adding sort to QueryParams
  order?: string; // Adding sort to QueryParams
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

const initialState: QueryParams = {
  pageSize: 9,
  currentPage: 1,
  filters: {},
  query: '',
  sort: 'recent', // Default sort is set to recent
  order: '',
};

const queryReducer = (state: QueryParams, action: Action): QueryParams => {
  switch (action.type) {
    case 'SET_PAGE_SIZE': {
      return { ...state, pageSize: action.payload, currentPage: 1 };
    }
    case 'SET_CURRENT_PAGE': {
      return { ...state, currentPage: action.payload };
    }
    case 'SET_FILTERS': {
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.category]: action.payload.values,
        },
        currentPage: 1,
      };
    }
    case 'REMOVE_FILTER': {
      const newFilters = { ...state.filters };
      newFilters[action.payload.category] = newFilters[
        action.payload.category
      ].filter((v) => v !== action.payload.value);
      return { ...state, filters: newFilters, currentPage: 1 };
    }
    case 'SET_QUERY': {
      return { ...state, query: action.payload };
    }
    case 'SET_SORT': {
      return { ...state, sort: action.payload };
    }
    case 'SET_ORDER': {
      return { ...state, order: action.payload };
    }
    case 'INITIALIZE': {
      return { ...state, ...action.payload };
    }
    default:
      return state;
  }
};

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
    router.push(currentUrl.toString());
  }, [queryParams, setVariables, router]);
};

const SectorDetailsPage = ({ params }: { params: { categorySlug: any } }) => {
  const getCategoryDetails: {
    data: any;
    isLoading: boolean;
    isError: boolean;
  } = useQuery([`get_category_details_${params.categorySlug}`], () =>
    GraphQL(
      sectorQueryDoc,
      {
        // Entity Headers if present
      },
      { filters: { slug: params.categorySlug } }
    )
  );

  const [facets, setFacets] = useState<{
    results: any[];
    total: number;
    aggregations: Aggregations;
  } | null>(null);
  const [variables, setVariables] = useState('');
  const [open, setOpen] = useState(false);
  const count = facets?.total ?? 0;
  const datasetDetails = facets?.results ?? [];
  const [queryParams, setQueryParams] = useReducer(queryReducer, initialState);
  const [view, setView] = useState<'collapsed' | 'expanded'>('collapsed');

  useEffect(() => {
    if (variables) {
      fetchDatasets(variables)
        .then((res) => {
          setFacets(res);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [variables]);

  useUrlParams(queryParams, setQueryParams, setVariables);

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
      acc[key] = Object.entries(value).map(([bucketKey]) => ({
        label: bucketKey,
        value: bucketKey,
      }));
      return acc;
    },
    {}
  );

  return (
    <div className="bg-basePureWhite">
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '/sectors', label: 'Sectors' },
          {
            href: '#',
            label:
              getCategoryDetails.data?.sectors[0].name || params.categorySlug,
          },
        ]}
      />

      {getCategoryDetails.isError ? (
        <ErrorPage />
      ) : getCategoryDetails.isLoading ? (
        <Loading />
      ) : (
        <div className="min-h-screen">
          <div className="m-auto flex w-11/12 flex-wrap items-center gap-10 p-6 lg:items-start ">
            <div className="flex flex-col items-center justify-center rounded-2 bg-baseGraySlateSolid2 p-2">
              <Image
                src={'/obi.jpg'}
                width={164}
                height={164}
                alt={`${params.categorySlug} Logo`}
              />
            </div>
            <div className="flex-start flex flex-col gap-4 p-2">
              <Text
                variant="heading3xl"
                className=" text-primaryBlue"
                fontWeight="bold"
              >
                {getCategoryDetails.data?.sectors[0].name ||
                  params.categorySlug}
              </Text>
              <Text
                variant="headingLg"
                className=" text-primaryBlue"
                fontWeight="regular"
              >
                {getCategoryDetails.data?.sectors[0].description ||
                  'No description available.'}
              </Text>
            </div>
          </div>
          <div className="m-5 md:m-8 lg:m-10">
            <div className="flex flex-wrap items-center justify-between gap-5 rounded-2 p-2 lg:flex-nowrap">
              <div className=" w-full md:block">
                <SearchInput
                  label="Search"
                  name="Search"
                  className={cn(Styles.Search)}
                  placeholder="Start typing to search for any Dataset"
                  onSubmit={(value) => handleSearch(value)}
                  onClear={(value) => handleSearch(value)}
                />
              </div>
              <div className="flex flex-wrap justify-between gap-3 lg:flex-nowrap lg:justify-normal lg:gap-5">
                <div className="hidden lg:flex items-center gap-2">
                  <ButtonGroup noWrap spacing="tight">
                    <Button
                      kind={view === 'collapsed' ? 'secondary' : 'tertiary'}
                      className=" h-fit w-fit"
                      onClick={() => setView('collapsed')}
                    >
                      <Icon source={Icons.grid} />
                    </Button>
                    <Button
                      onClick={() => setView('expanded')}
                      kind={view === 'expanded' ? 'secondary' : 'tertiary'}
                      className=" h-fit w-fit"
                    >
                      <Icon source={Icons.list} />
                    </Button>
                  </ButtonGroup>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() =>
                      handleOrderChange(
                        queryParams.order === 'asc' ? 'desc' : 'asc'
                      )
                    }
                    kind="tertiary"
                    className="h-fit w-fit"
                    aria-label={`Sort ${queryParams.order === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    <Icon
                      source={Icons.sort}
                      className={cn(
                        queryParams.order === 'asc' && 'scale-x-[-1]'
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
                      {
                        label: 'Recent',
                        value: 'recent',
                      },
                      {
                        label: 'Alphabetical',
                        value: 'alphabetical',
                      },
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
            <div className="row mg:mt-8 mb-16 mt-5 flex gap-5 lg:mt-10">
              <div className="hidden min-w-64 max-w-64 lg:block">
                <Filter
                  options={filterOptions}
                  setSelectedOptions={handleFilterChange}
                  selectedOptions={queryParams.filters}
                />
              </div>

              <div className="flex w-full flex-col gap-4 px-2">
                {Object.values(queryParams.filters).filter(
                  (value) => Array.isArray(value) && value.length !== 0
                ).length > 1 && (
                  <>
                    <div className="flex gap-2">
                      {Object.entries(queryParams.filters).map(
                        ([category, values]) =>
                          values
                            .filter((value) => category !== 'sort')
                            .map((value) => (
                              <Pill
                                key={`${category}-${value}`}
                                onRemove={() =>
                                  handleRemoveFilter(category, value)
                                }
                              >
                                {value}
                              </Pill>
                            ))
                      )}
                    </div>
                    <Divider className=" h-1 bg-surfaceDefault" />
                  </>
                )}

                {facets && datasetDetails?.length > 0 && (
                  <GraphqlPagination
                    totalRows={count}
                    pageSize={queryParams.pageSize}
                    currentPage={queryParams.currentPage}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    view={view}
                  >
                    {datasetDetails.map((item: any, index: any) => {
                      const commonProps = {
                        title: item.title,
                        description: item.description,
                        metadataContent: [
                          {
                            icon: Icons.calendar,
                            label: 'Date',
                            value: '19 July 2024',
                          },
                          {
                            icon: Icons.download,
                            label: 'Download',
                            value: item.download_count.toString(),
                          },
                          {
                            icon: Icons.globe,
                            label: 'Geography',
                            value: 'India',
                          },
                        ],
                        tag: item.tags,
                        formats: item.formats,
                        footerContent: [
                          {
                            icon: '',
                            label: 'Sectors',
                          },
                          {
                            icon: '',
                            label: 'Published by',
                          },
                        ],
                      };

                      return (
                        <Card
                          {...commonProps}
                          key={item.id}
                          variation={
                            view === 'expanded' ? 'expanded' : 'collapsed'
                          }
                          iconColor="warning"
                          href={`/datasets/${item.id}`}
                        />
                      );
                    })}
                  </GraphqlPagination>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorDetailsPage;
