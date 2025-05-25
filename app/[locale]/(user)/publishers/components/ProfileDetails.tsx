import React from 'react';
import Link from 'next/link';
import { Icon, Text } from 'opub-ui';

import { formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface ProfileDetailsProps {
  data: any;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ data }) => {
  const socialMedia = [
    {
      icon: Icons.twitter,
      link: data?.twitterProfile,
    },
    {
      icon: Icons.linkedin,
      link: data?.linkedinProfile,
    },
    {
      icon: Icons.github,
      link: data?.githubProfile,
    },
  ].filter((item) => item.link?.trim());
  return (
    <div>
      <div className="flex w-full flex-col gap-4 rounded-4 bg-surfaceDefault p-6">
        <div className="flex items-center gap-1 ">
          <Icon source={Icons.calendar} color="warning" />
          <Text variant="bodySm">
            Joined on: {formatDate(data?.dateJoined)}
          </Text>
        </div>
        <div>
          <Text variant="bodySm">{data?.bio}</Text>
        </div>
        <div className=" flex items-center gap-3">
          {socialMedia?.map((item: any, index: any) => (
            <Link
              key={index}
              href={item?.link}
              target="_blank"
              className=" h-9 w-9 rounded-5 bg-secondaryText p-2"
            >
              <Icon source={item.icon} size={20} color="onBgDefault" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
