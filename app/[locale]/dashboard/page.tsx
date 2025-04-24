'use client';

import { Icon, Text } from 'opub-ui';

import BreadCrumbs from '@/components/BreadCrumbs';
import { Icons } from '@/components/icons';
import Link from 'next/link';

const UserDashboard = () => {
  const list = [
    {
      label: 'My Dashboard',
      icon: Icons.user,
      path: '/dashboard/self/sanjay/dataset',
    },
    {
      label: 'Organizations',
      icon: Icons.userGroup,
      path: '/dashboard/organization',
    },
  ];

  return (
    <div>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          {
            href: '#',
            label: 'User Dashboard',
          },
        ]}
      />

      <div className="container mb-40 ">
        <div className=" flex flex-col gap-6 py-10">
          <Text variant='headingXl'> User Dashboard</Text>
        </div>
        <div className="flex items-center lg:flex-nowrap md:flex-nowrap flex-wrap gap-6">
          {list.map((item, index) => (
            <Link
              key={index}   
              href={item.path}
              className=" rounded-4 flex w-full min-h-56 max-h-56  p-4 justify-center flex-col items-center gap-3 bg-greyExtralight "
            >
              <Icon source={item.icon} size={60} color='highlight' />
              <Text variant="headingLg">{item.label}</Text>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
