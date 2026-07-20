'use client';

import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Spinner, toast } from 'opub-ui';

import {
  PublicationForm,
  PublicationFormInput,
} from '@/components/publications/PublicationForm';
import { GraphQL } from '@/lib/api';
import { RESOURCE_LABEL } from '@/lib/constants/resourceLabel';

const fetchPublication = graphql(`
  query editPublication($publicationId: UUID!) {
    getPublication(publicationId: $publicationId) {
      id
      title
      description
      authors
      publicationDate
      license
      externalSourceLink
      resourceType {
        id
      }
      sectors {
        id
      }
      geographies {
        id
      }
    }
  }
`);

const updatePublicationMutation = graphql(`
  mutation updatePublicationMetadata($input: UpdatePublicationInput!) {
    updatePublication(input: $input) {
      success
      errors {
        nonFieldErrors
        fieldErrors {
          field
          messages
        }
      }
    }
  }
`);

export default function EditMetadataPage() {
  const params = useParams<{
    entityType: string;
    entitySlug: string;
    id: string;
  }>();
  const headers = { [params.entityType]: params.entitySlug };

  const { data, isLoading } = useQuery(['edit_publication', params.id], () =>
    GraphQL(fetchPublication, headers, { publicationId: params.id })
  );

  const { mutate, isLoading: isSaving } = useMutation(
    (input: PublicationFormInput) =>
      GraphQL(
        updatePublicationMutation,
        headers,
        { input: { id: params.id, ...input } }
      ),
    {
      onSuccess: (res) => {
        const payload = res?.updatePublication;
        if (!payload?.success) {
          toast(payload?.errors?.nonFieldErrors?.[0] || 'Could not save changes.');
          return;
        }
        toast('Saved');
      },
      onError: (e: unknown) =>
        toast(e instanceof Error ? e.message : 'Failed to save'),
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
  if (!pub) {
    return <div className="mt-8">{RESOURCE_LABEL} not found.</div>;
  }

  return (
    <PublicationForm
      initialValues={{
        title: pub.title,
        description: pub.description ?? '',
        authors: (pub.authors ?? []).join(', '),
        publicationDate: pub.publicationDate ?? '',
        license: pub.license,
        resourceTypeId: pub.resourceType?.id ?? '',
        sectorIds: (pub.sectors ?? []).map((s) => s.id),
        geographyIds: (pub.geographies ?? []).map((g) => String(g.id)),
        externalSourceLink: pub.externalSourceLink ?? '',
      }}
      onSubmit={(input) => mutate(input)}
      submitLabel="Save changes"
      isSubmitting={isSaving}
    />
  );
}
