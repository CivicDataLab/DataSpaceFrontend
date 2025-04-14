'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { TypeUseCase } from '@/gql/generated/graphql';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import BreadCrumbs from '@/components/BreadCrumbs';
import PrimaryDetails from '../components/Details';
import Metadata from '../components/Metadata';

const UseCasedetails: any = graphql(`
  query UseCasedetails($pk: ID!) {
    useCase(pk: $pk) {
      id
      title
      summary
      website
      metadata {
        metadataItem {
          id
          label
          dataType
        }
        id
        value
      }
      sectors {
        id
        name
      }
      runningStatus
      tags {
        id
        value
      }
      publishers {
        name
        logo {
          path
        }
      }
      logo {
        name
        path
        url
      }
      datasets {
        title
        id
        downloadCount
        description
        organization {
          name
          logo {
            path
          }
        }
        metadata {
          metadataItem {
            id
            label
            dataType
          }
          id
          value
        }
        sectors {
          name
        }
        modified
      }
      contactEmail
      status
      slug
    }
  }
`);

const UseCaseDetailPage = () => {
  const params = useParams();
  console.log(params.useCaseSlug);
  const {
    data: UseCaseDetails,
    isLoading,
    refetch,
  } = useQuery<{ useCase: TypeUseCase }>(
    [`fetch_UsecaseDetails_${params.useCaseSlug}`],
    () =>
      GraphQL(
        UseCasedetails,
        {},
        {
          pk: params.useCaseSlug,
        }
      ),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  return (
    <div>
      {isLoading ? (
        <div className=" flex justify-center p-10">
          <Spinner />
        </div>
      ) : (
        <>
          <BreadCrumbs
            data={[
              { href: '/', label: 'Home' },
              { href: '/usecases', label: 'Use Cases' },
              { href: '#', label: UseCaseDetails?.useCase?.title || '' },
            ]}
          />
          <div className="flex flex-row  bg-surfaceDefault ">
            <div className="w-full border-r-2 border-solid border-greyExtralight p-8 lg:w-3/4 lg:p-10">
              <PrimaryDetails data={UseCaseDetails} isLoading={isLoading} />
            </div>
            <div className="hidden lg:block lg:w-1/4">
              <Metadata data={UseCaseDetails} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UseCaseDetailPage;
