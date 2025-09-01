import React from 'react';

import { EditLayout } from './components/EditLayout';
import { DatasetEditStatusProvider } from './context';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function Layout(props: DashboardLayoutProps) {
  const params = await props.params;

  const {
    children
  } = props;

  return (
    <DatasetEditStatusProvider>
      <EditLayout params={params}>{children}</EditLayout>
    </DatasetEditStatusProvider>
  );
}
