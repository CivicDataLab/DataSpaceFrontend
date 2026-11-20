'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';

export default function SessionGuard({ children }: { children: ReactNode }) {
  const { data } = useSession();

  // One sign-out per expired session. signOut() itself fetches /api/auth/csrf
  // and /api/auth/session. Re-arming this flag on the empty session from that
  // sign-out made the next expired payload sign out again, which is the loop
  // that swapped the Login button and the profile chip.
  // A verified session (user present, no refresh error) is the only thing that
  // may arm a later cleanup.
  const cleanupAttempted = useRef(false);

  useEffect(() => {
    const expired = data?.error === 'RefreshAccessTokenError';

    if (!expired) {
      if (data?.user && !data.error) {
        cleanupAttempted.current = false;
      }
      return;
    }

    if (cleanupAttempted.current) return;
    cleanupAttempted.current = true;

    void signOut({ redirect: false }).catch(() => {
      // Leave the flag set. Signing out again is the loop.
    });
  }, [data]);

  return <>{children}</>;
}
