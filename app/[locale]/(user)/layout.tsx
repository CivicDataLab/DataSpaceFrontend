'use client';

import React from 'react';
import { notFound, usePathname } from 'next/navigation';

import { MainNav } from '../dashboard/components/main-nav';

interface UserLayoutProps {
  children?: React.ReactNode;
}

export default async function Layout({ children }: UserLayoutProps) {
  const user = true; // await getCurrentUser()

  if (!user) {
    return notFound();
  }

  return (
    <div className="flex h-full grow flex-col">
      <header className="relative z-2 bg-surfaceDefault px-4 py-3 shadow-elementTopNav">
        <MainNav />
      </header>
      <>{children}</>
    </div>
  );
}
