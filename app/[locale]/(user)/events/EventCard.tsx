import Link from 'next/link';
import { IconCalendar, IconMapPin, IconUser } from '@tabler/icons-react';
import { Text } from 'opub-ui';

import MediaImage from '@/components/MediaImage';
import { backendFileUrl } from '@/lib/public-entity';
import { EventCover } from './EventCover';
import { formatEventRange } from './format';
import type { EventSearchHit } from './listing';

export function EventCard({
  event,
  coverUrl,
}: {
  event: EventSearchHit;
  coverUrl: string | null;
}) {
  const name = event.name?.trim() || 'Untitled event';
  const when = formatEventRange(event.start_date, event.end_date);
  const location = event.location?.trim() || '';
  const hostName =
    event.organization?.name?.trim() || event.user?.name?.trim() || '';
  const avatar = backendFileUrl(
    event.organization?.logo || event.user?.profile_picture
  );
  const href = event.url_slug ? `/events/${event.url_slug}` : '/events';

  return (
    <Link
      href={href}
      className="shadow-sm hover:shadow-md flex items-stretch gap-4 rounded-3 border-1 border-solid border-borderSubdued bg-surfaceDefault p-4 no-underline transition-shadow sm:gap-6 sm:p-5"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Text
          variant="headingLg"
          fontWeight="semibold"
          className="text-textDefault"
        >
          {name}
        </Text>

        {when ? (
          <span className="inline-flex items-center gap-2 text-textSubdued">
            <IconCalendar size={16} stroke={1.75} aria-hidden />
            <Text variant="bodySm" color="subdued">
              {when}
            </Text>
          </span>
        ) : null}
        {location ? (
          <span className="inline-flex items-center gap-2 text-textSubdued">
            <IconMapPin size={16} stroke={2} aria-hidden />
            <Text variant="bodyMd" color="subdued">
              {location}
            </Text>
          </span>
        ) : null}

        <div className="flex items-center gap-2">
          <HostAvatar src={avatar} name={hostName} />
          {hostName && (
            <Text variant="bodySm" color="subdued">
              {hostName}
            </Text>
          )}
        </div>
      </div>
      <EventCover
        src={coverUrl}
        alt=""
        className="h-24 w-24 rounded-2 sm:h-32 sm:w-32"
      />
    </Link>
  );
}

function HostAvatar({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      <MediaImage
        src={src}
        alt={name || 'Host'}
        width={24}
        height={24}
        fallback="/profile.png"
        className="h-6 w-6 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-baseGraySlateSolid4"
      aria-label={name || 'Host'}
    >
      <IconUser
        size={16}
        stroke={1.75}
        className="text-baseGraySlateSolid11"
        aria-hidden
      />
    </span>
  );
}
