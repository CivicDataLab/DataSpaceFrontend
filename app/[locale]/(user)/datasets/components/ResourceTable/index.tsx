import React from 'react';
import { Dialog, Table } from 'opub-ui';

interface ColumnData {
  accessorKey: string;
  header: string;
  isModalTrigger?: boolean;
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
          console.log(cellValue);
          return (
            <Dialog>
              <Dialog.Trigger>
                <button className="text-blue-500 cursor-pointer">
                  Open Dialog
                </button>
              </Dialog.Trigger>
              <Dialog.Content title="Dialog Title">
                {cellValue[0]?.count}
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
