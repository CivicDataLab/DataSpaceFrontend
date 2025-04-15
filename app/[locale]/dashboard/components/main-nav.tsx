'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMetaKeyPress } from '@/hooks/use-meta-key-press';
import { Session } from 'next-auth';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  Avatar,
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Divider,
  IconButton,
  Popover,
  SearchInput,
  Spinner,
  Text,
} from 'opub-ui';

import { Icons } from '@/components/icons';
import Sidebar from './sidebar';

const profileLinks = [
  {
    label: 'Dashboard',
    href: '/dashboard/user/datasets',
  },
];

export function MainNav({ hideSearch = false }) {
  const pathname = usePathname();

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const { data: session, status } = useSession();
  const [commandOpen, setCommandOpen] = React.useState(false);

  useMetaKeyPress('k', () => setCommandOpen((e) => !e));

  async function keycloakSessionLogOut() {
    try {
      setIsLoggingOut(true);
      await fetch(`/api/auth/logout`, { method: 'GET' });
    } catch (err) {
      setIsLoggingOut(false);
      console.error(err);
    }
  }

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
      title: 'About us',
      href: '#',
    },
  ];

  return (
    <nav className='pt-6 px-6 lg:px-10 lg:pt-6 '>
      <div className="flex items-center justify-between gap-4 pb-6 ">
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
              <div className="group relative h-[38px] rounded-full w-[38px] overflow-hidden">
                {/* Static Logo */}
                <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0">
                  <Image
                    src="/globe_logo.png"
                    alt="Logo"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>

                {/* Globe GIF on Hover */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Image
                    src="/globe.gif"
                    alt="Globe"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <Text variant="headingXl" className="text-surfaceDefault" as="h1">
                CivicDataSpace
              </Text>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <div className="relative hidden lg:block">
            <IconButton
              size="slim"
              icon={Icons.search}
              withTooltip
              color="onBgDefault"
              onClick={() => setCommandOpen(true)}
            >
              Search
            </IconButton>

            <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
              <CommandInput placeholder="search..." />
              <CommandList>
                <CommandEmpty>No results found</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <CommandItem>
                    <Link href="/datasets">Explore Datasets</Link>
                  </CommandItem>
                  <CommandItem>
                    <Link href="/dashboard/user/datasets">Go to User Dashboard</Link>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </CommandDialog>
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
                    console.log(
                      process.env.NEXTAUTH_URL,
                      process.env.NEXT_PUBLIC_NEXTAUTH_URL
                    );
                    signIn('keycloak');
                  }}
                  kind="secondary"
                  className=' bg-tertiaryAccent'
                >
                  <Text variant="headingMd" >LOGIN / SIGN UP</Text>
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
    <div className=" flex items-center bg-surfaceDefault p-2 justify-end gap-4">
      <Spinner color="surface" />
      <Text variant="headingLg" >
        Logging out...
      </Text>
    </div>
  );
};
