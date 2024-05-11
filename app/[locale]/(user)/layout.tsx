'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, usePathname } from 'next/navigation';
import { Icon, Text } from 'opub-ui';

import { Icons } from '@/components/icons';
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
      <header
        className="relative z-2 px-4 py-3 shadow-elementTopNav"
        style={{
          backgroundColor: 'var( --background-alpha-medium)',
        }}
      >
        <MainNav hideSearch={hideSearch} />
      </header>
      <>{children}</>
      <footer>
        <MainFooter />
      </footer>
    </div>
  );
}
