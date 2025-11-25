'use client';

import Link from 'next/link';
import { Icon, Text } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import { Loading } from '@/components/loading';
import { useDashboardStore } from '@/config/store';
import { useTourTrigger } from '@/hooks/use-tour-trigger';

const UserDashboard = () => {
  // Enable tour for first-time users
  useTourTrigger(true, 1500);
  
  const { userDetails } = useDashboardStore();
  const list = [
    {
      label: 'My Dashboard',
      icon: Icons.user,
      path: `/dashboard/self/${userDetails?.me?.firstName}_${userDetails?.me?.id}/dataset`,
    },
    {
      label: 'Organizations',
      icon: Icons.userGroup,
      path: '/dashboard/organization',
    },
  ];

  return (
    <>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          {
            href: '#',
            label: 'User Dashboard',
          },
        ]}
      />

      {!userDetails?.me ? (
        <Loading />
      ) : (
        <div className="flex-1 container mb-40 ">
          <div className=" flex flex-col gap-6 py-10">
            <Text variant="headingXl"> User Dashboard</Text>
          </div>
          <div className="flex-1 ">
            <div className="flex flex-wrap items-center gap-6 md:flex-nowrap lg:flex-nowrap" data-tour="sidebar">
              {list.map((item, index) => (
                <Link
                  key={index}
                  href={item.path}
                  className=" flex max-h-56 min-h-56 w-full flex-col  items-center justify-center gap-3 rounded-4 bg-greyExtralight p-4 "
                  data-tour={index === 0 ? 'my-datasets' : undefined}
                >
                  <Icon source={item.icon} size={60} color="highlight" />
                  <Text variant="headingLg">{item.label}</Text>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDashboard;
