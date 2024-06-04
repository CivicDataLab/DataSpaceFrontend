'use client';

import React from 'react';
import { useParams } from 'next/navigation';
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

  const params = useParams<{ organizationId: string }>();

  const orgSidebarNav: Array<SidebarNavItem> = [
    {
      title: 'Datasets',
      href: `/dashboard/organization/${params.organizationId}/dataset`,
      icon: 'datasetEdit',
    },
    {
      title: 'Manage Consumers',
      href: `/dashboard/organization/${params.organizationId}/consumers`,
      icon: 'userList',
    },
  ];

  const organizationId = params.organizationId;

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
            label: `${params.organizationId}`,
          },
        ]}
      />
      <div
        className={cn(
          'relative flex flex-col md:flex-row',
          ' bg-surfaceDefault p-4 md:flex'
        )}
      >
        <DashboardNav items={orgSidebarNav} organizationId={organizationId} />

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
