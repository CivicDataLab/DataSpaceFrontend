'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from 'opub-ui';

import Footer from './footer';

const Table = () => {
  const [rowData, setRowData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://dev.backend.idp.civicdatalab.in/facets/?q=&size=${pageSize}&from=${(currentPage - 1) * pageSize}`
        );
        const data = await response.json();
        setRowData(data.hits.hits);
        setTotalRows(data.hits.total.value);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [pageSize, currentPage]);

  console.log(rowData, pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
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
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default Table;
