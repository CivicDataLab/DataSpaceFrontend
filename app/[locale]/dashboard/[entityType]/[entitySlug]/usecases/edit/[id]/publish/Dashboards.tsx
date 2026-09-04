import { Table, Text } from 'opub-ui';

interface DashboardItem {
  name: string;
  link: string;
}

interface DashboardsProps {
  data: DashboardItem[] | null | undefined;
}

const Dashboards = ({ data }: DashboardsProps) => {
  const dashboardColumns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'link', header: 'Link' },
  ];

  const generatePublisherData = (list: DashboardItem[] | null | undefined) => {
    return list?.map((item) => {
      return {
        name: item.name,
        link: item.link,
      };
    });
  };
  return (
    <div>
      {data && data.length > 0 ? (
        <Table
          columns={dashboardColumns}
          rows={generatePublisherData(data) ?? []}
          hideFooter
        />
      ) : (
        <Text variant="bodyMd">No Dashboards Found</Text>
      )}
    </div>
  );
};
export default Dashboards;
