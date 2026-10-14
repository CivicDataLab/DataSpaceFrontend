import { EditLayout } from '../components/EditLayout';
import { CollaborativeEditStatusProvider } from '../context';

interface LayoutProps {
  children?: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const resolvedParams = await params;
  return (
    <CollaborativeEditStatusProvider>
      <EditLayout params={resolvedParams}>{children}</EditLayout>
    </CollaborativeEditStatusProvider>
  );
}
