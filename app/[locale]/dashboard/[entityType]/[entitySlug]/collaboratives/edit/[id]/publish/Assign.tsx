import { Table } from 'opub-ui';

import { formatDate } from '@/lib/utils';

interface AssignItem {
  id: string;
  title?: string | null;
  modified?: string | null;
  sectors?: Array<{ name?: string | null } | null> | null;
}

interface AssignProps {
  data?: unknown;
}

function isAssignItem(value: unknown): value is AssignItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value
  );
}

const Assign = ({ data }: AssignProps) => {
  const columns = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'sector', header: 'Sector' },
    { accessorKey: 'modified', header: 'Last Modified' },
  ];

  const list = Array.isArray(data) ? data.filter(isAssignItem) : [];

  const generateTableData = (items: AssignItem[]) => {
    return items.map((item) => {
      return {
        title: item.title,
        id: item.id,
        sector: item.sectors?.[0]?.name,
        modified: formatDate(item.modified ?? null) || '',
      };
    });
  };
  return (
    <div>
      <Table
        columns={columns}
        rows={generateTableData(list)}
        hideFooter={list.length < 10}
      />
    </div>
  );
};
export default Assign;
