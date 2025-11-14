import React from 'react';

import { EditLayout } from './components/EditLayout';
import { DatasetEditStatusProvider } from './context';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function Layout({
  children,
  params,
}: DashboardLayoutProps) {
  const resolvedParams = await params;
  return (
    <DatasetEditStatusProvider>
      <EditLayout params={resolvedParams}>{children}</EditLayout>
    </DatasetEditStatusProvider>
  );
}
