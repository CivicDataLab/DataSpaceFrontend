'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

export default function SessionGuard({ children }: { children: ReactNode }) {
  const { data } = useSession();

  const pathname = usePathname();

  useEffect(() => {
    if (
      data?.error === 'RefreshAccessTokenError' &&
      pathname.includes('dashboard')
    ) {
      signIn('keycloak');
    }
  }, [data]);

  return <>{children}</>;
}
