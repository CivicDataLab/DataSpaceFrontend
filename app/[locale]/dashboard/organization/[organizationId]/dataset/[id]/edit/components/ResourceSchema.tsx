import React from 'react';
import { graphql } from '@/gql';
import { useMutation } from '@tanstack/react-query';
import { Button, DataTable, Icon, IconButton, Spinner, Text } from 'opub-ui';
import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

export const ResourceSchema = ({ resourceId, data }: any) => {
  const table = {
    columns: [
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
      {
        header: 'DELETE',
        cell: ({ row }: any) => (
          <IconButton
            size="medium"
            icon={Icons.delete}
            color="interactive"
            onClick={(e) => console.log(row.original)}
          >
            Delete
          </IconButton>
        ),
      },
    ],
    rows: data
      .find((item: any) => item.id === resourceId)
      .schema.map((item: any) => ({
        fieldName: item.fieldName,
        description: item.description,
        format: item.format,
      })),
  };

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
      onSuccess: (data) => {
        console.log(data, '-data');
      },
      onError: (err: any) => {
        console.log('Error ::: ', err);
      },
    }
  );

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
        {isLoading ? (
          <div className=" mt-8 flex justify-center">
            <Spinner size={30} />
          </div>
        ) : (
          <DataTable
            columns={table.columns}
            rows={table.rows}
            hideFooter={true}
            defaultRowCount={10}
          />
        )}
      </div>
    </>
  );
};
