import React from 'react';

import { EditLayout } from '../components/EditLayout';
import { UseCaseEditStatusProvider } from '../context';

interface LayoutProps {
  children?: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const resolvedParams = await params;
  return (
    <UseCaseEditStatusProvider>
      <EditLayout params={resolvedParams}>{children}</EditLayout>
    </UseCaseEditStatusProvider>
  );
}
