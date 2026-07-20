'use client';

import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Button, Spinner, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { RESOURCE_LABEL } from '@/lib/constants/resourceLabel';

const publishStatusQuery = graphql(`
  query publicationPublishState($publicationId: UUID!) {
    getPublication(publicationId: $publicationId) {
      id
      title
      status
      linkedCount
      linkedUsecases {
        id
        title
      }
      linkedCollaboratives {
        id
        title
      }
    }
  }
`);

const publishMutation = graphql(`
  mutation publishPublication($publicationId: UUID!) {
    publishPublication(publicationId: $publicationId) {
      success
      data {
        status
      }
    }
  }
`);

const unpublishMutation = graphql(`
  mutation unpublishPublication($publicationId: UUID!) {
    unpublishPublication(publicationId: $publicationId) {
      success
      data {
        status
      }
    }
  }
`);

export default function PublishPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const headers = { [params.entityType]: params.entitySlug };

  const { data, isLoading, refetch } = useQuery(
    ['publication_publish', params.id],
    () => GraphQL(publishStatusQuery, headers, { publicationId: params.id })
  );

  const publish = useMutation(
    () => GraphQL(publishMutation, headers, { publicationId: params.id }),
    {
      onSuccess: () => {
        toast(`${RESOURCE_LABEL} published`);
        refetch();
      },
    }
  );
  const unpublish = useMutation(
    () => GraphQL(unpublishMutation, headers, { publicationId: params.id }),
    {
      onSuccess: () => {
        toast(`${RESOURCE_LABEL} unpublished`);
        refetch();
      },
    }
  );

  if (isLoading) {
    return (
      <div className="mt-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  const pub = data?.getPublication;
  if (!pub) return <div className="mt-8">{RESOURCE_LABEL} not found.</div>;

  const isPublished = pub.status === 'PUBLISHED';

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex flex-col gap-2">
        <Text variant="headingMd">{pub.title}</Text>
        <Text variant="bodyMd" className="text-textSubdued">
          Status: {isPublished ? 'Published' : 'Draft'}
        </Text>
      </div>

      {isPublished ? (
        <Button
          variant="basic"
          loading={unpublish.isLoading}
          onClick={() => unpublish.mutate()}
        >
          Unpublish
        </Button>
      ) : (
        <Button
          variant="interactive"
          loading={publish.isLoading}
          onClick={() => publish.mutate()}
        >
          Publish {RESOURCE_LABEL}
        </Button>
      )}

      {pub.linkedCount > 0 && (
        <div className="flex flex-col gap-1 rounded-md border border-solid border-greyExtralight p-4">
          <Text variant="bodyMd" fontWeight="medium">
            Linked into {pub.linkedCount} Use Case
            {pub.linkedCount === 1 ? '' : 's'} / Collaboratives
          </Text>
          {pub.linkedUsecases.map((uc) => (
            <Text key={uc.id} variant="bodySm" className="text-textSubdued">
              Use Case: {uc.title}
            </Text>
          ))}
          {pub.linkedCollaboratives.map((c) => (
            <Text key={c.id} variant="bodySm" className="text-textSubdued">
              Collaborative: {c.title}
            </Text>
          ))}
        </div>
      )}
    </div>
  );
}
