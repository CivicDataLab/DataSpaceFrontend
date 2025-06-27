'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { graphql } from '@/gql';
import { ResourceChartImageInputPartial } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Text, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Loading } from '@/components/loading';
import TitleBar from '../../../components/title-bar';

const getResourceChartImageDetailsDoc: any = graphql(`
  query getResourceChartImageDetails($imageId: UUID!) {
    resourceChartImage(imageId: $imageId) {
      description
      dataset {
        id
        title
        slug
      }
      id
      name
      image {
        name
        path
        size
        url
        width
        height
      }
      status
    }
  }
`);

const updateResourceChartImageDoc: any = graphql(`
  mutation updateResourceCHartImage($input: ResourceChartImageInputPartial!) {
    updateResourceChartImage(input: $input) {
      __typename
      ... on TypeResourceChartImage {
        id
        name
      }
    }
  }
`);

const publishResourceChartImageDoc: any = graphql(`
  mutation publishResourceChartImage($resourceChartImageId: UUID!) {
    publishResourceChartImage(resourceChartImageId: $resourceChartImageId)
  }
`);

/**
 * Renders a page for chart image preview.
 *
 * @param {{ params: { entityType: string, entitySlug: string, chartID: string } }} props
 * @returns {JSX.Element}
 */
const ChartImagePreview = ({ params }: { params: any }) => {
  const getResourceChartDetailsRes: {
    data: any;
    isLoading: boolean;
    refetch: any;
    error: any;
    isError: boolean;
  } = useQuery([`getResourceChartImageDetails_${params.chartID}`], () =>
    GraphQL(
      getResourceChartImageDetailsDoc,
      {
        [params.entityType]: params.entitySlug,
      },
      {
        imageId: params.chartID,
      }
    )
  );

  const [chartTitle, setChartTitle] = useState('');

  useEffect(() => {
    setChartTitle(getResourceChartDetailsRes?.data?.resourceChartImage?.name);
  }, [getResourceChartDetailsRes?.data]);

  const updateResourceChartImageMutation: { mutate: any; isLoading: any } =
    useMutation(
      (data: { input: ResourceChartImageInputPartial }) =>
        GraphQL(
          updateResourceChartImageDoc,
          {
            [params.entityType]: params.entitySlug,
          },
          data
        ),
      {
        onSuccess: () => {
          toast('ChartImage Updated Successfully');
          getResourceChartDetailsRes.refetch();
        },
        onError: (err: any) => {
          toast(`Received ${err} while updating chart `);
        },
      }
    );

  const publishResourceChartImageMutation: { mutate: any; isLoading: any } =
    useMutation(
      (data: { resourceChartImageId: string }) =>
        GraphQL(
          publishResourceChartImageDoc,
          {
            [params.entityType]: params.entitySlug,
          },
          data
        ),
      {
        onSuccess: () => {
          toast('Chart Image Published Successfully');
          getResourceChartDetailsRes.refetch();
        },
        onError: (err: any) => {
          toast(`Received ${err} while publishing chart `);
        },
      }
    );

  return (
    <div>
      <TitleBar
        label={'CHART NAME'}
        title={chartTitle}
        goBackURL={`/dashboard/${params.entityType}/${params.entitySlug}/charts`}
        onSave={(val: any) => {
          console.log(val);
          updateResourceChartImageMutation.mutate({
            input: {
              id: params.chartID,
              dataset:
                getResourceChartDetailsRes?.data?.resourceChartImage?.dataset
                  ?.id,
              name: val,
            },
          });
        }}
        loading={getResourceChartDetailsRes.isLoading}
        status={
          updateResourceChartImageMutation.isLoading ? 'loading' : 'success'
        }
        setStatus={() => {}}
      />

      {getResourceChartDetailsRes?.isError ? (
        <div>
          <Text variant="heading2xl">Something went wrong</Text>
        </div>
      ) : getResourceChartDetailsRes?.isLoading ? (
        <Loading />
      ) : (
        <div className="border-t-2 border-solid border-greyExtralight pt-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative aspect-video w-full max-w-5xl">
              <Image
                src={
                  process.env.NEXT_PUBLIC_BACKEND_URL +
                  getResourceChartDetailsRes?.data?.resourceChartImage?.image
                    ?.url
                }
                alt={getResourceChartDetailsRes?.data?.resourceChartImage?.name}
                //   width={
                //     getResourceChartDetailsRes?.data?.resourceChartImage?.image
                //       ?.width
                //   }
                //   height={
                //     getResourceChartDetailsRes?.data?.resourceChartImage?.image
                //       ?.height
                //   }
                fill
                className="rounded-4 border-1 border-solid border-greyExtralight object-contain"
              />
            </div>

            {getResourceChartDetailsRes?.data?.resourceChartImage?.status ===
            'DRAFT' ? (
              <Button
                kind="primary"
                onClick={() => {
                  publishResourceChartImageMutation.mutate({
                    resourceChartImageId: params.chartID,
                  });
                }}
              >
                Publish Chart
              </Button>
            ) : getResourceChartDetailsRes?.data?.resourceChartImage?.status ===
              'PUBLISHED' ? (
              <Button
                kind="primary"
                onClick={() => {
                  console.log('unpublish');
                }}
              >
                UnPublish Chart
              </Button>
            ) : (
              <Button kind="primary" disabled>
                Publish Chart
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartImagePreview;
