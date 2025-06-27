import React from 'react';

import Footer from './footer';

interface GraphqlTableProps {
  totalRows: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  children: React.ReactNode;
  view? : string
}

const GraphqlPagination: React.FC<GraphqlTableProps> = ({
  totalRows,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  children,
  view
}) => {
  return (
    <div>
      <div className={`${view === 'collapsed' ? 'grid grid-cols-1 w-full gap-4 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4'}`}>
        {children}
      </div>
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
