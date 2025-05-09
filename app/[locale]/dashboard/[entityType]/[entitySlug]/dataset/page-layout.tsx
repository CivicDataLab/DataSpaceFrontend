'use client';

import { useParams, useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { GraphQL } from '@/lib/api';
import { ActionBar } from './components/action-bar';
import { Content } from './components/content';

const createDatasetMutationDoc: any = graphql(`
  mutation GenerateDatasetName {
    addDataset {
      __typename
      ... on TypeDataset {
        id
        created
      }
      ... on OperationInfo {
        messages {
          kind
          message
        }
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
        queryClient.invalidateQueries({
          queryKey: [`create_dataset_${'52'}`],
        });

        router.push(
          `/dashboard/${params.entityType}/${params.entitySlug}/dataset/${data?.addDataset?.id}/edit/metadata`
        );
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
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
