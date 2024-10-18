import { Tab, TabList, Tabs } from 'opub-ui';

export const Navigation = ({
  setNavigationTab,
  options,
}: {
  setNavigationTab: (url: string) => void;
  options: Array<{
    label: string;
    url: string;
    selected: boolean;
  }>;
}) => {
  const handleTabClick = (url: string) => {
    setNavigationTab(url);
  };

  return (
    <div>
      <Tabs defaultValue="drafts">
        <TabList fitted>
          {options.map((item, index) => (
            <Tab
              value={item.url}
              key={index}
              onClick={() => handleTabClick(item.url)}
            >
              {item.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </div>
  );
};
