'use client';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  router.push('/dashboard/user/datasets-accessed');
}
