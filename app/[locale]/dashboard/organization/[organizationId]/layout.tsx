'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { SidebarNavItem } from '@/types';

import { cn } from '@/lib/utils';
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

  return (
    <div
      className={cn('relative grid grow grid-cols-[8px_1fr] gap-1', 'md:flex')}
    >
      <DashboardNav items={orgSidebarNav} />

      <div className="z-1 basis-2 md:hidden">
        <MobileDashboardNav
          setIsOpened={setIsOpened}
          isOpened={isOpened}
          items={orgSidebarNav}
        />
      </div>
      <div className={cn(styles.Main, isOpened && styles.MainOpened)}>
        {children}
      </div>
    </div>
  );
}
