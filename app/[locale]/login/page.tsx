'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Spinner, Text } from 'opub-ui';

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
      <header className="pointer-events-none sticky top-0 z-1 select-none bg-primaryBlue">
        <MainNav />
      </header>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-1">
        <Spinner />
        <Text variant="headingLg">Logging In</Text>
      </div>
      <footer className="pointer-events-none select-none">
        <MainFooter />
      </footer>
    </div>
  );
};
