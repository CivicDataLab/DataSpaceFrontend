import React from 'react';
import { DataTable, Text } from 'opub-ui';

import Footer from './footer';

interface GraphqlTableProps {
  table: {
    columns: any[];
    rows: any[];
  };
  totalRows: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

const GraphqlTable: React.FC<GraphqlTableProps> = ({
  table,
  totalRows,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div>
      <DataTable
        columns={table.columns}
        rows={table.rows}
        hideFooter={true}
        hideSelection={true}
        defaultRowCount={100}
      />
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

export default GraphqlTable;
