import { Tab, TabList, Tabs } from 'opub-ui';

export const Navigation = ({
  setNavigationTab,
  options,
  currentValue,
}: {
  setNavigationTab: (url: string) => void;
  options: Array<{
    label: string;
    url: string;
    selected: boolean;
  }>;
  currentValue: string;
}) => {
  const handleTabClick = (url: string) => {
    setNavigationTab(url);
  };
  const initialValue = options.find((o) => o.selected)?.url ?? options[0]?.url ?? '';
  return (
    <div>
      <Tabs defaultValue={currentValue ?? initialValue}>
        <TabList fitted border>
          {options.map((item, index) => (
            <Tab
              theme="dataSpace"
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
