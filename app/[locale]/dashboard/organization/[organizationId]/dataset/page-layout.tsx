'use client';

import { graphql } from '@/gql';
import { usePRouter } from '@/hooks/use-prouter';
import { CreateDataset } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Divider } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { ActionBar } from './components/action-bar';
import { Content } from './components/content';

// const allDatasetsQueryDoc = graphql(`
//   query allDatasetsQuery {
//     all_datasets {
//       id
//       title
//       description
//     }
//   }
// `);

const createDatasetMutationDoc: any = graphql(`
  mutation {
    addDataset {
      id
      title
    }
  }
`);

export const Page = () => {
  // const { data } = useQuery(['all_datasets'], () =>
  //   GraphQL(allDatasetsQueryDoc)
  // );

  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(
    () => GraphQL(createDatasetMutationDoc, []),
    {
      onSuccess: (data) => {
        console.log(data);

        // queryClient.invalidateQueries({
        //   queryKey: [`create_dataset_${'52'}`],
        // });

        // router.push(
        //   `/dashboard/dataset/${data?.addDataset?.id}/edit/metadata`
        // );
      },
      onError: (err: any) => {
        console.log(err);
      },
    }
  );

  const router = usePRouter();
  // React.useEffect(() => {
  //   router.prefetch('/dashboard/dataset/new');
  // }, []);

  return (
    <>
      <ActionBar
        title="My Datasets"
        preFetch="/dashboard/dataset/new"
        primaryAction={{
          content: 'Add New Dataset',
          // TODO: Replace with dataset creation query
          onAction: () => {
            console.log('Clicked the Primary Action');

            mutate();
          },
          // router.push('/dashboard/dataset/2345/edit/distribution'),
        }}
        isLoading={isLoading}
      />
      <Divider />
      <Content />
    </>
  );
};
