import {
  DataTable,
  Select,
  TextField
} from 'opub-ui';
import React from 'react';


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

  const handleChange = (e:any) => {
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

export const ResourceSchema = ({ setSchema, data }: any) => {

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

  return (
    <>
      <div className="mt-3">
        {data && data.length > 0 ? (
          <DataTable
            columns={generateColumnData()}
            rows={generateTableData(data)}
            hideFooter={false}
            hideSelection
          />
        ):<div className="mt-8 flex justify-center">Click on Reset Fields</div>}
      </div>
    </>
  );
};
