import React from 'react';
import { useRouter } from 'next/navigation';
import { Tab, TabList, Tabs, Text } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';

export function DashboardHeader({ currentPath }: { currentPath: string }) {
  const userDashboardOptions = [
    {
      label: 'My Datasets',
      url: `/dashboard/user/datasets`,
      selected: currentPath.indexOf('user') >= 0,
    },
    {
      label: 'My Organizations',
      url: `/dashboard/organization`,
      selected: currentPath.indexOf('organization') >= 0,
    },
  ];
  const router = useRouter();

  const handleTabClick = (url: string) => {
    router.replace(url);
  };

  const initialTabLabel =
    userDashboardOptions.find((option) => option.selected)?.label ||
    'My Datasets';

  return (
    <>
      <div className="bg-baseGraySlateAlpha1 px-5 py-3">
        <BreadCrumbs
          data={[
            { href: '/', label: 'Home' },
            {
              href: '/dashboard/user/datasets',
              label: 'User Dashboard',
            },
            {
              href: '#',
              label: currentPath.includes('organization')
                ? 'My Organizations'
                : 'My Personal Datasets',
            },
          ]}
        />
      </div>
      <div className="flex flex-col gap-4  px-5 py-4">
        <Text variant="headingLg" as="h1" className="px-1">
          User Dashboard
        </Text>
        <div className="mt-5">
          <Tabs defaultValue={initialTabLabel}>
            <TabList fitted>
              {userDashboardOptions.map((item, index) => (
                <Tab
                  value={item.label}
                  key={index}
                  onClick={() => handleTabClick(item.url)}
                >
                  {item.label}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </div>
      </div>
    </>
  );
}
