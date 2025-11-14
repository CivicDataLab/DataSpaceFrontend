'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { ActionBar } from './components/action-bar';
import { Content } from './components/content';

const createDatasetMutationDoc: any = graphql(`
  mutation GenerateDatasetname {
    addDataset {
      success
      errors {
        fieldErrors {
          messages
        }
      }
      data {
        id
        title
        created
      }
    }
  }
`);

export const Page = () => {
  const params = useParams<{ entityType?: string; entitySlug?: string }>();
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;

  const isValidParams =
    typeof entityType === 'string' && typeof entitySlug === 'string';

  const ownerArgs: Record<string, string> | null = isValidParams
    ? { [entityType]: entitySlug }
    : null;

  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    () => GraphQL(createDatasetMutationDoc, ownerArgs || {}, []),
    {
      onSuccess: (data: any) => {
        if (data.addDataset.success) {
          toast('Dataset created successfully!');
          if (isValidParams && entityType) {
            queryClient.invalidateQueries({
              queryKey: [`create_dataset_${entityType}`],
            });

            router.push(
              `/dashboard/${entityType}/${entitySlug}/dataset/${data?.addDataset?.data?.id}/edit/metadata`
            );
          }
        } else {
          toast('Error: ' + data.addDataset.errors.fieldErrors[0].messages[0]);
        }
      },
    }
  );

  if (!isValidParams) {
    return null;
  }

  // React.useEffect(() => {
  //   router.prefetch('/dashboard/dataset/new');
  // }, []);

  return (
    <>
      <ActionBar
        title="My Datasets"
        primaryAction={{
          content: 'Add New Dataset',
          onAction: () => {
            mutate();
          },
        }}
        isLoading={isLoading}
      />

      <Content />
    </>
  );
};
