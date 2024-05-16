'use client';

import { useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { TypeDatasetMetadata } from '@/gql/generated/graphql';
import { dehydrate, Hydrate, useMutation } from '@tanstack/react-query';

import { getQueryClient, GraphQL } from '@/lib/api';
import { EditMetadata } from '../components/EditMetadata';
import styles from '../edit.module.scss';

const datasetMetadataQueryDoc: any = graphql(`
  query datasetQuery($filters: DatasetFilter) {
    datasets(filters: $filters) {
      id
      title
      metadata {
        metadataItem {
          id
          label
        }
        id
        value
      }
    }
  }
`);

export default async function Page({
  params,
}: {
  params: { id: string; organizationId: string };
}) {
  const router = useRouter();

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery([`dataset_metadata_query`], () =>
    GraphQL(datasetMetadataQueryDoc, { filters: { id: params.id } })
  );

  const dehydratedState: any = dehydrate(queryClient);

  const defaultValuesPrepFn = (metadataArray: Array<TypeDatasetMetadata>) => {
    let defaultVal: {
      [key: string]: string | number | undefined;
    } = {};

    metadataArray?.map((field) => {
      defaultVal[field.metadataItem.id] = field.value;
    });

    return defaultVal;
  };

  return (
    <Hydrate state={dehydratedState}>
      <div className={styles.EditPage}>
        <EditMetadata
          id={params.id}
          defaultValues={defaultValuesPrepFn(
            dehydratedState.queries[0]?.state.data?.datasets[0].metadata
          )}
        />
      </div>
    </Hydrate>
  );
}
