'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function SessionGuard({ children }: { children: ReactNode }) {
  const { data } = useSession();
  const pathname = usePathname();

  // Guards against re-running the cleanup for an error we have already acted on.
  //
  // Without this, an expired session produced an unbounded loop: the effect called
  // signOut(), useSession refetched, the session still carried
  // RefreshAccessTokenError, and the effect fired again - as fast as the network
  // allowed. One client produced 35,685 signout calls and 107,612 session fetches in
  // a day, peaking at 6,230 requests/minute, which exhausted the backend's per-IP
  // rate limit and returned 429s to every other user behind the same NAT address.
  //
  // The loop was self-sustaining: once rate-limited, the signOut call itself started
  // failing, so the session was never cleared and the condition never resolved.
  const cleanupAttempted = useRef(false);

  useEffect(() => {
    if (data?.error !== 'RefreshAccessTokenError') {
      // Session recovered (or the user signed in again) - allow a future cleanup.
      cleanupAttempted.current = false;
      return;
    }

    if (cleanupAttempted.current) return;
    cleanupAttempted.current = true;

    const clearExpiredSession = async () => {
      try {
        await signOut({ redirect: false });
      } catch {
        // Deliberately swallowed. If signOut fails - the backend being rate-limited
        // is exactly when it will - retrying immediately is what created the loop.
        // The flag above stays set, so this settles instead of spinning.
      }

      if (pathname.includes('dashboard')) {
        signIn('keycloak');
      }
    };

    void clearExpiredSession();
  }, [data, pathname]);

  return <>{children}</>;
}
