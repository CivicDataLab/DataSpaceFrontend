'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname,useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Button, Divider, Icon, SkeletonDisplayText, Tab, TabList, Tabs, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

// const datasetQueryDoc = graphql(`
//   query datasetQueryLayout($dataset_id: Int) {
//     dataset(dataset_id: $dataset_id) {
//       id
//       title
//     }
//   }
// `);

interface LayoutProps {
  children?: React.ReactNode;
  params: { id: string };
}

const layoutList = ['metadata', 'access', 'distribution', 'review', 'publish'];

export function EditLayout({ children, params }: LayoutProps) {
  // const { data } = useQuery([`dataset_layout_${params.id}`], () =>
  //   GraphQL(datasetQueryDoc, { dataset_id: Number(params.id) })
  // );

  const pathName = usePathname();
  const routerParams = useParams();

  const orgParams = useParams<{ organizationId: string }>();

  const pathItem = layoutList.find(function (v) {
    return pathName.indexOf(v) >= 0;
  });

  // if not from the layoutList, return children
  if (!pathItem) {
    return <>{children}</>;
  }

  const DATASET_INFO = {
    title: 'Untitled',
    timestamp: '20 March 2023 - 10:30AM',
  };

  return (
    <div className="mt-8 flex h-full flex-col">
      <Header dataset={DATASET_INFO} orgId={orgParams.organizationId} />
      <div className="lg:flex-column mt-4 flex flex-col">
        <div>
          <Navigation
            id={params.id}
            pathItem={pathItem}
            organization={routerParams.organizationId.toString()}
          />
        </div>
        <div className="bg-surface shadow-card border-l-divider rounded-tl-none max-w-[1280px] flex-grow py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

const Header = ({ dataset, orgId }: any) => {
  return (
    <>
      <div className="mb-3 flex justify-between">
        <div className="flex items-center gap-4">
          <Text variant="headingSm" color="subdued">
            DATASET NAME :
            <b>
              {dataset.title} - {dataset.timestamp}
            </b>
          </Text>
          <Text
            variant="headingSm"
            className="flex items-center"
            color="interactive"
          >
            <Icon source={Icons.pencil} size={16} color="interactive" />
            edit
          </Text>
        </div>
        <Link href={`/dashboard/organization/${orgId}/dataset`}>
          <Text className="flex gap-1" color="interactive">
            Go back to Drafts{' '}
            <Icon source={Icons.cross} size={20} color="interactive" />
          </Text>
        </Link>
      </div>
      <Divider />
    </>
  );
};

const Navigation = ({
  id,
  pathItem,
  organization,
}: {
  id: string;
  pathItem: string;
  organization: string;
}) => {
  const links = [
    {
      label: 'Distributions',
      url: `/dashboard/organization/${organization}/dataset/${id}/edit/distribution`,
      selected: pathItem === 'distribution',
    },
    {
      label: 'Access Models',
      url: `/dashboard/organization/${organization}/dataset/${id}/edit/access`,
      selected: pathItem === 'access',
    },
    {
      label: 'Metadata',
      url: `/dashboard/organization/${organization}/dataset/${id}/edit/metadata`,
      selected: pathItem === 'metadata',
    },
    {
      label: 'Review',
      url: `/dashboard/organization/${organization}/dataset/${id}/edit/review`,
      disabled: true,
      selected: pathItem === 'review',
    },
  ];

  const router = useRouter();

  const handleTabClick = (url: string) => {
    router.replace(url);
  };

  const initialTabLabel =
    links.find((option) => option.selected)?.label ||
    'Distributions';

  return (
    <div>
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
  </div>
  );
};
