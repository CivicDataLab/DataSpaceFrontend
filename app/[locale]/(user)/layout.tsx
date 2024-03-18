'use client';

import React from 'react';
import { notFound, usePathname } from 'next/navigation';

import { MainNav } from '@/components/main-nav';

interface UserLayoutProps {
  children?: React.ReactNode;
}

export default async function Layout({ children }: UserLayoutProps) {
  const routerPath = usePathname();
  const user = true; // await getCurrentUser()
  const regEx = new RegExp(/\/[a-z]*\/[a-z]*/);

  if (!user) {
    return notFound();
  }

  return (
    <div className="flex h-full grow flex-col">
      <header className="relative z-2 bg-surfaceDefault px-4 py-3 shadow-elementTopNav">
        <MainNav
          hideSearch={
            !regEx.test(routerPath) || routerPath.includes('/datasets')
          }
        />
      </header>
      <>{children}</>
    </div>
  );
}
