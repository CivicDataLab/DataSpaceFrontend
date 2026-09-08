import { DataTable } from 'opub-ui';

interface PreviewCell {
  getValue: () => unknown;
}

interface EditProps {
  previewData: {
    columns: string[];
    rows: unknown[][];
  };
}

const PreviewData = ({ previewData }: EditProps) => {
  const previewColumns =
    previewData?.columns?.map((column: string) => ({
      accessorKey: column,
      header: column,
      cell: ({ cell }: { cell: PreviewCell }) => {
        const value = cell.getValue();
        return <span>{value !== null ? String(value) : 'N/A'}</span>;
      },
    })) || [];

  const previewRows =
    previewData?.rows?.map((row: unknown[]) => {
      const rowData: Record<string, unknown> = {};
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
