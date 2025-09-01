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

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const queryClient = getQueryClient();
  // await queryClient.prefetchQuery([`dataset_${params.id}`], () =>
  //   GraphQL(datasetQueryDoc, {
  //     dataset_id: Number(params.id),
  //   })
  // );
  const dehydratedState = dehydrate(queryClient);

  return (
    // <Hydrate state={dehydratedState}>
    // </Hydrate>
    <div className={styles.EditPage}>
      <EditPage params={params} />
    </div>
  );
}
