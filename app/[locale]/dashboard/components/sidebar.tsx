import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Icon, Sheet, Spinner, Text } from 'opub-ui';

import { Icons } from '@/components/icons';
import { ProfileContent } from './main-nav';

interface SidebarProps {
  data: { href: string; title: string }[];
  session: any;
  keycloakSessionLogOut: any;
  signIn: any;
  status: any;
}

const Sidebar: React.FC<SidebarProps> = ({
  data,
  session,
  keycloakSessionLogOut,
  signIn,
  status,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <Sheet.Trigger>
          <Button kind="tertiary" onClick={() => setOpen(true)}>
            <Icon source={Icons.menu} color="onBgDefault" />
          </Button>
        </Sheet.Trigger>
        <Sheet.Content className={'p-4'}>
          <div className=" flex flex-row justify-between">
            <div>
              {data.map((item, index) => (
                <div key={index} className="mb-1 px-1 py-2 ">
                  <Link href={item.href} onClick={() => setOpen(false)}>
                    <Text variant="headingSm" as="h1" color={'highlight'}>
                      {item.title}
                    </Text>
                  </Link>
                </div>
              ))}
              {status === 'loading' ? (
                <Spinner />
              ) : (
                <div>
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
                      variant="success"
                    >
                      <Text variant="headingMd">LOGIN / SIGN UP</Text>
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="mb-2 flex h-fit w-fit justify-end">
              <Button onClick={() => setOpen(false)} kind="tertiary">
                <Icon source={Icons.cross} size={24} color="default" />
              </Button>
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
    </>
  );
};

export default Sidebar;
