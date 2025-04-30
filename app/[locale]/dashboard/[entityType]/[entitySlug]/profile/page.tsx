'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import OrgProfile from './orgProfile';
import UserProfile from './userProfile';

const Profile = () => {
  const path = usePathname();

  return (
    <div className="mt-8 flex h-full flex-col">
      {path.includes('self') ? <UserProfile /> : <OrgProfile />}
    </div>
  );
};

export default Profile;
