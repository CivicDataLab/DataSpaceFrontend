'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Button, Spinner, Tag, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import {
  RESOURCE_LABEL,
  RESOURCE_LABEL_PLURAL,
} from '@/lib/constants/resourceLabel';

const dashboardListQuery = graphql(`
  query dashboardPublications {
    publications {
      id
      title
      status
      modified
    }
  }
`);

export default function DashboardPublicationsPage() {
  const params = useParams<{ entityType: string; entitySlug: string }>();
  const base = `/dashboard/${params.entityType}/${params.entitySlug}/publications`;

  const { data, isLoading } = useQuery(
    ['dashboard_publications', params.entitySlug],
    () =>
      GraphQL(dashboardListQuery, { [params.entityType]: params.entitySlug })
  );

  const publications = data?.publications ?? [];

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Text variant="headingLg">{RESOURCE_LABEL_PLURAL}</Text>
        <Link href={`${base}/create`}>
          <Button variant="interactive">Create {RESOURCE_LABEL}</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : publications.length === 0 ? (
        <Text variant="bodyMd" className="text-textSubdued">
          You have no {RESOURCE_LABEL_PLURAL.toLowerCase()} yet.
        </Text>
      ) : (
        <div className="flex flex-col gap-2">
          {publications.map((pub) => (
            <Link
              key={pub.id}
              href={`${base}/edit/${pub.id}/metadata`}
              className="rounded-md border flex items-center justify-between border-solid border-greyExtralight p-3"
            >
              <Text variant="bodyMd">{pub.title || 'Untitled'}</Text>
              <Tag>{pub.status}</Tag>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
