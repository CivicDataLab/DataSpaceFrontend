'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Icon, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { DashboardHeader } from '../components/dashboard-header';
import LoadingPage from '../loading';
import styles from './../components/styles.module.scss';
import { allDataSpacesListingDoc, allOrganizationsListingDoc } from './schema';

const Page = () => {
  const pathname = usePathname();

  const params = useParams<{ entityType: string }>();

  const allEntitiesList: {
    data: any;
    isLoading: boolean;
    error: any;
    isError: boolean;
  } = useQuery([`all_enitites_list_${params.entityType}`], () =>
    GraphQL(
      params.entityType === 'organization'
        ? allOrganizationsListingDoc
        : allDataSpacesListingDoc,
      {
        // Entity Headers if present
      },
      []
    )
  );

  if (
    process.env.NEXT_PUBLIC_DATASPACE_FEATURE_ENABLED !== 'true' &&
    params.entityType === 'dataspace'
  ) {
    return notFound();
  }

  return (
    <div className=" bg-surfaceDefault">
      <div>
        <BreadCrumbs
          data={[
            { href: '/', label: 'Home' },
            {
              href: '/dashboard/user/datasets',
              label: 'User Dashboard',
            },
            {
              href: '#',
              label: pathname.includes('organization')
                ? 'My Organizations'
                : pathname.includes('dataspace')
                  ? 'My Data Spaces'
                  : 'My Personal Datasets',
            },
          ]}
        />
      </div>
      <div className="m-auto flex w-11/12 flex-col">
        <DashboardHeader currentPath={pathname} />
        {allEntitiesList.isLoading ? (
          <LoadingPage />
        ) : (
          <div className={cn(styles.Main)}>
            <div className="flex flex-wrap  gap-24">
              {(params.entityType === 'organization'
                ? allEntitiesList.data.organizations
                : allEntitiesList.data.dataspaces
              )?.map((entityItem: any) => {
                return (
                  <div key={entityItem.name}>
                    <EntityCard entityItem={entityItem} params={params} />
                  </div>
                );
              })}
              <div className="flex h-72 w-56 flex-col items-center justify-center gap-3 rounded-2 bg-baseGraySlateSolid6 p-4">
                <Icon source={Icons.plus} size={40} color="success" />
                <Text alignment="center" variant="headingMd">
                  {`Add New ${params.entityType === 'organization' ? 'Organization' : 'Data Space'}`}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

const EntityCard = ({ entityItem, params }: any) => {
  const [isImageValid, setIsImageValid] = useState(() => {
    return entityItem?.logo ? true : false;
  });

  return (
    <div
      key={entityItem.name}
      className="flex h-72 w-56 flex-col items-center gap-3 rounded-2 border-2 border-solid border-baseGraySlateSolid4 px-4 py-5 text-center"
    >
      <div className="flex h-full w-full items-center justify-center rounded-2">
        <Link
          href={`/dashboard/${params.entityType}/${entityItem?.slug}/dataset`}
          id={entityItem.slug}
        >
          <div className="border-var(--border-radius-5) rounded-2">
            {isImageValid ? (
              <Image
                height={160}
                width={160}
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${entityItem?.logo.url}`}
                alt={`${entityItem.name} logo`}
                onError={() => {
                  setIsImageValid(false);
                }}
                className="object-contain"
              />
            ) : (
              <Image
                height={160}
                width={160}
                src={'/fallback.svg'}
                alt={`fallback logo`}
                className="fill-current object-contain text-baseGraySlateSolid6"
              />
            )}
          </div>
        </Link>
      </div>
      <div>
        <Text variant="headingMd" className="text-center">
          {entityItem.name}
        </Text>
      </div>
    </div>
  );
};
