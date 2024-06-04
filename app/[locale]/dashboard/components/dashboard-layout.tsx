'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import { DashboardHeader } from './dashboard-header';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex w-full flex-col">
      <DashboardHeader currentPath={pathname} />

      <div className="">{children}</div>
    </div>
  );
}
