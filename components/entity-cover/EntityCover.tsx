'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IconCalendar, IconMapPin, IconUser } from '@tabler/icons-react';

import { Icons } from '@/components/icons';
import MediaImage from '@/components/MediaImage';

export type EntityCoverPublisher = {
  name: string;
  href: string;
  imageSrc: string | null;
  imageAlt: string;
  kindLabel: string;
};

export type EntityCoverMeta = {
  id: 'location' | 'published';
  label: string;
};

type EntityCoverProps = {
  backHref: string;
  backLabel?: string;
  title: string;
  description?: string | null;
  imageSrc?: string | null;
  imageAlt: string;
  publisher?: EntityCoverPublisher | null;
  meta?: EntityCoverMeta[];
};

const META_ICON = {
  location: IconMapPin,
  published: IconCalendar,
} as const;

const PAGE_GUTTER =
  'mx-auto w-full max-w-[1760px] px-4 md:px-6 lg:px-8 xl:px-10';

export function EntityCover({
  backHref,
  backLabel = 'Back',
  title,
  description,
  imageSrc,
  imageAlt,
  publisher,
  meta = [],
}: EntityCoverProps) {
  return (
    <>
      <section className="bg-white">
        <div className={`${PAGE_GUTTER} pb-8 pt-10 sm:pt-14`}>
          <div className="mx-auto w-full max-w-6xl">
            <Link
              href={backHref}
              className="inline-flex w-fit items-center gap-1.5 rounded-1 text-100 font-medium leading-[18px] text-[#0a0a0a]/75 transition-colors hover:text-[#0a0a0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
            >
              <Icons.back
                size={16}
                stroke={2}
                className="shrink-0"
                aria-hidden
              />
              {backLabel}
            </Link>

            {meta.length > 0 ? <CoverMeta meta={meta} /> : null}

            <h1 className="mt-5 text-pretty font-primary text-[38px] font-semi-bold leading-[41.8px] text-[#0a0a0a]">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-3xl text-200 font-regular leading-[20px] text-[#0a0a0a]/75">
                {description}
              </p>
            ) : null}
            {publisher ? (
              <Link
                href={publisher.href}
                className="mt-6 inline-flex items-center gap-3 rounded-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
              >
                {publisher.imageSrc ? (
                  <MediaImage
                    src={publisher.imageSrc}
                    alt={publisher.imageAlt}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-baseGraySlateSolid4"
                    aria-hidden
                  >
                    <IconUser
                      size={22}
                      stroke={1.75}
                      className="text-baseGraySlateSolid11"
                    />
                  </span>
                )}
                <span>
                  <span className="block text-100 font-medium leading-[18px] text-[#0a0a0a]">
                    {publisher.name}
                  </span>
                  <span className="block text-75 font-regular leading-1 text-[#6B6B6B]">
                    {publisher.kindLabel}
                  </span>
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {imageSrc ? (
        <section className="bg-baseBlueSolid4">
          <div className={`${PAGE_GUTTER} py-8 sm:py-10`}>
            <div className="relative mx-auto aspect-[2/1] w-full max-w-6xl overflow-hidden rounded-[18px] lg:aspect-[21/8]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(min-width: 1024px) 1152px, 100vw"
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function CoverMeta({ meta }: { meta: EntityCoverMeta[] }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 text-100 text-textSubdued">
      {meta.map((item, index) => {
        const MetaIcon = META_ICON[item.id];
        return (
          <span key={item.id} className="inline-flex items-center gap-3">
            {index > 0 ? (
              <span className="h-4 w-px bg-baseGraySlateSolid6" aria-hidden />
            ) : null}
            <span className="inline-flex items-center gap-2">
              <MetaIcon
                size={16}
                stroke={item.id === 'location' ? 2 : 1.75}
                aria-hidden
              />
              {item.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
