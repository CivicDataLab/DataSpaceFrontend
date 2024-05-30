import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Icon,
  Select,
  Sheet,
  Text,
  TextField,
} from 'opub-ui';
import { BarChart } from 'opub-ui/viz';

import { Icons } from '@/components/icons';

interface VisualizationProps {
  setType: any;
}

const ChartsVisualize: React.FC<VisualizationProps> = ({ setType }) => {
  console.log(setType);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div className="rounded-2 border-2 border-solid border-baseGraySlateSolid6 px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
          <Button
            onClick={(e) => {
              setType('list');
            }}
            kind="tertiary"
            className="flex text-start"
          >
            <span className="flex items-center gap-2">
              <Icon source={Icons.back} color="interactive" size={24} />
              <Text color="interactive">Charts Listing</Text>
            </span>
          </Button>
          <Sheet open={isSheetOpen}>
            <Sheet.Trigger>
              <Button onClick={() => setIsSheetOpen(true)}>
                Select Charts
              </Button>
            </Sheet.Trigger>
            <Sheet.Content side="bottom">
              <div className=" flex  flex-col gap-6 p-10">
                <div className="flex items-center justify-between">
                  <Text variant="bodyLg">Select Charts</Text>
                  <div className="flex items-center gap-3">
                    <Button onClick={(e) => setType('visualize')}>
                      Visualize Data
                    </Button>
                    <Button onClick={(e) => setType('img')}>Add Image</Button>
                    <Button
                      kind="tertiary"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Icon source={Icons.cross} size={24} />
                    </Button>
                  </div>
                </div>
              </div>
            </Sheet.Content>
          </Sheet>
        </div>
        <Divider />
        <div className="mt-8 flex flex-col gap-8">
          <TextField
            onChange={(e) => console.log('name', e)}
            label="Chart Name"
            name="name"
            required
            helpText="To know about best practices for naming Visualizations go to our User Guide"
          />
          <TextField
            onChange={(e) => console.log('description', e)}
            label="Description"
            name="description"
            multiline={4}
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 ">
            <Select
              name={'chartType'}
              options={[
                { label: 'Bar Vertical', value: 'BARV' },
                // { label: 'Bar Horizontal', value: 'BARH' },
                { label: 'Column', value: 'COLUMN' },
                { label: 'Line', value: 'LINE' },
              ]}
              label={'Select Chart Type'}
              placeholder="Select"
              onChange={(e) => console.log('type', e)}
            />
            <Select
              name={'res'}
              options={[]}
              label={'Select Resources'}
              placeholder="Select"
              onChange={(e) => console.log('res', e)}
            />
            <Select
              name={'x-axis'}
              options={[]}
              label={'X-axis Column'}
              placeholder="Select"
              onChange={(e) => console.log('x-axis', e)}
              helpText="Select the column which will be mapped on the X-axis"
            />
            <TextField
              onChange={(e) => console.log('x-axisLabel', e)}
              label="X-axis Label"
              name="x-axisLabel"
              required
            />
            <Select
              name={'y-axis'}
              options={[]}
              label={'Y-axis Column'}
              placeholder="Select"
              onChange={(e) => console.log('y-axis', e)}
              helpText="Select the column which will be mapped on the Y-axis"
            />
            <TextField
              onChange={(e) => console.log('y-axisLabel', e)}
              label="Y-axis Label"
              name="y-axisLabel"
              required
            />
            <Select
              name={'aggregate'}
              options={[
                { label: 'Sum', value: 'SUM' },
                { label: 'Average', value: 'AVERAGE' },
                { label: 'Count', value: 'COUNT' },
              ]}
              label={'Aggregate'}
              placeholder="Select"
              onChange={(e) => console.log('aggregate', e)}
            />
            <Checkbox name={'legend'}>
              Show Legend (Legend values will be taken from resource)
            </Checkbox>
          </div>
          <div className=" mb-6 p-8 text-center">
            <Text>Preview</Text>
            <BarChart
              height="400px"
              options={{
                xAxis: {
                  type: 'category',
                  data: ['Mon'],
                },
                yAxis: {
                  type: 'value',
                },
                series: [
                  {
                    data: [120],
                    type: 'bar',
                    name: 'Sales',
                    color: 'rgb(55,162,218)',
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartsVisualize;
