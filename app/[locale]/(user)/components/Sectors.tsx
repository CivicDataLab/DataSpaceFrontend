'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Button, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { buildSectorSlugParam } from '@/lib/utils';
import { SectorListingSkeleton } from '@/components/loading';
import { Icons } from '@/components/icons';
import { SectorCard } from '@/components/SectorCard';

const sectorDetails = graphql(`
  query SectorsList {
    activeSectors {
      id
      name
      description
      slug
      datasetCount
    }
  }
`);

const Sectors = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['sectors_list'],
    queryFn: () => GraphQL(sectorDetails, {}),
  });
  const router = useRouter();

  return (
    <div className="container pt-10 pb-12 md:px-8 lg:pt-20 lg:pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 md:px-12 lg:gap-2 lg:px-12 ">
        <div className="flex flex-col gap-2">
          <Text variant="headingXl">Explore Sectors</Text>
          <Text variant="bodyLg" fontWeight="medium">
            Browse use cases and datasets organized by sector to find what
            matters most to your domain.
          </Text>
        </div>
        <div className="mr-8 lg:mr-12">
          <Button
            kind="tertiary"
            className="bg-transparent border-none shadow-none text-primaryText px-0 hover:underline"
            onClick={() => {
              router.push('/sectors');
            }}
          >
            <span className="flex items-center gap-2">
              <Text variant="bodyLg" fontWeight="semibold" color="inherit">
                Explore all Sectors
              </Text>
              <Icons.arrowRight size={18} />
            </span>
          </Button>
        </div>
      </div>
      {isLoading ? (
        <SectorListingSkeleton cardCount={9} />
      ) : (
        <div className="mt-6 grid w-full grid-cols-1 gap-10 px-4 md:grid-cols-2 md:px-12 lg:mt-12 lg:grid-cols-3 lg:px-12">
          {data?.activeSectors.map((sector: any) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              href={`/sectors/${sector.slug}?size=9&page=1&sort=recent&sectors=${buildSectorSlugParam(sector.slug)}`}
              className="min-w-[280px] flex-1"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Sectors;
