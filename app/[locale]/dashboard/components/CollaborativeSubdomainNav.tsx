'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Text } from 'opub-ui';

import BhashiniTranslation from '@/components/BhashiniTranslation';

type Props = {
  useCasesTargetId?: string;
  datasetsTargetId?: string;
};



const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export function CollaborativeSubdomainNav({
  useCasesTargetId = 'collaborative-use-cases',
  datasetsTargetId = 'collaborative-datasets',
}: Props) {
  const params = useParams();
  const locale =
    typeof (params as any)?.locale === 'string'
      ? (params as any).locale
      : undefined;

  const platformBaseUrl = (process.env.NEXT_PUBLIC_PLATFORM_URL || '').replace(
    /\/$/,
    ''
  );
  const localeSegment = locale ? `/${locale}` : '';
  const listingHref = platformBaseUrl
    ? `${platformBaseUrl}${localeSegment}/collaboratives`
    : `${localeSegment}/collaboratives`;

  return (
    <nav className="z-50 sticky top-1 min-h-[80px] border-b-1 border-solid border-baseGraySlateSolid9 px-4 py-6 sm:py-8 md:py-5 lg:px-1 lg:py-3">
      <div className=" flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <Link href={listingHref}>
            <div className="flex items-center gap-2">
              <div className="group relative h-[35px] w-[130px] overflow-hidden md:h-[40px] md:w-[150px] lg:h-[68px] lg:w-[183px]">
                <div className="absolute inset-0">
                  <Image
                    src="/dataspacelogosep2025.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mr-10 flex items-center gap-6">
          <button
            type="button"
            onClick={() => scrollToId(useCasesTargetId)}
            className="cursor-pointer border-none bg-transparent p-0 outline-none"
          >
            <Text
              variant="headingMd"
              as="span"
              className="uppercase text-surfaceDefault hover:text-[#84DCCF]"
              fontWeight="semibold"
            >
              Use Cases
            </Text>
          </button>
          <button
            type="button"
            onClick={() => scrollToId(datasetsTargetId)}
            className="cursor-pointer border-none bg-transparent p-0 outline-none"
          >
            <Text
              variant="headingMd"
              as="span"
              className="uppercase text-surfaceDefault hover:text-[#84DCCF]"
              fontWeight="semibold"
            >
              Datasets
            </Text>
          </button>
          <BhashiniTranslation />
        </div>
      </div>
    </nav>
  );
}
