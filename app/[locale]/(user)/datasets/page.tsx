'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDatasets } from '@/fetch';
import { Button, Pill, SearchInput, Select, Text, Tray } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import DatasetCards from './components/DatasetCards';
import Filter from './components/FIlter/Filter';
import { data } from './data';

const DatasetsListing = () => {
  const [open, setOpen] = useState(false);
  const [facets, setFacets] = useState<any>([]);
  const [variables, setVariables] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});

  const count = facets?.hits?.total?.value;
  const datasetDetails = facets?.hits?.hits;
  const options = facets?.aggregations;

  const [queryParams, setQueryParams] = useState({
    pageSize: 5,
    currentPage: 1,
    paramNames: {
      pageSize: 'size',
      currentPage: 'from',
    },
  });

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sizeParam = urlParams.get(queryParams.paramNames.pageSize);
      const fromParam = urlParams.get(queryParams.paramNames.currentPage);

      if (sizeParam && fromParam) {
        setQueryParams({
          ...queryParams,
          pageSize: Number(sizeParam),
          currentPage: Number(fromParam),
        });
      }
    }
  }, [queryParams.paramNames]);

  useEffect(() => {
    const queryParamsArray = Object.entries(selectedOptions).reduce(
      (acc, [key, value]) => {
        const encodedValues = value
          .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
          .join('&');
        acc.push(encodedValues);
        return acc;
      },
      [] as string[]
    );

    const queryParamsString = queryParamsArray.join('&');
    const variablesString = `?q=&${queryParamsString}&${queryParams.paramNames.pageSize}=${queryParams.pageSize}&${queryParams.paramNames.currentPage}=${(queryParams.currentPage - 1) * queryParams.pageSize}`;

    setVariables(variablesString);

    // Update URL with selected filter options, pageSize, and currentPage
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('fq', queryParamsString);
    currentUrl.searchParams.set(
      queryParams.paramNames.pageSize,
      queryParams.pageSize.toString()
    );
    currentUrl.searchParams.set(
      queryParams.paramNames.currentPage,
      ((queryParams.currentPage - 1) * queryParams.pageSize).toString()
    );
    router.push(currentUrl.toString());
  }, [selectedOptions, queryParams]);

  useEffect(() => {
    fetchDatasets(variables)
      .then((res) => {
        setFacets(res);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [variables]);

  const handlePageChange = (newPage: number) => {
    setQueryParams({ ...queryParams, currentPage: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    setQueryParams({ ...queryParams, pageSize: newSize, currentPage: 1 });
  };

  const handlePillRemove = (category: string, value: string) => {
    setSelectedOptions((prevSelectedOptions) => {
      const updatedOptions = { ...prevSelectedOptions };
      const updatedValues = updatedOptions[category].filter(
        (item) => item !== value
      );
      updatedOptions[category] = updatedValues;
      return updatedOptions;
    });
  };

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
              options={options}
              setSelectedOptions={setSelectedOptions}
              selectedOptions={selectedOptions}
            />
          </Tray>
        </div>
        <div className="row flex gap-5">
          <div className="hidden min-w-64 max-w-64 lg:block">
            <Filter
              options={options}
              setSelectedOptions={setSelectedOptions}
              selectedOptions={selectedOptions}
            />
          </div>
          <div className="flex w-full flex-col px-2">
            <div className="flex gap-2 border-b-2 border-solid border-baseGraySlateSolid4 pb-4">
              {Object.entries(selectedOptions).map(([category, values]) =>
                values.map((value) => (
                  <Pill
                    key={`${category}-${value}`}
                    onRemove={() => handlePillRemove(category, value)}
                  >
                    {value}
                  </Pill>
                ))
              )}
            </div>
            <div className="mb-16 flex flex-col gap-6">
              {/* Render dataset cards */}
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
