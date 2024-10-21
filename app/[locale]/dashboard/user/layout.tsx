'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import { dashboardConfig } from '@/config/dashboard';
import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { DashboardHeader } from '../components/dashboard-header';
import { DashboardNav } from '../components/dashboard-nav';
import { MobileDashboardNav } from '../components/mobile-dashboard-nav';
import styles from './../components/styles.module.scss';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpened, setIsOpened] = React.useState(false);
  const pathname = usePathname();

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
      <div className="m-auto w-11/12">
        <DashboardHeader currentPath={pathname} />
        <div className="flex flex-col md:flex-row">
          <DashboardNav items={dashboardConfig.sidebarNav} />
          <div className="z-1 basis-2 md:hidden">
            <MobileDashboardNav
              setIsOpened={setIsOpened}
              isOpened={isOpened}
              items={dashboardConfig.sidebarNav}
            />
          </div>
          <div className={cn(styles.Main)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
