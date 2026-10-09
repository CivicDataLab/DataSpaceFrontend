import { Text } from 'opub-ui';

import { TABLE_PREVIEW_HEIGHT } from '@/components/file-preview';

interface EditProps {
  previewData: {
    columns: string[];
    rows: unknown[][];
  };
}

const PreviewData = ({ previewData }: EditProps) => {
  const columns = previewData.columns ?? [];
  const rows = previewData.rows ?? [];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <Text variant="bodyMd" fontWeight="semibold">
          Tabular data — first {rows.length} rows
        </Text>
        <Text variant="bodySm" color="subdued">
          Showing {columns.length} columns
        </Text>
      </div>
      <div
        className="overflow-auto rounded-2 border-1 border-solid border-baseGraySlateSolid6"
        style={{ height: TABLE_PREVIEW_HEIGHT }}
      >
        <table className="w-full min-w-[720px] border-collapse">
          <caption className="sr-only">
            Read-only preview of the uploaded file
          </caption>
          <thead>
            <tr className="border-b-1 border-solid border-baseGraySlateSolid6 bg-baseGraySlateSolid2 text-left">
              {columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  scope="col"
                  className="whitespace-nowrap px-3 py-1.5 text-75 font-medium uppercase leading-4 tracking-wide text-textSubdued"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b-1 border-solid border-baseGraySlateSolid6 last:border-b-0"
              >
                {columns.map((column, columnIndex) => {
                  const value = row[columnIndex];
                  return (
                    <td
                      key={`${column}-${columnIndex}`}
                      className="whitespace-nowrap px-4 py-2.5"
                    >
                      <Text variant="bodyMd">
                        {value != null && value !== '' ? String(value) : '—'}
                      </Text>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Text variant="bodySm" color="subdued" className="mt-2.5">
        Read-only preview. Representative rows shown to verify structure and
        content.
      </Text>
    </div>
  );
};

export default PreviewData;
