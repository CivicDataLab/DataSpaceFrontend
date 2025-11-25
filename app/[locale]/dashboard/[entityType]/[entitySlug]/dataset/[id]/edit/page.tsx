import { dehydrate } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/api';
import styles from './edit.module.scss';
import { EditPage } from './page-layout';


export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dehydratedState = dehydrate(queryClient);

  return (
    // <Hydrate state={dehydratedState}>
    <div className={styles.EditPage}>
      <EditPage params={{ id }} />
    </div>
    // </Hydrate>
  );
}
