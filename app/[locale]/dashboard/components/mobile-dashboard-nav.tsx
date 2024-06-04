'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';
import { SidebarNavItem } from '@/types';
import { IconMenu, IconX } from '@tabler/icons-react';
import { Button, Icon, Sheet, Text } from 'opub-ui';
import { twMerge } from 'tailwind-merge';

import { Icons } from '@/components/icons';
import dashboardStyles from '../dashboard.module.scss';

interface DashboardNavProps {
  items: SidebarNavItem[];
  isOpened: boolean;
  setIsOpened: (isOpened: boolean) => void;
}

export function MobileDashboardNav({
  isOpened,
  setIsOpened,
  items,
}: DashboardNavProps) {
  const path = usePathname();
  const asideRef = React.useRef<HTMLDivElement>(null);
  useOnClickOutside(asideRef, () => {
    if (isOpened) {
      setIsOpened(false);
    }
  });

  if (items && !items.length) {
    return null;
  }

  return (
    <>
      <Sheet open={isOpened}>
        <Sheet.Trigger>
          <Button onClick={() => setIsOpened(!isOpened)} kind="tertiary">
            <Icon source={IconMenu} />
            <Text visuallyHidden>Trigger Menu</Text>
          </Button>
        </Sheet.Trigger>
        <Sheet.Content side="left" size="narrow" className="pr-4 pt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setIsOpened(!isOpened)} kind="tertiary">
              <Icon source={IconX} />
            </Button>
          </div>
          <ul>
            {items.map((item) => {
              const icon = Icons[item.icon || 'arrowRight'];
              return (
                item.href && (
                  <Link
                    key={item.href}
                    href={item.disabled ? '/' : item.href}
                    onClick={() => setIsOpened(false)}
                  >
                    <div className={twMerge('relative flex justify-between')}>
                      <span
                        className={twMerge(
                          'absolute left-0 top-0 h-full w-[3px] rounded-r-1 bg-transparent',
                          path.includes(item.href) && 'bg-decorativeIconFour'
                        )}
                      />
                      <div
                        className={twMerge(
                          'ml-2 flex w-full items-center overflow-hidden rounded-1 pl-2',
                          dashboardStyles.Item,
                          path.includes(item.href) && dashboardStyles.Selected
                        )}
                      >
                        <Icon source={icon} />
                        <div
                          className={twMerge(
                            'px-3 py-2',
                            'whitespace-nowrap opacity-100 transition-opacity duration-300'
                          )}
                        >
                          <Text fontWeight="medium">{item.title}</Text>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              );
            })}
          </ul>
        </Sheet.Content>
      </Sheet>
    </>
  );
}
