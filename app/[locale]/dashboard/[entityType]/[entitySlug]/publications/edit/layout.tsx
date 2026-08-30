'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { Tab, TabList, Tabs } from 'opub-ui';

import { EditStatusProvider } from './context';

const TabsAndChildren = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathName = usePathname();
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();

  const base = `/dashboard/${params.entityType}/${params.entitySlug}/publications/edit/${params.id}`;
  const links = [
    { label: 'Metadata', url: `${base}/metadata`, key: 'metadata' },
    { label: 'Content', url: `${base}/blocks`, key: 'blocks' },
    { label: 'Publish', url: `${base}/publish`, key: 'publish' },
  ];

  const current =
    links.find((l) => pathName.indexOf(l.key) >= 0)?.label || 'Metadata';

  return (
    <div className="mt-8 flex h-full flex-col gap-6">
      <Tabs
        value={current}
        onValueChange={(newValue) =>
          router.replace(links.find((l) => l.label === newValue)?.url || '')
        }
      >
        <TabList fitted border>
          {links.map((item) => (
            <Tab
              theme="dataSpace"
              value={item.label}
              key={item.key}
              onClick={() => router.replace(item.url)}
              className="uppercase"
            >
              {item.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
      <div>{children}</div>
    </div>
  );
};

const EditPublication = ({ children }: { children: React.ReactNode }) => {
  return (
    <EditStatusProvider>
      <TabsAndChildren>{children}</TabsAndChildren>
    </EditStatusProvider>
  );
};

export default EditPublication;
