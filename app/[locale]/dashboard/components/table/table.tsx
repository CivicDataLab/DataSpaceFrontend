'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'opub-ui';

import Footer from './footer';

const Table = () => {
  const router = useRouter();
  const [rowData, setRowData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const defaultPageSize = 10; // Default page size
  const defaultPageNumber = 1; // Default page number
  const [queryParams, setQueryParams] = useState({
    pageSize: defaultPageSize,
    currentPage: defaultPageNumber,
    paramNames: {
      pageSize: 'size',
      currentPage: 'from',
    },
  });

  // Parse query parameters from URL
  useEffect(() => {
    const parseQueryParams = () => {
      const query = new URLSearchParams(window.location.search);
      const urlPageSize = query.get(queryParams.paramNames.pageSize);
      const urlCurrentPage = query.get(queryParams.paramNames.currentPage);
      if (urlPageSize) {
        setQueryParams((prevParams) => ({
          ...prevParams,
          pageSize: Number(urlPageSize),
        }));
      }
      if (urlCurrentPage) {
        setQueryParams((prevParams) => ({
          ...prevParams,
          currentPage: Number(urlCurrentPage),
        }));
      }
    };

    parseQueryParams();
  }, []);

  // Update URL parameters whenever queryParams change
  useEffect(() => {
    const queryParamsString = new URLSearchParams({
      [queryParams.paramNames.pageSize]: String(queryParams.pageSize),
      [queryParams.paramNames.currentPage]: String(queryParams.currentPage),
    }).toString();
    const newUrl = `${window.location.pathname}?${queryParamsString}`;
    router.replace(newUrl);
  }, [queryParams, router]);

  // Fetch data when queryParams change
  useEffect(() => {
    fetchData();
  }, [queryParams]);

  console.log(queryParams);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://dev.backend.idp.civicdatalab.in/facets/?q=&${queryParams.paramNames.pageSize}=${queryParams.pageSize}&${queryParams.paramNames.currentPage}=${(queryParams.currentPage - 1) * queryParams.pageSize}`
      );
      const data = await response.json();
      setRowData(data.hits.hits);
      setTotalRows(data.hits.total.value);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      currentPage: newPage,
    }));
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setQueryParams({
      ...queryParams,
      pageSize: newSize,
      currentPage: defaultPageNumber, // Reset current page to default when page size changes
    });
  };

  return (
    <div>
      <DataTable
        columns={[
          {
            accessorKey: 'dataset_title',
            header: 'dataset',
          },
        ]}
        rows={rowData.map((item: any, index) => ({
          dataset_title: item._source.dataset_title,
        }))}
        hideFooter={true}
        hideSelection={true}
        defaultRowCount={100}
      />
      <Footer
        totalRows={totalRows}
        pageSize={queryParams.pageSize}
        currentPage={queryParams.currentPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default Table;
