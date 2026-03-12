'use client';

import React from 'react';

import MainFooter from './components/main-footer';
import { MainNav } from './components/main-nav';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-1 bg-primaryBlue">
        <MainNav />
      </header>
      <main className="grow">{children}</main>
      <footer>
        <MainFooter />
      </footer>
    </div>
  );
}
