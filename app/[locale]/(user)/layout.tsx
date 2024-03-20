'use client';

import React from 'react';
import { notFound, usePathname } from 'next/navigation';

import { MainNav } from '../dashboard/components/main-nav';

interface UserLayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: UserLayoutProps) {
  const user = true; // await getCurrentUser()
  const routerPath = usePathname();
  const hideSearch = routerPath === '/' || routerPath === '/datasets';

  if (!user) {
    return notFound();
  }

  return (
    <div className="flex h-full grow flex-col">
      <header
        className="relative z-2 px-4 py-3 shadow-elementTopNav"
        style={{
          backgroundColor: 'var( --background-alpha-medium)',
        }}
      >
        <MainNav hideSearch={hideSearch} />
      </header>
      <>{children}</>
    </div>
  );
}
