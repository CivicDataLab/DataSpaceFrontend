'use client';

import { Session } from 'next-auth';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import React, { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { useDashboardStore } from '@/config/store';
import { GraphQL } from '@/lib/api';
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
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const { data: session, status } = useSession();
  const { setUserDetails, setAllEntityDetails } = useDashboardStore();

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
  }, [session, hasFetched, setUserDetails, setAllEntityDetails]);

  const exploreLinks = [
    {
      title: 'Datasets',
      href: '/datasets?dataset_type=DATA',
    },
    {
      title: 'Prompts',
      href: '/datasets?dataset_type=PROMPT',
    },
  ];

  const Navigation = [
    {
      title: 'Sectors',
      href: '/sectors',
    },
    {
      title: 'Use Cases',
      href: '/usecases',
    },
    {
      title: 'Collaboratives',
      href: '/collaboratives',
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
    <nav className="z-50 sticky top-1 min-h-[80px] px-4 py-6 sm:py-8 md:py-5 lg:px-6 lg:py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <div className="lg:hidden">
            <Sidebar
              data={[...exploreLinks, ...Navigation]}
              session={session}
              status={status}
              signIn={signIn}
            />
          </div>
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="group relative h-[35px] w-[130px] overflow-hidden md:h-[40px] md:w-[150px] lg:h-[68px] lg:w-[183px]">
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
          {!hideSearch && (
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
          )}

          <div className="flex items-center gap-5">
            {/* Explore dropdown (desktop) */}
            <div className="hidden lg:block">
              <Popover open={isExploreOpen} onOpenChange={setIsExploreOpen}>
                <Popover.Trigger>
                  <button className="flex cursor-pointer items-center gap-1 border-none bg-transparent outline-none">
                    <Text
                      variant="headingMd"
                      // as="span"
                      className={`uppercase text-surfaceDefault ${
                        pathname.startsWith(`/datasets`)
                          ? 'text-[#84DCCF]'
                          : 'text-surfaceDefault'
                      }`}
                      fontWeight="semibold"
                    >
                      Explore
                    </Text>
                    <Icons.chevronDown
                      size={18}
                      color={
                        pathname.startsWith(`/datasets`) ? '#84DCCF' : '#fff'
                      }
                    />
                  </button>
                </Popover.Trigger>
                <Popover.Content align="start">
                  <div className="rounded-3 bg-surfaceDefault py-2 shadow-basicDeep">
                    {exploreLinks.map((link) => (
                      <Text variant="bodyMd" key={link.href}>
                        <a
                          href={link.href}
                          // target="_blank"
                          rel="noreferrer noopener"
                          className="block w-full px-5 py-2 font-medium uppercase text-textSubdued transition-colors duration-100 ease-ease hover:bg-actionSecondaryNeutralHovered hover:text-textDefault"
                        >
                          {link.title}
                        </a>
                      </Text>
                    ))}
                  </div>
                </Popover.Content>
              </Popover>
            </div>

            {/* Regular navigation items */}
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
}: {
  session: Session;
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
              onClick={async () => {
                setOpen(false);
                const response = await fetch(`/api/auth/logout`, { method: 'GET' });
                const data = await response.json();
                
                await signOut({ redirect: false });
                
                if (data.url) {
                  window.location.href = data.url;
                }
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

