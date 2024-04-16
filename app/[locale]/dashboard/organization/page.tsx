'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button, IconButton } from 'opub-ui';

import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { LinkButton } from '@/components/Link';
import { DashboardHeader } from '../components/dashboard-header';
import styles from './../components/styles.module.scss';

const Page = ({ params }: { params: { id: string } }) => {
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
    <div className=" bg-surfaceDefault">
      <div className="bg-baseGraySlateAlpha1 px-5 py-3 ">
        <BreadCrumbs
          data={[
            { href: '/', label: 'Home' },
            {
              href: '/dashboard/user/datasets',
              label: 'User Dashboard',
            },
            {
              href: '#',
              label: pathname.includes('organization')
                ? 'My Organizations'
                : 'My Personal Datasets',
            },
          ]}
        />
      </div>
      <div className="m-auto flex w-11/12 flex-col">
        <DashboardHeader currentPath={pathname} />
        <div className={cn(styles.Main)}>
          <div className="flex flex-wrap gap-24 p-16">
            {organizationsList.map((orgItem) => (
              <div
                id={orgItem.slug}
                className="flex flex-col items-center gap-2 text-center"
                key={orgItem.slug}
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
    </div>
  );
};

export default Page;
