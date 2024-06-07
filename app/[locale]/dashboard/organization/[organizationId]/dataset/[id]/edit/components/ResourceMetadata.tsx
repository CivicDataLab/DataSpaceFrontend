'use client';

import { graphql } from '@/gql';
import { TypeMetadata } from '@/gql/generated/graphql';
import { useQuery } from '@tanstack/react-query';
import {
  Input,
  Text,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Loading } from '@/components/loading';

export const ResourceMetadata = () => {
  
  const metadataQueryDoc: any = graphql(`
    query MetaDataList($filters: MetadataFilter) {
      metadata(filters: $filters) {
        id
        label
        dataStandard
        urn
        dataType
        options
        validator
        type
        model
        enabled
        filterable
      }
    }
  `);

  const getMetaDataListQuery: {data: any; isLoading: boolean; refetch: any} = 
   useQuery([`resource_metadata`], () =>
    GraphQL(metadataQueryDoc, {
      filters: {
        model: 'RESOURCE',
        enabled: true,
      },
    })
  );

  return (
    <div>
      {getMetaDataListQuery.isLoading ? (
        <Loading />
      ) : getMetaDataListQuery?.data?.metadata?.length > 0 ? (
        <>
          <div className="flex flex-col gap-1 mt-4">
            <Text variant="headingMd"> Metadata</Text>
          </div>

          <div className="flex flex-wrap">
            {getMetaDataListQuery?.data?.metadata?.map(
              (metadataFormItem: TypeMetadata) => {
                if (metadataFormItem.dataType === 'STRING') {
                  return (
                    <div
                      key={metadataFormItem.id}
                      className="w-full py-4 pr-4 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2"
                    >
                      <Input
                        name={metadataFormItem.id}
                        label={metadataFormItem.label}
                        disabled={
                          getMetaDataListQuery.isLoading ||
                          !metadataFormItem.enabled
                        }
                      />
                    </div>
                  );
                }
                return null;
              }
            )}
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
