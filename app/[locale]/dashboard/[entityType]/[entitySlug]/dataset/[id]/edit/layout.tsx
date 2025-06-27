import React from 'react';

import { EditLayout } from './components/EditLayout';
import { DatasetEditStatusProvider } from './context';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  params: { id: string };
}

export default async function Layout({
  children,
  params,
}: DashboardLayoutProps) {
  return (
    <DatasetEditStatusProvider>
      <EditLayout params={params}>{children}</EditLayout>
    </DatasetEditStatusProvider>
  );
}
