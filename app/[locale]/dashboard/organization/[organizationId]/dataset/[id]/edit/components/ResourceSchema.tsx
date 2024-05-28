import React from 'react';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { SchemaUpdateInput } from '@/gql/generated/graphql';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  DataTable,
  Icon,
  Select,
  Spinner,
  Text,
  TextField,
} from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';

export const updateSchema: any = graphql(`
  mutation updateSchema($input: SchemaUpdateInput!) {
    updateSchema(input: $input) {
      __typename
      ... on TypeResource {
        id
      }
    }
  }
`);

const DescriptionCell = ({
  value,
  rowIndex,
  handleFieldChange,
}: {
  value: string;
  rowIndex: any;
  handleFieldChange: any;
}) => {
  const [description, setDescription] = React.useState(value || '');

  const handleChange = (text: string) => {
    setDescription(text);
    handleFieldChange('description', text, rowIndex);
  };

  return (
    <TextField
      label="Description"
      labelHidden
      name="description"
      type="text"
      value={description}
      onChange={(e: any) => handleChange(e)}
    />
  );
};

export const ResourceSchema = ({
  setSchema,
  resourceId,
  isPending,
  data,
  refetch,
}: any) => {

  const transformedData = data.map((item: any) => ({
    schemaId: parseInt(item.id, 10),
    format: item.format,
    description: item.description,
  }));
  const [updatedData, setUpdatedData] = React.useState<any>(transformedData);

  React.useEffect(() => {
    if (data && data.length > 0) {
      setUpdatedData(transformedData);
    }
  }, [data]);

  const handleFieldChange = (
    field: string,
    newValue: string,
    rowIndex: any
  ) => {
    setUpdatedData((prev: any) => {
      const newData = [...prev];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [field]: newValue,
      };
      return newData;
    });
  };

  setSchema(updatedData);

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

  const options = [
    {
      label: 'Integer',
      value: 'INTEGER',
    },
    {
      label: 'String',
      value: 'STRING',
    },
  ];

  const generateColumnData = () => {
    return [
      {
        accessorKey: 'fieldName',
        header: 'FIELD NAME',
      },
      {
        accessorKey: 'description',
        header: 'DESCRIPTION',
        cell: (info: any) => {
          const rowIndex = info.row.index;
          const description = updatedData[rowIndex]?.description || '';
          return (
            <DescriptionCell
              value={description}
              rowIndex={rowIndex}
              handleFieldChange={handleFieldChange}
            />
          );
        },
      },
      {
        accessorKey: 'format',
        header: 'FORMAT',
        cell: (info: any) => {
          const rowIndex = info.row.index;
          const format = updatedData[rowIndex]?.format || '';
          return (
            <Select
              label="Resource List"
              labelHidden
              options={options}
              value={format}
              onChange={(e) => handleFieldChange('format', e, rowIndex)}
              name="Select format"
            />
          );
        },
      },
    ];
  };

  const generateTableData = (updatedData: any[]) => {
    return updatedData.map((item: any) => ({
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
          <DataTable
            columns={generateColumnData()}
            rows={generateTableData(data)}
            hideFooter={true}
            hideSelection
          />
        ) : (
          <div className="mt-8 flex justify-center">Click on Reset Fields</div>
        )}
      </div>
    </>
  );
};
