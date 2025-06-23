import { Table } from 'opub-ui';

import { formatDate } from '@/lib/utils';

const Assign = ({ data }: { data: any }) => {
  const columns = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'sector', header: 'Sector' },
    { accessorKey: 'modified', header: 'Last Modified' },
  ];

  const generateTableData = (list: Array<any>) => {
    return list?.map((item) => {
      return {
        title: item.title,
        id: item.id,
        sector: item.sectors[0]?.name,
        modified: formatDate(item.modified),
      };
    });
  };
  return (
    <div>
      <Table
        columns={columns}
        rows={generateTableData(data)}
        hideFooter={data.length < 10}
      />
    </div>
  );
};
export default Assign;
