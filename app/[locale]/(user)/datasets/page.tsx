'use client';

import { fetchDatasets } from '@/fetch';
import { useRouter } from 'next/navigation';
import {
  Button,
  ButtonGroup,
  Card,
  Divider,
  Icon,
  Pill,
  SearchInput,
  Select,
  Spinner,
  Text,
  Tray,
} from 'opub-ui';
import React, { useEffect, useReducer, useState } from 'react';

import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import GraphqlPagination from '../../dashboard/components/GraphqlPagination/graphqlPagination';
import Filter from './components/FIlter/Filter';
import Styles from './dataset.module.scss';

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
}

type Action =
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_FILTERS'; payload: { category: string; values: string[] } }
  | { type: 'REMOVE_FILTER'; payload: { category: string; value: string } }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_SORT'; payload: string } // Add action to set sort
  | { type: 'INITIALIZE'; payload: QueryParams };

const initialState: QueryParams = {
  pageSize: 5,
  currentPage: 1,
  filters: {},
  query: '',
  sort: 'recent', // Default sort is set to recent
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
      pageSize: sizeParam ? Number(sizeParam) : 5,
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
    const variablesString = `?${filtersString}&size=${queryParams.pageSize}&page=${queryParams.currentPage}${searchParam}${sortParam}`;
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
    router.push(currentUrl.toString());
  }, [queryParams, setVariables, router]);
};

const DatasetsListing = () => {
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

  useUrlParams(queryParams, setQueryParams, setVariables);

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
  const pageSizeOptions = [9, 18, 36];
  console.log(datasetDetails);

  return (
    <main >
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'Dataset Listing' },
        ]}
      />
      {datasetDetails.length < 0 ? (
        <div className="flex h-96 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <section className="m-5 md:m-8 lg:m-10">
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-2 p-2 lg:flex-nowrap">
            <div className=" w-full md:block">
              <SearchInput
                label="Search"
                name="Search"
                className={cn(Styles.Search)}
                placeholder="Search for Data"
                onSubmit={(value) => handleSearch(value)}
                onClear={(value) => handleSearch(value)}
              />
            </div>
            <div className="flex flex-wrap justify-between gap-5 lg:flex-nowrap lg:justify-normal">
              <div className="flex items-center gap-2">
                <Text
                  variant="bodyLg"
                  fontWeight="semibold"
                  className="whitespace-nowrap text-primaryBlue"
                >
                  View:
                </Text>
                <ButtonGroup noWrap spacing="tight">
                  <Button
                    kind={view === 'collapsed' ? 'secondary' : 'tertiary'}
                    size="slim"
                    className=" h-fit w-fit"
                    onClick={() => setView('collapsed')}
                  >
                    <Icon source={Icons.grid} />
                  </Button>
                  <Button
                    onClick={() => setView('expanded')}
                    kind={view === 'expanded' ? 'secondary' : 'tertiary'}
                    className=" h-fit w-fit"
                    size="slim"
                  >
                    <Icon source={Icons.list} />
                  </Button>
                </ButtonGroup>
              </div>
              <div className="flex items-center gap-2">
                <Text
                  variant="bodyLg"
                  fontWeight="semibold"
                  className="whitespace-nowrap text-primaryBlue"
                >
                  Sort by:
                </Text>
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
              <div className="flex items-center gap-2">
                <Text
                  variant="bodyLg"
                  fontWeight="semibold"
                  className="whitespace-nowrap text-primaryBlue"
                >
                  Rows:
                </Text>
                <Select
                  label=""
                  labelInline
                  name="select"
                  onChange={(e) => handlePageSizeChange(+e)}
                  options={pageSizeOptions.map((value) => ({
                    value: String(value),
                    label: String(value),
                  }))}
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
        </section>
      )}
    </main>
  );
};

export default DatasetsListing;
