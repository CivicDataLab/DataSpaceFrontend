'use client';

import Image from 'next/image';
import { fetchUseCases } from '@/fetch';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Card, Spinner, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';
import ListingComponent from '../components/ListingComponent';

const breadcrumbData = [
  { href: '/', label: 'Home' },
  { href: '#', label: 'Use Cases' },
];

const UseCasesListingPage = () => {
  return (
    <main>
      <BreadCrumbs data={breadcrumbData} />
      <div className=" bg-primaryBlue ">
        <div className="container flex flex-col-reverse justify-center gap-8 p-10 lg:flex-row ">
          <div className="flex flex-col justify-center gap-6">
            <Text variant="heading2xl" className=" text-surfaceDefault">
              Our Use Cases
            </Text>
            <Text
              variant="headingLg"
              fontWeight="regular"
              className=" leading-3 text-surfaceDefault lg:leading-5"
            >
              By Use case we mean any specific sector or domain data led
              interventions that can be applied to address some of the most
              pressing concerns from hyper-local to the global level
              simultaneously.
            </Text>
          </div>
          <Image
            src={'/Usecase_illustration.png'}
            width={600}
            height={316}
            alt={'Usecase Illustration'}
            className=" m-auto h-auto w-full"
          />
        </div>
      </div>
      <div className="container p-6 lg:p-10 lg:pb-20">
        <div>
          <Text variant="heading2xl" fontWeight="bold">
            Explore Use Cases
          </Text>
        </div>
        <ListingComponent
          fetchDatasets={fetchUseCases}
          placeholder="Start typing to search for any Use Case"
          redirectionURL={`/usecases`}
        />
      </div>
    </main>
  );
};

export default UseCasesListingPage;
