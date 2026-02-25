'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Spinner, Text } from 'opub-ui';
import { useEffect } from 'react';

import MainFooter from '../dashboard/components/main-footer';
import { MainNav } from '../dashboard/components/main-nav';

const SignIn = () => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      void signIn('keycloak');
    } else if (status === 'authenticated') {
      const callbackUrl = window.location.search.includes('callbackUrl=')
        ? decodeURIComponent(
            window.location.search.replace(/^\?callbackUrl=/, '')
          )
        : '/';
      void router.push(callbackUrl);
      void router.refresh();
    }
  }, [status, router]);

  return <LogginInPage />;
};

export default SignIn;

const LogginInPage = () => {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surfaceDefault">
      <header className="sticky top-0 z-1 bg-primaryBlue pointer-events-none select-none">
        <MainNav />
      </header>
      <div className="flex flex-1 w-full flex-col items-center justify-center gap-1">
        <Spinner />
        <Text variant="headingLg">Logging In</Text>
      </div>
      <footer className="pointer-events-none select-none">
        <MainFooter />
      </footer>
    </div>
  );
};
