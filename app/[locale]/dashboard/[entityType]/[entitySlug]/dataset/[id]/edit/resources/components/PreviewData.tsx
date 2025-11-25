import { DataTable } from 'opub-ui';

interface EditProps {
  previewData: {
    columns: string[];
    rows: any[];
  };
}

const PreviewData = ({ previewData }: EditProps) => {
  const previewColumns =
    previewData?.columns?.map((column: string) => ({
      accessorKey: column,
      header: column,
      cell: ({ cell }: any) => {
        const value = cell.getValue();
        return <span>{value !== null ? value?.toString() : 'N/A'}</span>;
      },
    })) || [];

  // Transform rows data to match column structure
  const previewRows =
    previewData?.rows?.map((row: any[]) => {
      const rowData: Record<string, any> = {};
      previewData.columns.forEach((column: string, index: number) => {
        rowData[column] = row[index];
      });
      return rowData;
    }) || [];
  return (
    <DataTable
      columns={previewColumns}
      hideSelection
      hideFooter
      rows={previewRows}
    />
  );
};

export default PreviewData;
