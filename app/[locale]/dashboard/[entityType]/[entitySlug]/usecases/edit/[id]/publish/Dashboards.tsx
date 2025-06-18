import { Table } from 'opub-ui';


const Dashboards = ({ data }: { data: any }) => {
  const dashboardColumns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'link', header: 'Link' },
  ];

  const generatePublisherData = (list: Array<any>) => {
    return list?.map((item) => {
      return {
        name: item.name,
        link: item.link,
      };
    });
  };
  return (
    <div>
      <Table
        columns={dashboardColumns}
        rows={generatePublisherData(data)}
        hideFooter
      />
    </div>
  );
};
export default Dashboards;
