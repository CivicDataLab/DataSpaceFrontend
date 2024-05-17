'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDatasets } from '@/fetch';
import { Button, Pill, SearchInput, Select, Text, Tray } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import DatasetCards from './components/DatasetCards';
import Filter from './components/FIlter/Filter';

const DatasetsListing = () => {
  const [facets, setFacets] = useState<any>({});
  const [variables, setVariables] = useState('');
  const [open, setOpen] = useState(false);
  const count = facets?.total;
  const datasetDetails = facets?.results;

  const [queryParams, setQueryParams] = useState({
    pageSize: 5,
    currentPage: 1,
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

    if (sizeParam && pageParam) {
      setQueryParams({
        ...queryParams,
        pageSize: Number(sizeParam),
        currentPage: Number(pageParam),
      });
    }
  }, []);

  useEffect(() => {
    const variablesString = `?${queryParams.paramNames.pageSize}=${queryParams.pageSize}&${queryParams.paramNames.currentPage}=${queryParams.currentPage}`;
    setVariables(variablesString);

    // Update URL with pageSize and currentPage
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set(
      queryParams.paramNames.pageSize,
      queryParams.pageSize.toString()
    );
    currentUrl.searchParams.set(
      queryParams.paramNames.currentPage,
      queryParams.currentPage.toString()
    );
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
    setQueryParams({ ...queryParams, currentPage: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    setQueryParams({ ...queryParams, pageSize: newSize, currentPage: 1 });
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
          {/* <Tray
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
              options={}
              setSelectedOptions={}
              selectedOptions={}
            />
          </Tray> */}
        </div>
        <div className="row flex gap-5">
          <div className="hidden min-w-64 max-w-64 lg:block">
            {/* <Filter
              options={}
              setSelectedOptions={}
              selectedOptions={}
            /> */}
          </div>

          <div className="flex w-full flex-col px-2">
            <div className="flex gap-2 border-b-2 border-solid border-baseGraySlateSolid4 pb-4">
              {/* <Pill
                    key={}
                    onRemove={} >
                    {}
                  </Pill> */}
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
