import { EditMetadata } from '../components/EditMetadata';
import styles from '../edit.module.scss';

export default async function Page({
  params,
}: {
  params: { id: string; organizationId: string };
}) {
  return (
    // <Hydrate state={dehydratedState}>
    <div className={styles.EditPage}>
      <EditMetadata id={params.id} />
    </div>
    // </Hydrate>
  );
}
