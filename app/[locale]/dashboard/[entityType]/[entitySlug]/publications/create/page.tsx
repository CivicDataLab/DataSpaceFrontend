'use client';

import { graphql } from '@/gql';
import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Text, toast } from 'opub-ui';

import {
  PublicationForm,
  PublicationFormInput,
} from '@/components/publications/PublicationForm';
import { GraphQL } from '@/lib/api';
import { RESOURCE_LABEL } from '@/lib/constants/resourceLabel';

const createPublicationMutation = graphql(`
  mutation createPublication($input: CreatePublicationInput!) {
    createPublication(input: $input) {
      success
      errors {
        fieldErrors {
          field
          messages
        }
        nonFieldErrors
      }
      data {
        id
      }
    }
  }
`);

export default function CreatePublicationPage() {
  const router = useRouter();
  const params = useParams<{ entityType: string; entitySlug: string }>();

  const { mutate, isLoading } = useMutation(
    (input: PublicationFormInput) =>
      GraphQL(
        createPublicationMutation,
        { [params.entityType]: params.entitySlug },
        { input }
      ),
    {
      onSuccess: (res) => {
        const payload = res?.createPublication;
        if (!payload?.success || !payload.data?.id) {
          const message =
            payload?.errors?.nonFieldErrors?.[0] ||
            payload?.errors?.fieldErrors?.[0]?.messages?.[0] ||
            'Please fill in all required fields.';
          toast(message);
          return;
        }
        toast(`${RESOURCE_LABEL} created`);
        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/publications/edit/${payload.data.id}/blocks`
        );
      },
      onError: (error: unknown) => {
        toast(error instanceof Error ? error.message : 'Failed to create');
      },
    }
  );

  return (
    <div className="mt-8 flex flex-col gap-4">
      <Text variant="headingLg">Create a {RESOURCE_LABEL}</Text>
      <PublicationForm
        onSubmit={(input) => mutate(input)}
        submitLabel={`Create ${RESOURCE_LABEL}`}
        isSubmitting={isLoading}
      />
    </div>
  );
}
