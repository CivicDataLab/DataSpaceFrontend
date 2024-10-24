'use client';

import React from 'react';
import { notFound, useParams } from 'next/navigation';
import { SidebarNavItem } from '@/types';

import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { DashboardNav } from '../../components/dashboard-nav';
import { MobileDashboardNav } from '../../components/mobile-dashboard-nav';
import styles from '../../components/styles.module.scss';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function OrgDashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpened, setIsOpened] = React.useState(false);
  const params = useParams<{ entityType: string; entitySlug: string }>();

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
            href: '',
            label: `${params.entitySlug}`,
          },
        ]}
      />
      <div
        className={cn(
          'relative flex flex-col md:flex-row',
          ' bg-surfaceDefault p-4 md:flex'
        )}
      >
        <DashboardNav items={orgSidebarNav} entitySlug={params.entitySlug} />

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
