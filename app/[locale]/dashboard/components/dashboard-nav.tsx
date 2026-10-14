'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMetaKeyPress } from '@/hooks/use-meta-key-press';
import { SidebarNavItem } from '@/types';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Divider, Icon, IconButton, Text, Tooltip } from 'opub-ui';

import { DashboardOrganization, DashboardUser } from '@/config/store';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import styles from '../dashboard.module.scss';

interface DashboardNavProps {
  items: SidebarNavItem[];
  type?: string;
  entityDetails?:
    (Partial<DashboardOrganization> & Partial<DashboardUser>) | null;
}

function displayName(
  entityDetails?:
    (Partial<DashboardOrganization> & Partial<DashboardUser>) | null
): string {
  if (!entityDetails) return '';
  if (entityDetails.name) return entityDetails.name;
  const fullName = [entityDetails.firstName, entityDetails.lastName]
    .filter(Boolean)
    .join(' ');
  return fullName || entityDetails.username || '';
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function groupFor(item: SidebarNavItem): string {
  const title = item.title.toLowerCase();
  if (title === 'profile') return 'Account';
  if (title.includes('help')) return 'More';
  return 'Contribution';
}

export function DashboardNav({
  items,
  entityDetails,
  type,
}: DashboardNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const imageUrl =
    type === 'organization'
      ? entityDetails?.logo?.url
      : type === 'self'
        ? entityDetails?.profilePicture?.url
        : undefined;
  const [isImageValid, setIsImageValid] = useState(!!imageUrl);
  const [prevImageUrl, setPrevImageUrl] = useState(imageUrl);
  if (imageUrl !== prevImageUrl) {
    setPrevImageUrl(imageUrl);
    setIsImageValid(!!imageUrl);
  }

  const path = usePathname();
  const name = displayName(entityDetails);
  const dashboardHref = path.includes('self')
    ? '/dashboard'
    : '/dashboard/organization';

  useMetaKeyPress('b', () => setIsCollapsed((e) => !e));

  if (items && !items.length) {
    return null;
  }

  const groups = items.reduce<Record<string, SidebarNavItem[]>>((acc, item) => {
    const group = groupFor(item);
    acc[group] = acc[group] ? [...acc[group], item] : [item];
    return acc;
  }, {});
  const groupNames = Object.keys(groups);
  const showGroupLabels = groupNames.length > 1;

  return (
    <aside
      className={cn(
        'mb-10 mt-2 hidden h-fit min-w-0 shrink-0 flex-col self-start overflow-hidden rounded-4 border-1 border-solid border-baseGraySlateSolid6 bg-surfaceDefault md:sticky md:top-[calc(80px+1rem)] md:z-1 md:flex',
        isCollapsed ? 'w-[72px]' : 'w-[220px]',
        styles.Collapse
      )}
    >
      {type === 'organization' || type === 'self' ? (
        <div
          className={cn(
            'flex items-center gap-3 border-b-1 border-solid border-baseGraySlateSolid6 px-4 py-4',
            isCollapsed && 'justify-center px-2'
          )}
        >
          {entityDetails ? (
            <>
              {isImageValid && imageUrl ? (
                <Image
                  height={60}
                  width={60}
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${imageUrl}`}
                  alt={`${name} logo`}
                  onError={() => {
                    setIsImageValid(false);
                  }}
                  className={cn(
                    'h-14 w-14 shrink-0 object-cover',
                    type === 'organization' ? 'rounded-2' : 'rounded-full'
                  )}
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surfaceSubdued">
                  <Text variant="bodySm" fontWeight="medium">
                    {initialsFromName(name)}
                  </Text>
                </div>
              )}
              {!isCollapsed ? (
                <Text variant="bodyMd" fontWeight="medium" className="truncate">
                  {name}
                </Text>
              ) : null}
            </>
          ) : (
            <div className="flex animate-pulse items-center gap-3">
              <div
                className={cn(
                  'h-14 w-14 shrink-0 bg-surfaceSubdued',
                  type === 'organization' ? 'rounded-2' : 'rounded-full'
                )}
              />
              {!isCollapsed ? (
                <div className="h-4 w-28 rounded-1 bg-surfaceSubdued" />
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <nav className="flex flex-col gap-4 px-2 py-2">
        {groupNames.map((groupName, groupIndex) => (
          <div key={groupName} className="flex flex-col gap-1">
            {showGroupLabels ? (
              <Text
                variant="bodySm"
                color="subdued"
                className={cn(
                  'whitespace-nowrap px-3 py-1 tracking-wide',
                  isCollapsed && 'invisible'
                )}
              >
                {groupName.toUpperCase()}
              </Text>
            ) : null}
            {groups[groupName].map((item) => {
              const icon = Icons[item.icon || 'arrowRight'];
              const isSelected = Boolean(item.href && path.includes(item.href));
              return (
                item.href && (
                  <Link key={item.href} href={item.disabled ? '/' : item.href}>
                    <div className="relative flex items-center">
                      {/* <span
                        className={cn(
                          'absolute left-0 h-6 w-[3px] -translate-y-1/2  bg-transparent',
                          isSelected && 'bg-[var(--orange-secondary-color)]'
                        )}
                      /> */}
                      <div
                        className={cn(
                          'flex w-full items-center overflow-hidden rounded-r-2 ',
                          styles.Item,
                          isSelected && styles.Selected,
                          isCollapsed && styles.Collapsed,
                          !isSelected && 'pl-1',
                          isSelected &&
                            'border-l-4 border-solid border-[var(--orange-secondary-color)]'
                        )}
                      >
                        <Tooltip
                          side="right"
                          content={isCollapsed ? item.title : undefined}
                        >
                          <div className="basis-5 px-3 py-2">
                            <Icon source={icon} color="default" />
                          </div>
                        </Tooltip>
                        <div
                          className={cn(
                            'overflow-hidden whitespace-nowrap py-2 pr-3 opacity-100 transition-opacity duration-300',
                            isCollapsed && 'w-0 p-0 opacity-0'
                          )}
                        >
                          <Text
                            fontWeight="medium"
                            className={
                              isSelected
                                ? 'text-[var(--blue-primary-color)]'
                                : undefined
                            }
                          >
                            {item.title}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              );
            })}
            {showGroupLabels && groupIndex < groupNames.length - 1 ? (
              <div className={cn('mx-3 mt-3', isCollapsed && 'invisible')}>
                <Divider />
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="flex flex-nowrap items-center justify-between border-t-1 border-solid border-baseGraySlateSolid6 px-1 py-2">
        <Link
          href={dashboardHref}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-2 p-1 [&_svg]:text-[var(--blue-primary-color)]',
            styles.Item
          )}
        >
          <Icon source={Icons.back} />
          {!isCollapsed ? (
            <Text
              variant="bodyMd"
              fontWeight="medium"
              className="text-[var(--blue-primary-color)]"
            >
              Dashboard
            </Text>
          ) : null}
        </Link>
        <IconButton
          className="shrink-0"
          size="slim"
          icon={isCollapsed ? IconChevronRight : IconChevronLeft}
          withTooltip
          tooltipSide="right"
          onClick={() => setIsCollapsed((open) => !open)}
        >
          {isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        </IconButton>
      </div>
    </aside>
  );
}
