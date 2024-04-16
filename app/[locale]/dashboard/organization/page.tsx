'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Icon, IconButton, Text } from 'opub-ui';

import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/Link';
import { DashboardHeader } from '../components/dashboard-header';
import styles from './../components/styles.module.scss';

const Page = () => {
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
          <div className="flex flex-wrap  gap-24">
            {organizationsList.map((orgItem) => (
              <Link
                href={`/dashboard/organization/${orgItem.slug}/dataset`}
                id={orgItem.slug}
                className="flex h-60 w-48 flex-col items-center  gap-3 border-2 border-solid border-baseGraySlateSolid4 p-5 text-center"
                key={orgItem.slug}
              >
                <div className="border-var(--border-radius-5) h-36 w-36 rounded-3 bg-baseAmberSolid7 opacity-50">
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
                <Text variant="headingMd">{orgItem.title}</Text>
                {/* <LinkButton
                  href={`/dashboard/organization/${orgItem.slug}/dataset`}
                >
                  Manage Datasets
                </LinkButton>
                <LinkButton
                  href={`/dashboard/organization/${orgItem.slug}/consumers`}
                >
                  Manage Consumers
                </LinkButton> */}
              </Link>
            ))}
            <div className="flex h-60 w-48 flex-col items-center justify-center gap-3 rounded-2 bg-baseGraySlateSolid6 p-4">
              <Icon source={Icons.plus} size={40} color="success" />
              <Text alignment="center" variant="headingMd">
                Add New Organization
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
