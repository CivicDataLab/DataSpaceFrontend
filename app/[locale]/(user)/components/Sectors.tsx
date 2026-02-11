'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Button, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { buildSectorSlugParam } from '@/lib/utils';
import { SectorListingSkeleton } from '@/components/loading';
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
    <div className="container pt-10 md:px-8 lg:pt-20">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 md:px-12 lg:gap-2 lg:px-12 ">
        <div className="flex flex-col gap-2">
          <Text variant="headingXl">Explore Sectors</Text>
          <Text variant="bodyLg" fontWeight="medium">
            Browse use cases and datasets organized by sector to find what
            matters most to your domain.
          </Text>
        </div>
        <div>
          <Button
            kind="primary"
            className=" bg-secondaryOrange text-basePureBlack"
            onClick={() => {
              router.push('/sectors');
            }}
          >
            <Text variant="bodyLg" fontWeight="semibold">
              Explore all Sectors
            </Text>
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
