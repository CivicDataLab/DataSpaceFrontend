'use client';

import { notFound, usePathname } from 'next/navigation';
import React from 'react';

import MainFooter from '../dashboard/components/main-footer';
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
      <header className="relative z-2  bg-primaryBlue ">
        <MainNav hideSearch={hideSearch} />
      </header>
      <>{children}</>
      <footer>
        <MainFooter />
      </footer>
    </div>
  );
}
