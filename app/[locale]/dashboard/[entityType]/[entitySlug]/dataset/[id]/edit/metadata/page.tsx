import { EditMetadata } from '../components/EditMetadata';
import styles from '../edit.module.scss';

export default async function Page(
  props: {
    params: Promise<{ id: string; entitySlug: string }>;
  }
) {
  const params = await props.params;
  return (
    // <Hydrate state={dehydratedState}>
    // </Hydrate>
    <div className={styles.EditPage}>
      <EditMetadata id={params.id} />
    </div>
  );
}
