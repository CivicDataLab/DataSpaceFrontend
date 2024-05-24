import React from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Table, Icon, IconButton, Spinner, Text } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

export const ResourceSchema = ({
  resourceId,
  isPending,
  data,
  refetch,
}: any) => {
  
  const resetSchema: any = graphql(`
    mutation resetFileResourceSchema($resourceId: UUID!) {
      resetFileResourceSchema(resourceId: $resourceId) {
        ... on TypeResource {
          id
          schema {
            format
            description
            id
            fieldName
          }
        }
      }
    }
  `);

  const { mutate, isLoading } = useMutation(
    (data: { resourceId: string }) => GraphQL(resetSchema, data),
    {
      onSuccess: () => {
        refetch();
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

  const generateColumnData = () => {
    return [
      {
        accessorKey: 'fieldName',
        header: 'FIELD NAME',
      },
      {
        accessorKey: 'description',
        header: 'DESCRIPTION',
      },
      {
        accessorKey: 'format',
        header: 'FORMAT',
      },
    ];
  };

  const generateTableData = (data: any[]) => {
    return data.map((item: any) => ({
      fieldName: item.fieldName,
      description: item.description,
      format: item.format,
    }));
  };

  const setFields = () => {
    mutate({
      resourceId: resourceId,
    });
  };

  return (
    <>
      <div className="mt-8 flex justify-between">
        <Text>Fields in the Resource</Text>
        <div className="flex gap-4">
          <Button
            size="medium"
            kind="tertiary"
            variant="basic"
            onClick={setFields}
          >
            <div className="flex items-center gap-1">
              <Text>Reset Fields</Text>{' '}
              <Icon source={Icons.info} color="interactive" />
            </div>
          </Button>
        </div>
      </div>
      <Text variant="headingXs" as="span" fontWeight="regular">
        The Field settings apply to the Resource on a master level and can not
        be changed in Access Models.
      </Text>
      <div className="mt-3">
        {isPending || isLoading ? (
          <div className=" mt-8 flex justify-center">
            <Spinner size={30} />
          </div>
        ) : data && data.length > 0 ? (
          <Table
            columns={generateColumnData()}
            rows={generateTableData(data)}
            hideFooter={true}
          />
        ) : (
          <div className="flex justify-center mt-8">Click on Reset Fields</div>
        )}
      </div>
    </>
  );
};
