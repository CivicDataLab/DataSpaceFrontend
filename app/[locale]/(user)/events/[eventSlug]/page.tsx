import { notFound } from 'next/navigation';
import { Text } from 'opub-ui';

import { GraphQLPublic } from '@/lib/api';
import { lumaCover } from '@/lib/luma-cover';
import { generatePageMetadata } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import {
  EntityCover,
  type EntityCoverMeta,
} from '@/components/entity-cover/EntityCover';
import { formatEventRange } from '../format';
import { eventHost } from '../host';
import { eventBySlugQuery } from '../queries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  try {
    const result = await GraphQLPublic(
      eventBySlugQuery,
      {},
      { publicId: eventSlug }
    );
    const event = result.eventBySlug;
    const title = event?.name?.trim() || 'Event';
    return generatePageMetadata({
      title: `${title} | Events | CivicDataSpace`,
      description: event?.location?.trim() || title,
      keywords: ['Events', 'CivicDataSpace'],
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/events/${eventSlug}`,
        title,
        description: event?.location?.trim() || title,
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  } catch {
    return generatePageMetadata({
      title: 'Event | CivicDataSpace',
      description: 'An event on CivicDataSpace.',
      keywords: ['Events'],
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/events/${eventSlug}`,
        title: 'Event | CivicDataSpace',
        description: 'An event on CivicDataSpace.',
        siteName: 'CivicDataSpace',
        image: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/og.png`,
      },
    });
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const result = await GraphQLPublic(
    eventBySlugQuery,
    {},
    { publicId: eventSlug }
  ).catch(() => null);
  const event = result?.eventBySlug;
  if (!event) notFound();

  const name = event.name?.trim() || 'Untitled event';
  const cover = await lumaCover(event.lumaEmbed?.src);
  const when = formatEventRange(event.startDate, event.endDate, cover.startAt);
  const host = eventHost(event);
  const location = event.location?.trim() || '';
  const meta: EntityCoverMeta[] = [];
  if (location) meta.push({ id: 'location', label: location });
  if (when) meta.push({ id: 'published', label: when });

  return (
    <>
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '/events', label: 'Events' },
          { href: '#', label: name },
        ]}
      />
      <EntityCover
        backHref="/events"
        backLabel="Events"
        title={name}
        // imageSrc={cover.coverUrl}
        imageAlt={name}
        publisher={host}
        meta={meta}
      />
      <div className="bg-white">
        <div className="mx-auto w-full max-w-[1760px] px-4 py-8 md:px-6 lg:px-8 lg:py-12 xl:px-10">
          <div className="mx-auto w-full max-w-6xl">
            {event.lumaEmbed?.src ? (
              <iframe
                src={event.lumaEmbed.src}
                title={name}
                className="h-[640px] w-full rounded-3 border-1 border-solid border-borderSubdued"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
              />
            ) : (
              <Text color="subdued">
                This event does not have an embed yet.
              </Text>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
