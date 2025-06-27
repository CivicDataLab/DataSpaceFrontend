'use client';

import React from 'react';
import { SidebarNavItem } from '@/types';

import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { DashboardNav } from '../dashboard/components/dashboard-nav';
import { MobileDashboardNav } from '../dashboard/components/mobile-dashboard-nav';
import styles from '../dashboard/components/styles.module.scss';
import LoadingPage from '../dashboard/loading';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function OrgDashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpened, setIsOpened] = React.useState(false);

  const orgSidebarNav: Array<SidebarNavItem> = [
    {
      title: 'Use Cases',
      href: `/manage/usecases`,
      icon: 'datasetEdit',
    },
  ];

  return (
    <React.Suspense fallback={<LoadingPage />}>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          {
            href: '',
            label: 'Manage',
          },
        ]}
      />
      <div
        className={cn(
          'relative flex flex-col md:flex-row',
          ' bg-surfaceDefault p-4 md:flex'
        )}
      >
        <DashboardNav items={orgSidebarNav} />

        <div className="z-1 basis-2 md:hidden">
          <MobileDashboardNav
            setIsOpened={setIsOpened}
            isOpened={isOpened}
            items={orgSidebarNav}
          />
        </div>
        <div className={cn(styles.Main)}>{children}</div>
      </div>
    </React.Suspense>
  );
}
