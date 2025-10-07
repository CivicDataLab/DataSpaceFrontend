import { dehydrate } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/api';
import styles from '../edit.module.scss';
import { DistibutionPage } from './page-layout';

export default async function Page({
  params,
}: {
  params: { entityType: string; entitySlug: string; id: string };
}) {
  const queryClient = getQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dehydratedState = dehydrate(queryClient);

  return (
    // <Hydrate state={dehydratedState}>
    <div className={styles.EditPage}>
      <DistibutionPage params={params} />
    </div>
    // </Hydrate>
  );
}
