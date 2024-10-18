'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { SidebarNavItem } from '@/types';

import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';

import styles from '../dashboard/components/styles.module.scss';
import { MobileDashboardNav } from '../dashboard/components/mobile-dashboard-nav';
import { DashboardNav } from '../dashboard/components/dashboard-nav';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function OrgDashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpened, setIsOpened] = React.useState(false);

  const params = useParams<{ organizationId: string }>();

  const orgSidebarNav: Array<SidebarNavItem> = [
    {
      title: 'Use Cases',
      href: `/manage/usecases`,
      icon: 'datasetEdit',
    },
   
  ];

  const organizationId = params.organizationId;

  return (
    <>
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
