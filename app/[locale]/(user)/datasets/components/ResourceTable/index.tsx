import type { ReactNode } from 'react';
import React from 'react';
import { Button, Dialog, Table } from 'opub-ui';

interface ColumnData {
  accessorKey: string;
  header: string;
  isModalTrigger?: boolean;
  label?: string;
  table?: boolean;
  modalHeader?: string;
}

interface RowData {
  [key: string]: unknown;
}

interface ResourceTableProps {
  ColumnsData: ColumnData[];
  RowsData: RowData[];
}

interface CellProps {
  row: {
    original: RowData;
  };
}

const ResourceTable: React.FC<ResourceTableProps> = ({
  ColumnsData,
  RowsData,
}) => {
  const columnsWithModal = ColumnsData.map((column) => {
    if (column.isModalTrigger) {
      return {
        ...column,
        cell: ({ row }: CellProps) => {
          const rowData = row.original;
          const cellValue = rowData[column.accessorKey];
          return (
            <Dialog>
              <Dialog.Trigger>
                <Button kind="tertiary">{column.label}</Button>
              </Dialog.Trigger>
              <Dialog.Content title={column.modalHeader}>
                {column?.table && Array.isArray(cellValue) ? (
                  <Table
                    columns={Array.isArray(cellValue[0]) ? cellValue[0] : []}
                    rows={Array.isArray(cellValue[1]) ? cellValue[1] : []}
                    hideFooter={true}
                  />
                ) : (
                  (cellValue as ReactNode)
                )}
              </Dialog.Content>
            </Dialog>
          );
          return null;
        },
      };
    }
    return column;
  });

  return (
    <div>
      <Table columns={columnsWithModal} rows={RowsData} hideFooter={true} />
    </div>
  );
};

export default ResourceTable;
