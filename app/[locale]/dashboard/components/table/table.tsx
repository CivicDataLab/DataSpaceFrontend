'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { DataTable, Text } from 'opub-ui'; // Assuming DataTable and Footer are not necessary for this demonstration

import Footer from './footer';

const Table = () => {
  const router = useRouter(); // Initialize useRouter hook
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

  // Fetch data function
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
    const parseQueryParamsAndFetchData = async () => {
      const query = new URLSearchParams(window.location.search);
      const urlPageSize = query.get(queryParams.paramNames.pageSize);
      const urlCurrentPage = query.get(queryParams.paramNames.currentPage);

      if (urlPageSize && urlCurrentPage) {
        setQueryParams({
          ...queryParams,
          pageSize: Number(urlPageSize),
          currentPage: Number(urlCurrentPage),
        });
      }
    };

    parseQueryParamsAndFetchData();
  }, []);

  useEffect(() => {
    const queryParamsString = new URLSearchParams({
      [queryParams.paramNames.pageSize]: String(queryParams.pageSize),
      [queryParams.paramNames.currentPage]: String(queryParams.currentPage),
    }).toString();
    const newUrl = `${window.location.pathname}?${queryParamsString}`;
    router.replace(newUrl);
  }, [queryParams, router]);

  useEffect(() => {
    // Fetch data when queryParams change
    if (queryParams.pageSize && queryParams.currentPage) {
      fetchData(queryParams.pageSize, queryParams.currentPage);
    }
  }, [queryParams]); // Only fetch data when queryParams change

  const handlePageChange = (newPage: number) => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      currentPage: newPage,
    }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setQueryParams({
      ...queryParams,
      pageSize: newSize,
      currentPage: 1,
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
      {/* {rowData.map((item: any, index) => (
        <div key={index}>
          <Text>{item._source.dataset_title}</Text>
        </div>
      ))} */}
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
