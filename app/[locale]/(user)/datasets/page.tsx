'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDatasets } from '@/fetch';
import { Button, Pill, SearchInput, Select, Text, Tray } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import DatasetCards from './components/DatasetCards';
import Filter from './components/FIlter/Filter';

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
  paramNames: {
    pageSize: string;
    currentPage: string;
  };
}

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

  const [queryParams, setQueryParams] = useState<QueryParams>({
    pageSize: 5,
    currentPage: 1,
    filters: {},
    paramNames: {
      pageSize: 'size',
      currentPage: 'page',
    },
  });

  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sizeParam = urlParams.get(queryParams.paramNames.pageSize);
    const pageParam = urlParams.get(queryParams.paramNames.currentPage);
    const filters: FilterOptions = {};

    urlParams.forEach((value, key) => {
      if (!Object.values(queryParams.paramNames).includes(key)) {
        filters[key] = value.split(',');
      }
    });

    setQueryParams((prevParams) => ({
      ...prevParams,
      pageSize: sizeParam ? Number(sizeParam) : prevParams.pageSize,
      currentPage: pageParam ? Number(pageParam) : prevParams.currentPage,
      filters,
    }));
  }, []);
  useEffect(() => {
    const filtersString = Object.entries(queryParams.filters)
      .filter(([_, values]) => values.length > 0) // Only include non-empty filter values
      .map(([key, values]) => `${key}=${values.join(',')}`)
      .join('&');

    const variablesString = `?${filtersString}&${queryParams.paramNames.pageSize}=${queryParams.pageSize}&${queryParams.paramNames.currentPage}=${queryParams.currentPage}`;
    setVariables(variablesString);

    // Update URL with pageSize, currentPage, and filters
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set(
      queryParams.paramNames.pageSize,
      queryParams.pageSize.toString()
    );
    currentUrl.searchParams.set(
      queryParams.paramNames.currentPage,
      queryParams.currentPage.toString()
    );

    Object.entries(queryParams.filters).forEach(([key, values]) => {
      if (values.length > 0) {
        // Only set non-empty filter values in the URL
        currentUrl.searchParams.set(key, values.join(','));
      } else {
        currentUrl.searchParams.delete(key); // Remove empty filter values from the URL
      }
    });

    router.push(currentUrl.toString());
  }, [queryParams]);

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
    setQueryParams((prevParams) => ({ ...prevParams, currentPage: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      pageSize: newSize,
      currentPage: 1,
    }));
  };

  const handleFilterChange = (category: string, values: string[]) => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      filters: {
        ...prevParams.filters,
        [category]: values,
      },
      currentPage: 1, // Reset to first page when filters change
    }));
  };

  const handleRemoveFilter = (category: string, value: string) => {
    setQueryParams((prevParams) => {
      const newFilters = { ...prevParams.filters };
      newFilters[category] = newFilters[category].filter((v) => v !== value);
      return { ...prevParams, filters: newFilters, currentPage: 1 };
    });
  };

  const aggregations: Aggregations = facets?.aggregations || {};

  const filterOptions = Object.entries(aggregations).reduce(
    (acc: Record<string, { label: string; value: string }[]>, [key, value]) => {
      acc[key.replace('.raw', '')] = value.buckets.map((bucket: Bucket) => ({
        label: bucket.key,
        value: bucket.key,
      }));
      return acc;
    },
    {}
  );

  return (
    <main className="bg-surfaceDefault">
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'Dataset Listing' },
        ]}
      />
      <section className="mx-6 md:mx-8 lg:mx-10">
        <div className="my-4 flex flex-wrap items-center justify-between gap-6 rounded-2 bg-baseBlueSolid4 p-2">
          <div>
            <Text>
              Showing {datasetDetails?.length} of {count} Datasets
            </Text>
          </div>
          <div className="w-full max-w-[550px] md:block">
            <SearchInput
              label={'Search'}
              name={'Search'}
              placeholder="Search for data"
            />
          </div>
          <div className="flex items-center gap-2">
            <Text variant="bodyLg" className="font-bold text-baseBlueSolid8">
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
          <Tray
            size="narrow"
            open={open}
            onOpenChange={setOpen}
            trigger={
              <Button
                kind="secondary"
                className="lg:hidden"
                onClick={(e) => setOpen(true)}
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
        <div className="row flex gap-5">
          <div className="hidden min-w-64 max-w-64 lg:block">
            <Filter
              options={filterOptions}
              setSelectedOptions={handleFilterChange}
              selectedOptions={queryParams.filters}
            />
          </div>

          <div className="flex w-full flex-col px-2">
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

            <div className="mb-16 flex flex-col gap-6">
              {facets !== undefined && datasetDetails?.length > 0 && (
                <DatasetCards
                  data={datasetDetails}
                  totalCount={count}
                  pageSize={queryParams.pageSize}
                  currentPage={queryParams.currentPage}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DatasetsListing;
