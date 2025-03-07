'use client';

import { useEffect, useReducer, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import GraphqlPagination from '@/app/[locale]/dashboard/components/GraphqlPagination/graphqlPagination';
import { fetchDatasets } from '@/fetch';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Pill, SearchInput, Select, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';
import { ErrorPage } from '@/components/error';
import { Loading } from '@/components/loading';
import Card from '../../datasets/components/Card';
import Filter from '../../datasets/components/FIlter/Filter';

const categoryQueryDoc: any = graphql(`
  query CategoryDetails($filters: CategoryFilter) {
    categories(filters: $filters) {
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
}

type Action =
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_FILTERS'; payload: { category: string; values: string[] } }
  | { type: 'REMOVE_FILTER'; payload: { category: string; value: string } }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'INITIALIZE'; payload: QueryParams };

const initialState: QueryParams = {
  pageSize: 5,
  currentPage: 1,
  filters: {},
  query: '',
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
    const variablesString = `?${filtersString}&size=${queryParams.pageSize}&page=${queryParams.currentPage}${searchParam}`;
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

    router.push(currentUrl.toString());
  }, [queryParams, setVariables, router]);
};

const CategoryDetailsPage = ({ params }: { params: { categorySlug: any } }) => {
  const getCategoryDetails: {
    data: any;
    isLoading: boolean;
    isError: boolean;
  } = useQuery([`get_category_details_${params.categorySlug}`], () =>
    GraphQL(
      categoryQueryDoc,
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
          { href: '/categories', label: 'Categories' },
          {
            href: '#',
            label:
              getCategoryDetails.data?.categories[0].name ||
              params.categorySlug,
          },
        ]}
      />

      {getCategoryDetails.isError ? (
        <ErrorPage />
      ) : getCategoryDetails.isLoading ? (
        <Loading />
      ) : (
        <div className="min-h-screen">
          <div className="flex flex-col items-center gap-8 py-3 lg:flex-row lg:px-28 lg:py-10">
            <div className="flex flex-col items-center justify-center rounded-2 bg-baseGraySlateSolid2 p-2">
              <Image
                src={'/obi.jpg'}
                width={164}
                height={164}
                alt={`${params.categorySlug} Logo`}
              />
            </div>
            <div className="flex flex-col gap-4 p-2">
              <Text
                variant="heading3xl"
                as="h1"
                // className="text-baseIndigoAlpha4"
                fontWeight="bold"
              >
                {getCategoryDetails.data?.categories[0].name ||
                  params.categorySlug}
              </Text>
              <Text variant="bodyLg">
                {getCategoryDetails.data?.categories[0].datasetCount} Datasets
              </Text>
              <Text variant="bodyMd">
                {getCategoryDetails.data?.categories[0].description ||
                  'No description available.'}
              </Text>
            </div>
          </div>

          <div>
            <div className="mx-10 my-4 flex flex-wrap items-center justify-between gap-6 rounded-2 bg-baseBlueSolid4 px-4 py-2">
              <div>
                <Text>Showing 10 of 30 Datasets</Text>
              </div>
              <div className=" w-full max-w-[550px] md:block">
                <SearchInput
                  label="Search"
                  name="Search"
                  // className={cn(Styles.Search)}
                  placeholder="Search datasets"
                  onSubmit={(value: any) => console.log(value)}
                  onClear={(value: any) => console.log(value)}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Text
                    variant="bodyLg"
                    className="font-bold text-baseBlueSolid8"
                  >
                    Sort by:
                  </Text>
                  <Select
                    label=""
                    labelInline
                    name="select"
                    options={[
                      {
                        label: 'Newest',
                        value: 'newestUpdate',
                      },
                      {
                        label: 'Oldest',
                        value: 'oldestUpdate',
                      },
                    ]}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Text
                    variant="bodyLg"
                    className="font-bold text-baseBlueSolid8"
                  >
                    Rows:
                  </Text>
                  <Select
                    label=""
                    labelInline
                    name="select"
                    options={[
                      {
                        label: '10',
                        value: '10',
                      },
                      {
                        label: '20',
                        value: '20',
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row mx-10 mb-16 flex gap-5">
            <div className="hidden min-w-64 max-w-64 lg:block">
              <Filter
                options={filterOptions}
                setSelectedOptions={handleFilterChange}
                selectedOptions={queryParams.filters}
              />
            </div>
            <div className="flex h-full w-full flex-col px-2">
              <div className="flex gap-2 border-b-2 border-solid border-baseGraySlateSolid4 pb-4">
                {Object.entries(queryParams.filters).map(([category, values]) =>
                  values.map((value) => (
                    <Pill
                      key={`${category}-${value}`}
                      onRemove={() => handleRemoveFilter(category, value)}
                    >
                      {value}
                    </Pill>
                  ))
                )}
              </div>

              <div className="flex flex-col gap-6">
                {facets && datasetDetails?.length > 0 && (
                  <GraphqlPagination
                    totalRows={count}
                    pageSize={queryParams.pageSize}
                    currentPage={queryParams.currentPage}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  >
                    {datasetDetails.map((item: any, index: any) => (
                      <Card key={index} data={item} />
                    ))}
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

export default CategoryDetailsPage;
