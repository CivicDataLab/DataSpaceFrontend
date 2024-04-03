'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button, IconButton } from 'opub-ui';

import { cn } from '@/lib/utils';
import { LinkButton } from '@/components/Link';
import { DashboardHeader } from '../components/dashboard-header';
import styles from './../components/styles.module.scss';

export default async function Page({ params }: { params: { id: string } }) {
  const pathname = usePathname();

  const organizationsList = [
    {
      title: 'Organization 1',
      slug: 'asjdfhasf',
    },
    {
      title: 'Organization 2',
      slug: 'asjdfhasf',
    },
  ];

  return (
    <div className="flex w-full flex-col">
      <DashboardHeader currentPath={pathname} />

      <div className={cn(styles.Main)}>
        <div className="flex flex-wrap gap-24 p-16">
          {organizationsList.map((orgItem) => (
            <div
              id={orgItem.slug}
              className="flex flex-col items-center gap-2 text-center"
            >
              {/* <Image src={`${NEXT_PUBLIC_BACKEND_URL}`} /> */}

              <div
                className="border-var(--border-radius-5) h-36 w-36 rounded-3 opacity-50"
                style={{ backgroundColor: 'var(--base-amber-solid-7)' }}
              >
                <IconButton
                  size="large"
                  icon={'userSettings'}
                  withTooltip
                  tooltipSide="right"
                  onClick={() => console.log(orgItem)}
                >
                  Organization
                </IconButton>
              </div>
              <text>{orgItem.title}</text>
              <LinkButton
                href={`/dashboard/organization/${orgItem.slug}/dataset`}
              >
                Manage Datasets
              </LinkButton>
              <LinkButton
                href={`/dashboard/organization/${orgItem.slug}/consumers`}
              >
                Manage Consumers
              </LinkButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
