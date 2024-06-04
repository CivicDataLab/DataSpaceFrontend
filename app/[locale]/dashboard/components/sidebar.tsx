import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Icon, Sheet, Text } from 'opub-ui';

import { Icons } from '@/components/icons';

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const data = [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Dataset Listing',
      href: '/datasets',
    },
  ];
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <Sheet.Trigger>
          <Button kind="tertiary" onClick={() => setOpen(true)}>
            <Icon source={Icons.menu} />
          </Button>
        </Sheet.Trigger>
        <Sheet.Content className={'p-4'}>
          <div className="mb-2 flex justify-between">
            <div>
              <Text variant="headingMd" as="h1" className="px-1">
                CivicDataSpace
              </Text>
            </div>
            <Button onClick={() => setOpen(false)} kind="tertiary">
              <Icon source={Icons.cross} size={24} color="default" />
            </Button>
          </div>
          {data.map((item, index) => (
            <div key={index} className="mb-1 px-1 py-2 ">
              <Link href={item.href} onClick={() => setOpen(false)}>
                <Text variant="headingSm" as="h1" color={'highlight'}>
                  {item.label}
                </Text>
              </Link>
            </div>
          ))}
        </Sheet.Content>
      </Sheet>
    </>
  );
};

export default Sidebar;
