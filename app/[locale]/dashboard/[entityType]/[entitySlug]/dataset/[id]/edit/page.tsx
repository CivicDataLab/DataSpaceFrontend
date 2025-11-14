import { graphql } from '@/gql';
import { Hydrate } from '@/lib';
import { dehydrate } from '@tanstack/react-query';

import { getQueryClient, GraphQL } from '@/lib/api';
import styles from './edit.module.scss';
import { EditPage } from './page-layout';

// const datasetQueryDoc = graphql(`
//   query datasetEditQuery($dataset_id: Int) {
//     dataset(dataset_id: $dataset_id) {
//       id
//       title
//       description
//     }
//   }
// `);

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();
  // await queryClient.prefetchQuery([`dataset_${params.id}`], () =>
  //   GraphQL(datasetQueryDoc, {
  //     dataset_id: Number(params.id),
  //   })
  // );
  const dehydratedState = dehydrate(queryClient);

  return (
    // <Hydrate state={dehydratedState}>
    <div className={styles.EditPage}>
      <EditPage params={{ id }} />
    </div>
    // </Hydrate>
  );
}
