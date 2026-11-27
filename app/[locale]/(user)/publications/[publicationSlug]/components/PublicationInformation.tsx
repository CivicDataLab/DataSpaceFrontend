import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  IconArrowUpRight,
  IconBuilding,
  IconCalendarWeek,
  IconFileText,
  IconMapPin,
  IconScale,
  IconStack2,
  IconWorldMap,
} from '@tabler/icons-react';

import type { PublicationPublisher } from '../publication-detail';
import { CopyCitation } from './CopyCitation';
import { InitialsAvatar } from './PublicationCover';

type PublicationInformationProps = {
  resourceType: string | null;
  sectors: string[];
  geographies: string[];
  publishedOn: string | null;
  license: string | null;
  licenseTermsHref: string | null;
  publisher: PublicationPublisher | null;
  contributorNames: string[];
  sourceHref: string | null;
  citation: string;
};

export function PublicationInformation({
  resourceType,
  sectors,
  geographies,
  publishedOn,
  license,
  licenseTermsHref,
  publisher,
  contributorNames,
  sourceHref,
  citation,
}: PublicationInformationProps) {
  const type = resourceType ?? 'Publication';

  return (
    <section
      aria-labelledby="publication-information"
      className="box-border overflow-hidden rounded-[18px] border-1 border-solid border-[#e5e5e5] bg-white text-[#0a0a0a]"
    >
      <div className="border-b-1 border-solid border-[#e5e5e5] px-5 py-4">
        <h2
          id="publication-information"
          className="font-primary text-300 font-semi-bold leading-[26px] text-primaryBlue"
        >
          {type} information
        </h2>
      </div>

      <div className="flex flex-col gap-6 px-5 py-5">
        <dl className="m-0 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <InfoItem icon={IconFileText} label="Resource type" value={type} />
          {sectors.length > 0 ? (
            <InfoItem
              icon={IconStack2}
              label={sectors.length > 1 ? 'Sectors' : 'Sector'}
              value={sectors.join(', ')}
            />
          ) : null}
          {geographies.length > 0 ? (
            <InfoItem
              icon={IconMapPin}
              label={geographies.length > 1 ? 'Geographies' : 'Geography'}
              value={geographies.join(', ')}
            />
          ) : null}
          {publishedOn ? (
            <InfoItem
              icon={IconCalendarWeek}
              label="Published"
              value={publishedOn}
            />
          ) : null}
          {license ? (
            <InfoItem
              icon={IconScale}
              label="Licence"
              value={
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span>{license}</span>
                  {licenseTermsHref ? (
                    <a
                      href={licenseTermsHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-[2px] text-primaryBlue underline-offset-2 hover:underline focus-visible:underline"
                    >
                      View licence terms
                      <IconArrowUpRight size={14} aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ) : null}
                </span>
              }
            />
          ) : null}
          {publisher ? (
            <InfoItem
              icon={IconBuilding}
              label="Publisher"
              value={
                <Link
                  href={publisher.href}
                  className="text-[#0a0a0a] underline-offset-2 hover:text-primaryBlue hover:underline"
                >
                  {publisher.name}
                </Link>
              }
            />
          ) : null}
        </dl>

        {contributorNames.length > 0 ? (
          <Subsection id="publication-contributors" title="Contributors">
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {contributorNames.map((name) => (
                <li key={name} className="flex min-w-0 items-center gap-3">
                  <InitialsAvatar name={name} />
                  <span className="min-w-0 break-words text-100 font-medium leading-[17.5px] text-[#0a0a0a]">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          </Subsection>
        ) : null}

        {sourceHref ? (
          <Subsection id="publication-source" title="Source">
            <div className="flex items-start gap-4">
              <IconWorldMap
                size={24}
                stroke={1.5}
                className="mt-[2px] shrink-0 text-[#727272]"
                aria-hidden
              />
              <a
                href={sourceHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-baseline gap-1 break-words rounded-1 text-200 font-semi-bold leading-[24px] text-primaryBlue underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primaryBlue"
              >
                <span className="min-w-0 break-words">
                  Original publication
                </span>
                <IconArrowUpRight
                  size={16}
                  className="shrink-0 self-center"
                  aria-hidden
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </Subsection>
        ) : null}

        <Subsection id="publication-cite" title="Cite this">
          <CopyCitation citation={citation} />
        </Subsection>
      </div>
    </section>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconScale;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <Icon
        size={24}
        stroke={1.5}
        className="shrink-0 text-[#727272]"
        aria-hidden
      />
      <div className="min-w-0">
        <dt className="text-75 font-medium uppercase leading-1 tracking-[0.05em] text-[#6b6b6b]">
          {label}
        </dt>
        <dd className="m-0 mt-1 break-words text-100 leading-[20px] text-[#0a0a0a]">
          {value}
        </dd>
      </div>
    </div>
  );
}

function Subsection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 border-t-1 border-solid border-[#e5e5e5] pt-5"
    >
      <h3
        id={id}
        className="font-primary text-200 font-semi-bold leading-[20px] text-primaryBlue"
      >
        {title}
      </h3>
      {children}
    </section>
  );
}
