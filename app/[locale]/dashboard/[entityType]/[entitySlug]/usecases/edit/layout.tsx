'use client';

import React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Tab, TabList, Tabs } from 'opub-ui';

interface LayoutProps {
  children?: React.ReactNode;
}
const EditUseCase = ({ children }: LayoutProps) => {
  const router = useRouter();
  const pathName = usePathname();
  const params = useParams();


  const layoutList = ['details', 'assign', 'publish','metadata'];

  const pathItem = layoutList.find(function (v) {
    return pathName.indexOf(v) >= 0;
  });

  const links = [
    {
      label: 'Details',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/details`,
      selected: pathItem === 'details',
    },
    {
      label: 'Metadata',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/metadata`,
      selected: pathItem === 'metadata',
    },
    {
      label: 'Assign',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/assign`,
      selected: pathItem === 'assign',
    },
    {
      label: 'Publish',
      url: `/dashboard/${params.entityType}/${params.entitySlug}/usecases/edit/${params.id}/publish`,
      selected: pathItem === 'publish',
    },
  ];

  const handleTabClick = (url: string) => {
    router.replace(url); // Navigate to the selected tab
  };

  const initialTabLabel =
    links.find((option) => option.selected)?.label || 'Details';
  return (
    <div className="mt-8 flex h-full flex-col">
      {' '}
      <Tabs defaultValue={initialTabLabel}>
        <TabList fitted>
          {links.map((item, index) => (
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
      <div className="bg-surface border-l-divider rounded-tl-none  my-6  flex-grow">
        {children}
      </div>
    </div>
  );
};

export default EditUseCase;
