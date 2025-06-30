'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query'; // ✅ Ensure this is correct

import { Button, Divider, Spinner, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';

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
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['sectors_list'], // ✅ Fix queryKey syntax
    queryFn: () => GraphQL(sectorDetails, {}),
  });
  const router = useRouter();
  function capitalizeWords(name: any) {
    return name
      .split('-') // Split by '-'
      .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join('+'); // Join with '+'
  }
  return (
    <div className="container pt-10 md:px-8 lg:pt-20">
      <div className="flex flex-col gap-2 px-4 md:px-12 lg:px-12 ">
        <Text variant="heading3xl">Explore Sectors</Text>
        <div className="flex flex-wrap justify-between gap-2">
          <Text variant="headingLg" fontWeight="medium">
            Classification of all Use Cases and Datasets on the Asia-Pacific
            Climate Data Collaborative{' '}
          </Text>
          <Button
            kind="primary"
            className=" bg-secondaryOrange text-basePureBlack"
            onClick={() => {
              router.push('/sectors');
            }}
          >
            Explore all Sectors
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="m-4 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="mt-12 grid w-full grid-cols-1 gap-6 px-4 md:grid-cols-2 md:px-12 lg:grid-cols-3 lg:px-12">
          {data?.activeSectors.map((sectors: any) => (
            <Link
              href={`/sectors/${sectors.slug}?size=9&page=1&sort=recent&sectors=${capitalizeWords(sectors.slug)}`}
              key={sectors.id}
            >
              <div className="flex w-full items-center gap-5 rounded-4 bg-surfaceDefault p-7 shadow-card">
                <div className="flex gap-4">
                  <Image
                    src={`/Sectors/${sectors.name}.svg`}
                    width={80}
                    height={80}
                    alt={'Sectors Logo'}
                  />
                </div>
                <div className="flex w-full flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <Text variant="headingLg" fontWeight="semibold">
                      {sectors.name}
                    </Text>
                    <Divider />
                  </div>
                  <div className="flex gap-1">
                    <Text
                      variant="bodyMd"
                      fontWeight="bold"
                      className=" text-primaryBlue"
                    >
                      {sectors.datasetCount}
                    </Text>
                    <Text variant="bodyMd">Datasets</Text>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sectors;
