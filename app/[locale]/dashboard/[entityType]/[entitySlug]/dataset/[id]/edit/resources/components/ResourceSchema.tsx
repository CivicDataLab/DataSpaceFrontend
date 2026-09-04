import React from 'react';
import { FieldType, SchemaUpdate, SchemaUpdateInput } from '@/gql/generated/graphql';
import { DataTable, TextField } from 'opub-ui';

interface SchemaRow {
  id?: string;
  fieldName?: string | null;
  format?: string | null;
  description?: string | null;
}

interface SchemaCellInfo {
  row: { index: number };
}

interface ResourceSchemaProps {
  setSchema: (schema: SchemaRow[]) => void;
  data: SchemaRow[];
  mutate: (data: { schemaUpdateInput: SchemaUpdateInput }) => void;
  resourceId: string | null;
}

const DescriptionCell = ({
  value,
  rowIndex,
  handleFieldChange,
}: {
  value: string;
  rowIndex: number;
  handleFieldChange: (field: string, newValue: string, rowIndex: number) => void;
}) => {
  const [description, setDescription] = React.useState(value || '');

  const handleChange = (e?: React.FocusEvent) => {
    const target = e?.target;
    const nextValue =
      target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
        ? target.value
        : '';
    setDescription(nextValue);
    handleFieldChange('description', nextValue, rowIndex);
  };

  return (
    <TextField
      label="Description"
      labelHidden
      name="description"
      type="text"
      defaultValue={description}
      onBlur={handleChange}
    />
  );
};

export const ResourceSchema = ({
  setSchema,
  data,
  mutate,
  resourceId,
}: ResourceSchemaProps) => {
  const [updatedData, setUpdatedData] = React.useState<SchemaRow[]>(data);
  const [prevData, setPrevData] = React.useState(data);
  if (data !== prevData) {
    setPrevData(data);
    if (data) {
      setUpdatedData(data);
    }
  }

  const handleFieldChange = (
    field: string,
    newValue: string,
    rowIndex: number
  ) => {
    const newData = [...updatedData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [field]: newValue,
    };

    setUpdatedData(newData);
    setSchema(newData);
    handleSave(newData);
  };

  const toFieldType = (format: string | null | undefined): FieldType | null => {
    switch (format) {
      case FieldType.Date:
      case FieldType.Integer:
      case FieldType.Number:
      case FieldType.String:
        return format;
      default:
        return null;
    }
  };

  const handleSave = (newdata: SchemaRow[]) => {
    const isSchemaChanged = JSON.stringify(newdata) !== JSON.stringify(data);
    if (!isSchemaChanged || !resourceId) {
      return;
    }

    const updates: SchemaUpdate[] = newdata.flatMap((item) => {
      if (!item.id) {
        return [];
      }
      const format = toFieldType(item.format);
      if (!format) {
        return [];
      }
      return [
        {
          id: item.id,
          description: item.description ?? '',
          format,
        },
      ];
    });

    mutate({
      schemaUpdateInput: {
        resource: resourceId as `${string}-${string}-${string}-${string}-${string}`,
        updates,
      },
    });
  };

  const generateColumnData = () => {
    return [
      {
        accessorKey: 'fieldName',
        header: 'FIELD NAME',
      },
      {
        accessorKey: 'description',
        header: 'DESCRIPTION',
        cell: (info: SchemaCellInfo) => {
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
      },
    ];
  };

  const generateTableData = (rows: SchemaRow[]) => {
    return rows?.map((item) => ({
      fieldName: item?.fieldName,
      description: item?.description,
      format: item?.format,
    }));
  };

  return (
    <>
      <div className="mt-3">
        {data && data.length > 0 ? (
          <DataTable
            columns={generateColumnData()}
            rows={generateTableData(updatedData)}
            hideFooter={false}
            hideSelection
          />
        ) : (
          <div className="mt-8 flex justify-center">Failed to Generate Schema</div>
        )}
      </div>
    </>
  );
};
