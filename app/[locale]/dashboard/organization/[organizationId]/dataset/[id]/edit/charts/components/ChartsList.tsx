import React from 'react';
import { Button, DataTable, SearchInput, Text } from 'opub-ui';

interface ChartsListProps {
  setType: any;
  type: any;
}

const ChartsList: React.FC<ChartsListProps> = ({ setType, type }) => {
  // useEffect(() => {
  //   refetch();
  // }, [type]);

  return (
    <>
      {/* <div className="flex flex-col items-center gap-6">
        <Text>* Adding Visualizations is Optional and can be skipped.</Text>
        <Text>
          ** Visualizations will appear separately in the Visualizations tab of
          the dataset details. They are not a part of any Access type.
        </Text>

        <Button className=" w-60">Visualize Data</Button>
        <Button className=" w-60">Add Image</Button>
      </div> */}
      <div className=" my-6 flex flex-wrap items-center justify-between gap-3 px-3 py-4">
        <Text>Showing Access Types</Text>
        <SearchInput
          className="w-1/2 "
          placeholder="Search in Resources"
          label="Search"
          name="Search"
          onChange={(e) => console.log(e)}
        />
        <div className="flex gap-3">
          <Button onClick={(e) => setType('visualize')}>Visualize Data</Button>
          <Button onClick={(e) => setType('img')}>Add Image</Button>
        </div>
      </div>
      {/* <DataTable
        columns={generateColumnData()}
        rows={generateTableData(data.accessModelResources)}
        hideSelection
        truncate
        hideFooter
      /> */}
    </>
  );
};

export default ChartsList;
