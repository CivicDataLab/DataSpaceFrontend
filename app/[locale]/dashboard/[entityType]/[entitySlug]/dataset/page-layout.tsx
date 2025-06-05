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
  const params = useParams<{
    entityType: string;
    entitySlug: string;
  }>();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    () =>
      GraphQL(
        createDatasetMutationDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        []
      ),
    {
      onSuccess: (data: any) => {
        if (data.addDataset.success) {
          toast('Dataset created successfully!');
          queryClient.invalidateQueries({
            queryKey: [`create_dataset_${params.entityType}`],
          });

          router.push(
            `/dashboard/${params.entityType}/${params.entitySlug}/dataset/${data?.addDataset?.id}/edit/metadata`
          );
        } else {
          toast('Error: ' + data.addDataset.errors.fieldErrors[0].messages[0]);
        }
      },
    }
  );

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

      <Content params={params} />
    </>
  );
};
