import React, { useState } from 'react';
import Link from 'next/link';
import { Button, ButtonGroup, Icon, Text } from 'opub-ui';

import { cn, formatDate } from '@/lib/utils';
import { Icons } from '@/components/icons';
import Datasets from './Datasets';
import UseCases from './UseCases';

interface ProfileDetailsProps {
  data: any;
  type: 'organization' | 'Publisher';
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ data, type }) => {
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

  const [tabType, setTabType] = useState<'usecases' | 'datasets'>('usecases');

  type PublisherType = 'usecases' | 'datasets';
  const publisherButtons: { key: PublisherType; label: string }[] = [
    { key: 'usecases', label: 'Use Cases' },
    { key: 'datasets', label: 'Datasets' },
  ];

  return (
    <div>
      <div className="flex w-full flex-col gap-4 rounded-4 bg-surfaceDefault p-6">
        <div className="flex items-center gap-1 ">
          <Icon source={Icons.calendar} color="warning" />
          <Text variant="bodySm">
            Joined on:{' '}
            {type === 'organization'
              ? formatDate(data?.created)
              : formatDate(data?.dateJoined)}
          </Text>
        </div>
        <div>
          <Text variant="bodySm">
            {type === 'organization' ? data?.description : data?.bio}
          </Text>
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
      <div className=" my-8">
        <ButtonGroup>
          <div className="flex flex-wrap gap-4">
            {publisherButtons.map((btn) => (
              <Button
                key={btn.key}
                onClick={() => setTabType(btn.key)}
                className={cn(
                  ' w-72 rounded-full py-3',
                  tabType === btn.key
                    ? 'bg-tertiaryAccent'
                    : 'border-1 border-solid border-tertiaryAccent bg-surfaceDefault'
                )}
              >
                <Text variant="headingLg" fontWeight="semibold">
                  {btn.label}
                </Text>
              </Button>
            ))}
          </div>
        </ButtonGroup>
      </div>
      {tabType === 'usecases' && <UseCases type={type} />}
      {tabType === 'datasets' && <Datasets type={type} />}
    </div>
  );
};

export default ProfileDetails;
