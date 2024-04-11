/* eslint-disable @next/next/no-async-client-component */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import GraphqlTable from '../../components/GraphqlTable/graphqlTable';

export default async function Page() {
  const [rowData, setRowData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState({
    pageSize: 10,
    currentPage: 1,
    paramNames: {
      pageSize: 'size',
      currentPage: 'from',
    },
  });
  const router = useRouter();

  useEffect(() => {
    // Parse query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const sizeParam = urlParams.get(queryParams.paramNames.pageSize);
    const fromParam = urlParams.get(queryParams.paramNames.currentPage);

    // Update queryParams state with parsed values
    if (sizeParam && fromParam) {
      setQueryParams({
        ...queryParams,
        pageSize: Number(sizeParam),
        currentPage: Number(fromParam),
      });
    }
  }, [queryParams.paramNames]);

  useEffect(() => {
    // Update URL when pageSize or currentPage change
    const queryParamsString = new URLSearchParams({
      [queryParams.paramNames.pageSize]: String(queryParams.pageSize),
      [queryParams.paramNames.currentPage]: String(queryParams.currentPage),
    }).toString();
    const newUrl = `${window.location.pathname}?${queryParamsString}`;
    router.replace(newUrl);
  }, [queryParams, router]);

  const handlePageChange = (newPage: number) => {
    setQueryParams({ ...queryParams, currentPage: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    setQueryParams({ ...queryParams, pageSize: newSize, currentPage: 1 });
  };

  const fetchData = async (pageSize: number, currentPage: number) => {
    try {
      const response = await fetch(
        `https://dev.backend.idp.civicdatalab.in/facets/?q=&${queryParams.paramNames.pageSize}=${pageSize}&${queryParams.paramNames.currentPage}=${(currentPage - 1) * pageSize}`
      );
      const data = await response.json();
      setRowData(data.hits.hits);
      setTotalRows(data.hits.total.value);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    // Fetch data when queryParams change
    fetchData(queryParams.pageSize, queryParams.currentPage);
  }, [queryParams]); // Fetch data when queryParams change

  return (
    <div>
      <GraphqlTable
        table={{
          columns: [
            {
              accessorKey: 'dataset_title',
              header: 'dataset',
            },
          ],
          rows: rowData.map((item: any) => ({
            dataset_title: item._source.dataset_title,
          })),
        }}
        totalRows={totalRows}
        pageSize={queryParams.pageSize}
        currentPage={queryParams.currentPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
