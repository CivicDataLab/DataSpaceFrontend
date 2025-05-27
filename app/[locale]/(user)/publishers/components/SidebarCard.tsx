import React from 'react';
import Image from 'next/image';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Icon, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

interface SidebarCardProps {
  data: any;
  type: 'organization' | 'Publisher';
}
const sectorsDoc: any = graphql(`
  query sectorInfo($userId: ID!) {
    userContributedSectors(userId: $userId) {
      id
      name
      slug
    }
  }
`);

const organizationDoc: any = graphql(`
  query organizationInfo($organizationId: ID!) {
    organizationContributedSectors(organizationId: $organizationId) {
      id
      name
      slug
    }
  }
`);

const SidebarCard: React.FC<SidebarCardProps> = ({ data, type }) => {
  const sectorInfo: any = useQuery(
    [`${data.id}_sector`],
    () =>
      GraphQL(
        sectorsDoc,
        {
          // Entity Headers if present
        },
        { userId: data.id }
      ),
    {
      enabled: type === 'Publisher' && !!data?.id,
    }
  );

  const organizationInfo: any = useQuery(
    [`${data.id}_organization`],
    () =>
      GraphQL(
        organizationDoc,
        {
          // Entity Headers if present
        },
        { organizationId: data.id }
      ),
    {
      enabled: type === 'organization' && !!data?.id, // runs only if type is 'organization' and data.id exists
    }
  );

  return (
    <div className="m-auto flex flex-col gap-4">
      <div>
        {type === 'organization' ? (
          <Image
            src={`${data?.logo?.url ? process.env.NEXT_PUBLIC_BACKEND_URL + data?.logo?.url : '/org.png'}`}
            alt={data.fullName}
            width={168}
            height={168}
            className="m-auto rounded-4 bg-surfaceDefault object-contain p-4"
          />
        ) : (
          <Image
            src={`${data?.profilePicture?.url ? process.env.NEXT_PUBLIC_BACKEND_URL + data?.profilePicture?.url : '/profile.png'}`}
            alt={data.fullName}
            width={240}
            height={240}
            className="m-auto rounded-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="pt-4">
          <Text variant="bodyLg" fontWeight="semibold" color="onBgDefault">
            {type === 'organization' ? data?.name : data?.fullName}
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Text variant="bodySm" color="onBgDefault">
            {data?.publishedUseCasesCount} Use Cases
          </Text>
          <span className="h-1 w-1 rounded-full bg-tertiaryAccent" />
          <Text variant="bodySm" color="onBgDefault">
            {data?.publishedDatasetsCount} Datasets
          </Text>
          <span className="h-1 w-1 rounded-full bg-tertiaryAccent" />
          <Text variant="bodySm" color="onBgDefault">
            {data?.contributedSectorsCount} Sectors
          </Text>
        </div>
        <div className="flex flex-col  gap-2">
          {data?.location && (
            <div className="flex items-center gap-1">
              <Icon source={Icons.location} color="inherit" />
              <Text variant="bodySm" color="onBgDefault">
                {data?.location}
              </Text>
            </div>
          )}
          {data?.linkedinProfile && (
            <div className="flex items-center gap-1">
              <Icon source={Icons.linkedin} color="inherit" />
              <Text variant="bodySm" color="onBgDefault">
                {data?.linkedinProfile?.replace(/\/+$/, '').split('/').pop()}
              </Text>
            </div>
          )}
          {data?.githubProfile && (
            <div className="flex items-center gap-1">
              <Icon source={Icons.github} color="inherit" />
              <Text variant="bodySm" color="onBgDefault">
                {data?.githubProfile?.replace(/\/+$/, '').split('/').pop()}
              </Text>
            </div>
          )}
        </div>
        <div className="flex  flex-col gap-2">
          {type === 'Publisher' &&
            sectorInfo?.data &&
            sectorInfo?.data.userContributedSectors.map(
              (item: any, index: any) => (
                <div className="flex items-center gap-2" key={index}>
                  <Image
                    src={`/Sectors/${item?.name}.svg`}
                    alt="Sector Logo"
                    width={32}
                    height={32}
                    className=" rounded-2 bg-surfaceDefault p-1"
                  />
                  <Text color="onBgDefault">{item?.name}</Text>
                </div>
              )
            )}
          {type === 'organization' &&
            organizationInfo?.data &&
            organizationInfo?.data.organizationContributedSectors.map(
              (item: any, index: any) => (
                <div className="flex items-center gap-2" key={index}>
                  <Image
                    src={`/Sectors/${item?.name}.svg`}
                    alt="Sector Logo"
                    width={32}
                    height={32}
                    className=" rounded-2 bg-surfaceDefault p-1"
                  />
                  <Text color="onBgDefault">{item?.name}</Text>
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
};

export default SidebarCard;
