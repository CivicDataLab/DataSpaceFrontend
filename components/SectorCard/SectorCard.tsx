'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Divider, Text, Tooltip } from 'opub-ui';

export interface SectorCardSector {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  datasetCount: number;
}

interface SectorCardProps {
  sector: SectorCardSector;
  href: string;
  /** Show tooltip on sector name (useful when name may truncate). Default: false */
  showNameTooltip?: boolean;
  /** Optional className for the Link wrapper */
  className?: string;
}

export const SectorCard = ({
  sector,
  href,
  showNameTooltip = false,
  className,
}: SectorCardProps) => {
  const nameElement = (
    <Text
      variant="headingLg"
      fontWeight="semibold"
      className={
        showNameTooltip
          ? 'line-clamp-1 overflow-hidden text-ellipsis'
          : undefined
      }
    >
      {sector.name}
    </Text>
  );

  return (
    <Link href={href} className={className ?? 'h-full'}>
      <div className="flex h-[168px] w-full max-w-[390px] flex-none flex-row items-center justify-between gap-5 rounded-4 bg-[#F6F6F7] p-7 transition-transform duration-300 ease-in-out hover:shadow-basicMd">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-2">
            {showNameTooltip ? (
              <Tooltip content={sector.name}>{nameElement}</Tooltip>
            ) : (
              nameElement
            )}
            <Divider className="h-[1px] bg-baseGraySlateAlpha3" />
          </div>
          {sector.description && (
            <Text variant="bodySm" className="line-clamp-2">
              {sector.description}
            </Text>
          )}
          <div className="flex gap-1">
            <Text
              variant="bodyMd"
              fontWeight="bold"
              className="text-primaryBlue"
            >
              {sector.datasetCount}
            </Text>
            <Text variant="bodyMd" className="text-baseGraySlateAlpha12">
              Datasets
            </Text>
          </div>
        </div>
        <div className="flex shrink-0">
          <Image
            src={`/Sectors/${sector.name}.svg`}
            width={40}
            height={40}
            alt={`${sector.name} sector`}
          />
        </div>
      </div>
    </Link>
  );
};
