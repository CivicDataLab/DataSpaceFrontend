import { redirect } from 'next/navigation';

export default async function AIModelEditPage({
  params,
}: {
  params: Promise<{ entityType: string; entitySlug: string; id: string }>;
}) {
  const { entityType, entitySlug, id } = await params;
  // Redirect to the details page by default
  redirect(
    `/dashboard/${entityType}/${entitySlug}/aimodels/edit/${id}/details`
  );
}
