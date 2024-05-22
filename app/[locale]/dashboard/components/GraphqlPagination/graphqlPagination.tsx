import React from 'react';

import Footer from './footer';

interface GraphqlTableProps {
  totalRows: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  children: React.ReactNode;
}

const GraphqlPagination: React.FC<GraphqlTableProps> = ({
  totalRows,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  children,
}) => {
  return (
    <div>
      {children}
      <Footer
        totalRows={totalRows}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default GraphqlPagination;
