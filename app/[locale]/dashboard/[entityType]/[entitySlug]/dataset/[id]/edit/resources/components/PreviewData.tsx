import { DataTable } from 'opub-ui';

interface EditProps {
  isPreview: boolean;
  previewData: {
    columns: string[];
    rows: any[];
  };
}

const PreviewData = ({ isPreview, previewData }: EditProps) => {
  const previewColumns =
    previewData?.columns?.map((column: string) => ({
      accessorKey: column,
      header: column,
      cell: ({ cell }: any) => {
        const value = cell.getValue();
        return <span>{value !== null ? value.toString() : 'N/A'}</span>;
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
    <div className="md:max-w-[75vh] lg:max-w-[96vh]">
      <DataTable
        columns={previewColumns}
        hideFooter
        hideSelection
        rows={previewRows}
      />
    </div>
  );
};

export default PreviewData;
