import React from 'react';
import { DataTable, TextField } from 'opub-ui';

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

  const handleChange = (e: any) => {
    setDescription(e?.target?.value);
    handleFieldChange('description', e?.target?.value, rowIndex);
  };

  return (
    <TextField
      label="Description"
      labelHidden
      name="description"
      type="text"
      defaultValue={description}
      onBlur={(e: any) => handleChange(e)}
    />
  );
};

export const ResourceSchema = ({
  setSchema,
  data,
  mutate,
  resourceId,
}: any) => {
  const [updatedData, setUpdatedData] = React.useState<any>(data);

  React.useEffect(() => {
    if (data) {
      setUpdatedData(data);
    }
  }, [data]);

  const handleFieldChange = (
    field: string,
    newValue: string,
    rowIndex: any
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

  const handleSave = (newdata: any) => {
    const isSchemaChanged = JSON.stringify(newdata) !== JSON.stringify(data);
    if (isSchemaChanged) {
      mutate({
        schemaUpdateInput: {
          resource: resourceId,
          updates: newdata?.map((item: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { fieldName, ...rest } = item;
            return rest;
          }),
        },
      });
    }
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
      },
    ];
  };

  const generateTableData = (updatedData: any[]) => {
    return updatedData?.map((item: any) => ({
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
