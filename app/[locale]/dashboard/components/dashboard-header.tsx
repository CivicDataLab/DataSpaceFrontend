import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Text } from 'opub-ui';

import { cn } from '@/lib/utils';

export function DashboardHeader({ currentPath }: { currentPath: String }) {
  const userDashboardOptions = [
    {
      label: 'User Dashboard',
      url: `/dashboard/user`,
      selected: currentPath.indexOf('user') >= 0,
    },
    {
      label: 'My Organizations',
      url: `/dashboard/organization`,
      selected: currentPath.indexOf('organization') >= 0,
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-11 py-4">
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
  );
}
