'use client';

import { notFound, usePathname } from 'next/navigation';
import React, { useSyncExternalStore } from 'react';

import MainFooter from '../dashboard/components/main-footer';
import { MainNav } from '../dashboard/components/main-nav';
import { CollaborativeSubdomainNav } from '../dashboard/components/CollaborativeSubdomainNav';
import { isCollaborativeSubdomainHost } from '@/lib/collaborativesRouting';

interface UserLayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: UserLayoutProps) {
  const user = true; // await getCurrentUser()
  const routerPath = usePathname();
  const hideSearch = routerPath === '/' || routerPath === '/datasets';
  const isCollaborativeSubdomain = useSyncExternalStore(
    () => () => {},
    () => isCollaborativeSubdomainHost(window.location.hostname),
    () => null
  );
  const shouldHideMainNav = isCollaborativeSubdomain === true;

  if (!user) {
    return notFound();
  }

  const shouldRenderMainNav =
    isCollaborativeSubdomain !== null && !shouldHideMainNav;
  const shouldRenderCollaborativeSubdomainNav = isCollaborativeSubdomain === true;

  return (
    <div className="flex min-h-screen flex-col">
      {isCollaborativeSubdomain !== null && (
        <header className="z-1 sticky top-0 bg-primaryBlue">
          {shouldRenderMainNav ? (
            <MainNav hideSearch={hideSearch} />
          ) : shouldRenderCollaborativeSubdomainNav ? (
            <CollaborativeSubdomainNav />
          ) : null}
        </header>
      )}
      <main className="grow">{children}</main>
      <footer>
        <MainFooter />
      </footer>
    </div>
  );
}
