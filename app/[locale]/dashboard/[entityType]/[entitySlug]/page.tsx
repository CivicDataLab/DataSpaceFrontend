import { redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ entityType: string; entitySlug: string }>;
}) {
  const { entityType, entitySlug } = await params;
  redirect(`/dashboard/${entityType}/${entitySlug}/dataset?tab=drafts`);
}
