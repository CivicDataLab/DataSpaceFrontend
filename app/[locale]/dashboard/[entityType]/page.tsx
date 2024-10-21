'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Icon, Text } from 'opub-ui';

import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { DashboardHeader } from '../components/dashboard-header';
import styles from './../components/styles.module.scss';

const Page = () => {
  const pathname = usePathname();

  const params = useParams();

  const dataspacesList = [
    {
      title: 'Open Budgets India',
      slug: 'open-budgets-india',
    },
    {
      title: 'Open Contracting India',
      slug: 'open-contracting-india',
    },
  ];

  const organizationsList = [
    {
      title: 'CBGA',
      slug: 'cbga-india',
    },
    {
      title: 'Assam Finance Department',
      slug: 'assam-finance-dept',
    },
  ];

  return (
    <div className=" bg-surfaceDefault">
      <div>
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
                : pathname.includes('dataspace')
                  ? 'My Data Spaces'
                  : 'My Personal Datasets',
            },
          ]}
        />
      </div>
      <div className="m-auto flex w-11/12 flex-col">
        <DashboardHeader currentPath={pathname} />
        <div className={cn(styles.Main)}>
          <div className="flex flex-wrap  gap-24">
            {[
              ...(params.entityType === 'organization'
                ? organizationsList
                : dataspacesList),
            ].map((orgItem) => (
              <div
                key={orgItem.slug}
                className="flex  max-w-64 flex-col items-center gap-3 rounded-2 border-2 border-solid border-baseGraySlateSolid4 px-4 py-5 text-center"
              >
                <Link
                  href={`/dashboard/${params.entityType}/${orgItem.slug}/dataset`}
                  id={orgItem.slug}
                >
                  <div className="border-var(--border-radius-5)  rounded-2 ">
                    <Image
                      src={'/obi.jpg'}
                      width={200}
                      height={200}
                      alt={'Organization Logo'}
                    />
                  </div>

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
                <div>
                  <Text variant="headingMd">{orgItem.title}</Text>
                </div>
              </div>
            ))}
            <div className="flex h-72 w-56 flex-col items-center justify-center gap-3 rounded-2 bg-baseGraySlateSolid6 p-4">
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
