'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  Avatar,
  Button,
  Dialog,
  Divider,
  IconButton,
  Popover,
  SearchInput,
  Spinner,
  Text,
} from 'opub-ui';

import { useDashboardStore } from '@/config/store';
import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { UserDetailsQryDoc } from '../[entityType]/[entitySlug]/schema';
import { allOrganizationsListingDoc } from '../[entityType]/schema';
import Sidebar from './sidebar';

const profileLinks = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
];

export function MainNav({ hideSearch = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const { data: session, status } = useSession();
  const { setUserDetails, setAllEntityDetails } = useDashboardStore();

  async function keycloakSessionLogOut() {
    try {
      setIsLoggingOut(true);
      await fetch(`/api/auth/logout`, { method: 'GET' });
    } catch (err) {
      setIsLoggingOut(false);
      console.error(err);
    }
  }

  const handleSignIn = async () => {
    try {
      // First attempt sign in
      await signIn('keycloak', {
        redirect: true,
        callbackUrl: '/dashboard',
      });

      // The above will redirect automatically, no need for additional code
      // If redirect is needed manually, we can use:
      // router.push('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user && !hasFetched) {
        try {
          const [userDetailsRes, entityDetailsRes] = await Promise.all([
            GraphQL(UserDetailsQryDoc, {}, []),
            GraphQL(allOrganizationsListingDoc, {}, []),
          ]);

          setUserDetails(userDetailsRes);
          setAllEntityDetails(entityDetailsRes);
          setHasFetched(true);
        } catch (err) {
          console.error('Error fetching user/org data:', err);
        }
      }
    };

    fetchData();
  }, [session, hasFetched]);

  if (isLoggingOut) {
    return <LogginOutPage />;
  }

  const Navigation = [
    {
      title: 'All Data',
      href: '/datasets',
    },
    {
      title: 'Sectors',
      href: '/sectors',
    },
    {
      title: 'Use Cases',
      href: '/usecases',
    },
    {
      title: 'Publishers',
      href: '/publishers',
    },
    {
      title: 'About us',
      href: '/about-us',
    },
  ];

  const handleSearch = (value: string) => {
    if (value) {
      setIsOpen(false);

      router.push(`/datasets?query=${encodeURIComponent(value)}`);
    }
  };
  return (
    <nav className="p-4 lg:p-6">
      <div className="flex items-center justify-between gap-4  ">
        <div className="flex items-center gap-1">
          <div className="lg:hidden">
            <Sidebar
              data={Navigation}
              session={session}
              status={status}
              keycloakSessionLogOut={keycloakSessionLogOut}
              signIn={signIn}
            />
          </div>
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="group relative h-[52px] w-[170px] overflow-hidden">
                {/* Static Logo */}
                <div className="absolute inset-0">
                  <Image
                    src="/dataspacelogosep2025.png"
                    alt="Logo"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>

                {/* Globe GIF on Hover */}
                {/* <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Image
                    src="/globe.gif"
                    alt="Globe"
                    layout="fill"
                    objectFit="contain"
                  />
                </div> */}
              </div>
              {/* <Text variant="headingXl" className="text-surfaceDefault" as="h1">
                CivicDataSpace
              </Text> */}
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <div className="relative hidden lg:block">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <Dialog.Trigger>
                <IconButton
                  size="slim"
                  icon={Icons.search}
                  withTooltip
                  color="onBgDefault"
                  onClick={() => setIsOpen(true)}
                >
                  Search
                </IconButton>
              </Dialog.Trigger>
              <Dialog.Content title={'Search'}>
                <div className="p-3">
                  <SearchInput
                    onSubmit={handleSearch}
                    label={''}
                    placeholder="Search for any data"
                    name={''}
                  />
                </div>
              </Dialog.Content>
            </Dialog>
          </div>

          <div className="flex items-center gap-5">
            {Navigation.map((item, index) => (
              <div className="hidden lg:block" key={index}>
                <Link href={item.href}>
                  <Text
                    variant="headingMd"
                    as="h1"
                    className={`uppercase ${
                      pathname === item.href
                        ? 'text-[#84DCCF]'
                        : 'text-surfaceDefault'
                    }`}
                  >
                    {item.title}
                  </Text>
                </Link>
              </div>
            ))}
          </div>
          {status === 'loading' ? (
            <Spinner />
          ) : (
            <div className=" hidden lg:block">
              {session?.user ? (
                <ProfileContent
                  session={session}
                  keycloakSessionLogOut={keycloakSessionLogOut}
                />
              ) : (
                <Button
                  onClick={() => {
                    handleSignIn();
                  }}
                  kind="secondary"
                  className=" bg-tertiaryAccent"
                >
                  <Text variant="headingMd">LOGIN / SIGN UP</Text>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export const ProfileContent = ({
  session,
  keycloakSessionLogOut,
}: {
  session: Session;
  keycloakSessionLogOut: () => Promise<void>;
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        {session.user.image ? (
          <IconButton icon={session.user.image} size="slim">
            {session.user.name}
          </IconButton>
        ) : (
          <div
            style={
              {
                '--border-highlight-subdued': 'var(--accent-tertiary-color)',
              } as React.CSSProperties
            }
          >
            <Button
              kind="tertiary"
              size="slim"
              className="rounded-full  hover:no-underline"
            >
              <Avatar
                showInitials
                name={session.user.name || 'User'}
                size="small"
              />
            </Button>
          </div>
        )}
      </Popover.Trigger>
      <Popover.Content align="end">
        <div className="rounded-3 py-2 shadow-basicDeep">
          <div className="flex flex-col px-5 py-2">
            <Text variant="bodyMd" fontWeight="medium">
              {session.user.name}
            </Text>
            <Text variant="bodyMd">{session.user.email}</Text>
          </div>
          <div className="flex w-full flex-col">
            {profileLinks.map((link) => (
              <Text variant="bodyMd" key={link.href}>
                <Link
                  onClick={() => setOpen(false)}
                  href={link.href}
                  className="block w-full px-5 py-2 text-textSubdued transition-colors duration-100 ease-ease hover:bg-actionSecondaryNeutralHovered hover:text-textDefault"
                >
                  {link.label}
                </Link>
              </Text>
            ))}
          </div>
          <Divider className="mx-3 my-3 w-auto" />
          <div className="px-3">
            <Button
              onClick={() => {
                setOpen(false);
                keycloakSessionLogOut().then(() =>
                  signOut({ callbackUrl: '/' })
                );
              }}
              kind="secondary"
              size="slim"
              fullWidth
            >
              Log Out
            </Button>
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
};

const LogginOutPage = () => {
  return (
    <div className=" flex items-center justify-end gap-4 bg-surfaceDefault p-5 lg:p-7">
      <Spinner color="surface" />
      <Text variant="headingLg">Logging out...</Text>
    </div>
  );
};
