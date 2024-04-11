import React from 'react';
import Link from 'next/link';
import { Text } from 'opub-ui';

import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';

export function DashboardHeader({ currentPath }: { currentPath: string }) {
  const userDashboardOptions = [
    {
      label: 'My Datasets',
      url: `/dashboard/user/datasets`,
      selected: currentPath.indexOf('user') >= 0,
    },
    {
      label: 'My Organizations',
      url: `/dashboard/organization`,
      selected: currentPath.indexOf('organization') >= 0,
    },
  ];

  return (
    <>
      <div className="bg-baseGraySlateAlpha2 px-5 py-3">
        <BreadCrumbs
          data={[
            { href: '/', label: 'Home' },
            {
              href: '/dashboard/user/datasets',
              label: 'User Dashboard',
            },
            {
              href: '#',
              label: currentPath.includes('organization')
                ? 'My Organizations'
                : 'My Personal Datasets',
            },
          ]}
        />
      </div>
      <div className="flex flex-col gap-4 px-5 py-4">
        <Text variant="headingLg" as="h1" className="px-1">
          User Dashboard
        </Text>
        <ul className="flex max-w-[90vw] gap-2 overflow-x-auto lg:max-w-[10vw] lg:overflow-x-visible">
          {userDashboardOptions.map((dashboardOpt) => (
            <li
              className={cn(
                'cursor-no-drop text-textDisabled hover:text-textDisabled focus:text-textDisabled'
              )}
              key={dashboardOpt.url}
            >
              <Link
                className={cn(
                  'relative block w-full rounded-l-05 p-3 text-center text-textSubdued lg:min-w-[15rem]',
                  // 'lg:text-start',
                  'hover:text-textDefault focus:text-textDefault',
                  dashboardOpt.selected &&
                    'pointer-events-none bg-surfaceDefault text-textDefault shadow-insetButton'
                )}
                href={dashboardOpt.url}
              >
                {dashboardOpt.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
