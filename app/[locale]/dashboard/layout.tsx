'use client';

import React from 'react';

import MainFooter from './components/main-footer';
import { MainNav } from './components/main-nav';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-full grow flex-col">
    <header className="relative z-2 p-6 lg:px-10 lg:py-6 bg-primaryBlue">
      <MainNav />
    </header>
    <>{children}</>
    <footer>
      <MainFooter />
    </footer>
  </div>
  );
}
