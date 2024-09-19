'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useQuery } from '@tanstack/react-query';
import { Button, Spinner, Tag, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const datasetResourceQuery = graphql(`
  query datasetResources($datasetId: UUID!) {
    datasetResources(datasetId: $datasetId) {
      id
      created
      modified
      type
      name
      description
      accessModels {
        name
        description
        type
        modelResources {
          fields {
            format
            fieldName
            description
          }
        }
      }
      schema {
        fieldName
        id
        format
        description
      }
      fileDetails {
        format
      }
    }
  }
`);

const Resources = () => {
  const params = useParams();

  const { data, isLoading } = useQuery(
    [`resources_${params.datasetIdentifier}`],
    () => GraphQL(datasetResourceQuery, { datasetId: params.datasetIdentifier })
  );

  // Use an object to manage the expanded state for each resource individually
  const [showMore, setShowMore] = useState<{ [key: number]: boolean }>({});
  const [isDescriptionLong, setIsDescriptionLong] = useState<{ [key: number]: boolean }>({});

  const descriptionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Toggle showMore for a specific resource
  const toggleShowMore = (index: number) => {
    setShowMore((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // Measure the height of the description and set the `isDescriptionLong` flag accordingly
  useEffect(() => {
    descriptionRefs.current.forEach((descriptionElement, index) => {
      if (descriptionElement) {
        const isLong = descriptionElement.scrollHeight > descriptionElement.clientHeight;
        setIsDescriptionLong((prevState) => ({
          ...prevState,
          [index]: isLong,
        }));
      }
    });
  }, [data]);

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : data && data?.datasetResources?.length > 0 ? (
        <>
          <Text variant="bodyLg" className="mx-6 lg:mx-0">
            Downloadable Resources
          </Text>
          <div className="mx-6 lg:mx-0 mt-5 flex flex-col gap-8 bg-surfaceDefault p-6">
            {data?.datasetResources.map((item: any, index: number) => (
              <div key={index} className="flex flex-wrap justify-between gap-4">
                <div className="gap flex flex-col lg:w-4/5">
                  <div className="item flex gap-2 items-center">
                    <Text variant="headingMd">{item.name}</Text>
                    <Tag>{item.fileDetails.format}</Tag>
                  </div>
                  <div>
                    <Text>Updated:</Text>
                    <Text>{formatDate(item.modified)}</Text>
                  </div>
                  <div className="flex flex-col">
                    <div
                      ref={(el) => (descriptionRefs.current[index] = el)}
                      className={!showMore[index] ? 'line-clamp-2' : ''}
                    >
                      <Text>{item.description}</Text>
                    </div>
                    {isDescriptionLong[index] && (
                      <Button
                        className="self-start p-2"
                        onClick={() => toggleShowMore(index)}
                        variant="interactive"
                        size="slim"
                        kind="tertiary"
                      >
                        {showMore[index] ? 'Show less' : 'Show more'}
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Link
                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/resource/${item.id}`}
                    target="_blank"
                    className="flex justify-center"
                  >
                    <Button>Download</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        ''
      )}
    </div>
  );
};

export default Resources;
