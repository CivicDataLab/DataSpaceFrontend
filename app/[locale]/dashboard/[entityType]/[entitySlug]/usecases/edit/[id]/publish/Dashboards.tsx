import { Table, Text } from 'opub-ui';

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
      {data?.length > 0 ? (
        <Table
          columns={dashboardColumns}
          rows={generatePublisherData(data)}
          hideFooter
        />
      ) : (
        <Text variant="bodyMd">No Dashboards Found</Text>
      )}
    </div>
  );
};
export default Dashboards;
