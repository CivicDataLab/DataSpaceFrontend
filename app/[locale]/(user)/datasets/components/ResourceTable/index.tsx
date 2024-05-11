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
  [key: string]: any;
}

interface ResourceTableProps {
  ColumnsData: ColumnData[];
  RowsData: RowData[];
}

interface CellProps {
  row: RowData;
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
          const rowData = row.original as unknown as RowData;
          const accessorKey = column.accessorKey as keyof RowData;
          const cellValue = rowData[accessorKey];
          return (
            <Dialog>
              <Dialog.Trigger>
                <Button kind="tertiary">{column.label}</Button>
              </Dialog.Trigger>
              <Dialog.Content title={column.modalHeader}>
                {column?.table ? (
                  <Table
                    columns={cellValue[0]}
                    rows={cellValue[1]}
                    hideFooter={true}
                  />
                ) : (
                  cellValue
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
