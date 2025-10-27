import { redirect } from 'next/navigation';

export default function AIModelEditPage({
  params,
}: {
  params: { entityType: string; entitySlug: string; id: string };
}) {
  // Redirect to the details page by default
  redirect(
    `/dashboard/${params.entityType}/${params.entitySlug}/aimodels/edit/${params.id}/details`
  );
}
