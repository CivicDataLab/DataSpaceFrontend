import { Text } from 'opub-ui';

import { TABLE_PREVIEW_HEIGHT } from '@/components/file-preview';

interface EditProps {
  previewData: {
    columns: string[];
    rows: unknown[][];
  };
  /**
   * Public preview only. Schema fields for these columns.
   * Each header then shows its datatype. Omit this on the creation preview.
   */
  fields?: Array<{ name: string; format: string }>;
  /** Public preview only. Leaves out the creation-flow heading and footer. */
  tableOnly?: boolean;
}

const PreviewData = ({ previewData, fields, tableOnly = false }: EditProps) => {
  const columns = previewData.columns ?? [];
  const rows = previewData.rows ?? [];
  const showTypes = fields !== undefined;

  return (
    <div>
      {tableOnly ? null : (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <Text variant="bodyMd" fontWeight="semibold">
            Tabular data — first {rows.length} rows
          </Text>
          <Text variant="bodySm" color="subdued">
            Showing {columns.length} columns
          </Text>
        </div>
      )}
      <div
        className={
          tableOnly
            ? 'w-full min-w-0 max-w-full overflow-auto rounded-2 border-1 border-solid border-baseGraySlateSolid6'
            : 'overflow-auto rounded-2 border-1 border-solid border-baseGraySlateSolid6'
        }
        style={{ height: TABLE_PREVIEW_HEIGHT }}
      >
        <table className="w-full min-w-[720px] border-collapse">
          <caption className="sr-only">
            Read-only preview of the uploaded file
          </caption>
          <thead>
            <tr className="border-b-1 border-solid border-baseGraySlateSolid6 bg-baseGraySlateSolid2 text-left">
              {columns.map((column, index) => {
                const name = showTypes
                  ? columnTitle(column, fields, index)
                  : column;
                const kind = showTypes
                  ? columnKindLabel(column, fields, index, rows)
                  : null;
                return (
                  <th
                    key={`${column}-${index}`}
                    scope="col"
                    className="whitespace-nowrap px-3 py-1.5 text-75 font-medium uppercase leading-4 tracking-wide text-textSubdued"
                  >
                    {name}
                    {kind ? (
                      <span className="mt-1 block font-primary text-75 font-regular normal-case leading-1 tracking-[0px] text-[#6b6b6b]">
                        {kind}
                      </span>
                    ) : null}
                  </th>
                );
              })}
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
      {tableOnly ? null : (
        <Text variant="bodySm" color="subdued" className="mt-2.5">
          Read-only preview. Representative rows shown to verify structure and
          content.
        </Text>
      )}
    </div>
  );
};

export default PreviewData;

function columnTitle(
  column: string,
  fields: Array<{ name: string; format: string }>,
  index: number
): string {
  const field = fieldFor(column, fields, index);
  return field?.name || column;
}

/** Schema format when it is known, otherwise a type read from the preview cells. */
function columnKindLabel(
  column: string,
  fields: Array<{ name: string; format: string }>,
  index: number,
  rows: unknown[][]
): 'string' | 'integer' | 'number' | 'boolean' | 'date' {
  const format = fieldFor(column, fields, index)?.format ?? null;
  const values = rows
    .map((row) => cellText(row?.[index]).trim())
    .filter(Boolean);
  return columnKind(format, values);
}

function fieldFor(
  column: string,
  fields: Array<{ name: string; format: string }>,
  index: number
): { name: string; format: string } | null {
  const byIndex = fields[index];
  if (byIndex && namesAlign(byIndex.name, column)) return byIndex;
  return (
    fields.find((field) => field.name === column) ??
    fields.find((field) => field.name.toLowerCase() === column.toLowerCase()) ??
    null
  );
}

function namesAlign(full: string, preview: string): boolean {
  const left = full.trim();
  const right = preview.trim();
  if (!left || !right) return false;
  return left === right || left.startsWith(right) || right.startsWith(left);
}

function columnKind(
  format: string | null,
  values: string[]
): 'string' | 'integer' | 'number' | 'boolean' | 'date' {
  const known = format?.trim().toUpperCase();
  if (known === 'INTEGER') return 'integer';
  if (known === 'NUMBER') return 'number';
  if (known === 'BOOLEAN') return 'boolean';
  if (known === 'DATE') return 'date';
  if (!values.length) return 'string';
  if (values.every(isBooleanText)) return 'boolean';
  if (values.every((value) => parseNumber(value) !== null)) {
    return values.every((value) => Number.isInteger(parseNumber(value)))
      ? 'integer'
      : 'number';
  }
  if (values.every((value) => parseDate(value) !== null)) return 'date';
  return 'string';
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

function parseNumber(value: string): number | null {
  const cleaned = value.replace(/,/g, '').trim();
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function isBooleanText(value: string): boolean {
  return /^(true|false|yes|no|y|n|0|1)$/i.test(value.trim());
}

function parseDate(value: string): number | null {
  const trimmed = value.trim();
  const dayFirst = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  const parsed = dayFirst
    ? Date.UTC(
        Number(dayFirst[3]),
        Number(dayFirst[2]) - 1,
        Number(dayFirst[1])
      )
    : Date.parse(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
