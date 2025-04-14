'use client';

import Image from 'next/image';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Card, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';

const useCasesListQueryDoc: any = graphql(`
  query UseCasesList {
    useCases {
      id
      title
      summary
      slug
      datasetCount
      logo {
        path
      }
      created
      website
      contactEmail
    }
  }
`);

const UseCasesListingPage = () => {
  const getUseCasesList: {
    data: any;
    isLoading: boolean;
    error: any;
    isError: boolean;
  } = useQuery([`useCases_list_page`], () =>
    GraphQL(
      useCasesListQueryDoc,
      {
        // Entity Headers if present
      },
      []
    )
  );


  return (
    <main className="bg-baseGraySlateSolid2">
      <BreadCrumbs
        data={[
          { href: '/', label: 'Home' },
          { href: '#', label: 'Use Cases' },
        ]}
      />
      <div className=" bg-primaryBlue ">
        <div className="container flex flex-col-reverse justify-center gap-8 p-10 lg:flex-row ">
          <div className="flex flex-col justify-center gap-6">
            <Text variant="heading3xl" className=" text-surfaceDefault">
              Our Use Cases
            </Text>
            <Text
              variant="headingLg"
              fontWeight="regular"
              className=" text-surfaceDefault"
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
            className=" m-auto"
          />
        </div>
      </div>
      <div className="container p-10 py-20">
        <div>
          <Text variant="heading3xl">Explore Use Cases</Text>
        </div>
        <div className=" py-10">
          {getUseCasesList &&
            getUseCasesList?.data?.useCases.length > 0 &&
            getUseCasesList?.data?.useCases.map((item: any, index: any) => (
              <Card
                title={item.title}
                key={index}
                variation={'collapsed'}
                iconColor={'default'}
              />
            ))}
        </div>
      </div>
    </main>
  );
};

export default UseCasesListingPage;
