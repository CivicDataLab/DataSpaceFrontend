import React from 'react';
import { Button, Icon, Sheet, Text } from 'opub-ui';
import { Icons } from '@/components/icons';
import { ResourceData } from '../types';

interface ChartHeaderProps {
  setType: (type: string) => void;
  setChartId: (id: string) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  resourceChart: {
    mutate: (data: { resource: string }) => void;
    isLoading: boolean;
  };
  resourceData: ResourceData;
  chartsList: {
    chartsDetails: Array<{
      id: string;
      name: string;
    }>;
  } | null;
  chartId: string;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({
  setType,
  setChartId,
  isSheetOpen,
  setIsSheetOpen,
  resourceChart,
  resourceData,
  chartsList,
  chartId,
}) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
      <Button
        onClick={() => {
          setType('list');
          setChartId('');
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
          <div className="flex flex-col gap-6 p-10">
            <div className="flex items-center justify-between">
              <Text variant="bodyLg">Select Charts</Text>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() =>
                    resourceChart.mutate({
                      resource: resourceData?.datasetResources[0].id,
                    })
                  }
                >
                  Visualize Data
                </Button>
                <Button
                  kind="tertiary"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <Icon source={Icons.cross} size={24} />
                </Button>
              </div>
            </div>
            {chartsList?.chartsDetails.map((item, index) => (
              <div
                key={index}
                  className={`rounded-1 border-1 border-solid border-baseGraySlateSolid6 px-6 py-3 ${chartId === item.id ? ' bg-baseGraySlateSolid5' : ''}`}
              >
                <Button
                    kind={'tertiary'}
                  className="flex w-full justify-start"
                  disabled={chartId === item.id}
                  onClick={() => {
                    setChartId(item.id);
                    setIsSheetOpen(false);
                  }}
                >
                  {item.name}
                </Button>
              </div>
            ))}
          </div>
        </Sheet.Content>
      </Sheet>
    </div>
  );
};

export default ChartHeader;
