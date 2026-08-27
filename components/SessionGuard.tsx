'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function SessionGuard({ children }: { children: ReactNode }) {
  const { data } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (data?.error !== 'RefreshAccessTokenError') return;

    const clearExpiredSession = async () => {
      await signOut({ redirect: false });

      if (pathname.includes('dashboard')) {
        signIn('keycloak');
      }
    };

    void clearExpiredSession();
  }, [data, pathname]);

  return <>{children}</>;
}
