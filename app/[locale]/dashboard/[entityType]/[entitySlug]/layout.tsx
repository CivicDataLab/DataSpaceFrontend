'use client';

import React from 'react';
import { notFound, useParams } from 'next/navigation';
import { SidebarNavItem } from '@/types';
import { useQuery } from '@tanstack/react-query';

import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { DashboardNav } from '../../components/dashboard-nav';
import { MobileDashboardNav } from '../../components/mobile-dashboard-nav';
import styles from '../../components/styles.module.scss';
import { getDataSpaceDetailsQryDoc, getOrgDetailsQryDoc } from './schema';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function OrgDashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpened, setIsOpened] = React.useState(false);
  const params = useParams<{ entityType: string; entitySlug: string }>();

  const EntityDetailsQryRes: { data: any; isLoading: boolean; error: any } =
    useQuery([`entity_details_${params.entityType}`], () =>
      GraphQL(
        params.entityType === 'organization'
          ? getOrgDetailsQryDoc
          : getDataSpaceDetailsQryDoc,
        {},
        {  slug: params.entitySlug  }
      )
    );

  if (
    process.env.NEXT_PUBLIC_DATASPACE_FEATURE_ENABLED !== 'true' &&
    params.entityType === 'dataspace'
  ) {
    return notFound();
  }

  const orgSidebarNav: Array<SidebarNavItem> = [
    {
      title: 'Datasets',
      href: `/dashboard/${params.entityType}/${params.entitySlug}/dataset`,
      icon: 'datasetEdit',
    },
    {
      title: 'Manage Consumers',
      href: `/dashboard/${params.entityType}/${params.entitySlug}/consumers`,
      icon: 'userList',
    },
    {
      title: 'UseCases',
      href: `/dashboard/${params.entityType}/${params.entitySlug}/usecases`,
      icon: 'userList',
    }
  ];

  return (
    <>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          {
            href: '/dashboard/user/datasets',
            label: 'User Dashboard',
          },
          {
            href: `/dashboard/${params.entityType}`,
            label:
              params.entityType === 'organization'
                ? 'My Organizations'
                : 'My DataSpaces',
          },
          {
            href: '',
            label:
              (params.entityType === 'organization'
                ? EntityDetailsQryRes.data?.organizations[0]
                : EntityDetailsQryRes.data?.dataspaces[0]
              )?.name || params.entitySlug,
          },
        ]}
      />
      <div
        className={cn(
          'relative flex flex-col md:flex-row',
          ' bg-surfaceDefault p-4 md:flex'
        )}
      >
        <DashboardNav
          items={orgSidebarNav}
          entityDetails={
            params.entityType === 'organization'
              ? EntityDetailsQryRes.data?.organizations[0]
              : EntityDetailsQryRes.data?.dataspaces[0]
          }
        />

        <div className="z-1 basis-2 md:hidden">
          <MobileDashboardNav
            setIsOpened={setIsOpened}
            isOpened={isOpened}
            items={orgSidebarNav}
          />
        </div>
        <div className={cn(styles.Main)}>{children}</div>
      </div>
    </>
  );
}
