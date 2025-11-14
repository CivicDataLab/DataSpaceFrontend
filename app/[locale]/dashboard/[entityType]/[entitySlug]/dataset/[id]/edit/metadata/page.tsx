import { EditMetadata } from '../components/EditMetadata';
import styles from '../edit.module.scss';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; entitySlug: string }>;
}) {
  const { id } = await params;
  return (
    // <Hydrate state={dehydratedState}>
    <div className={styles.EditPage}>
      <EditMetadata id={id} />
    </div>
    // </Hydrate>
  );
}
