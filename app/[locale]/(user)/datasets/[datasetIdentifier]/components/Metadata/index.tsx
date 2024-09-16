import React from 'react';
import { Button, Icon, Tag, Text } from 'opub-ui';

import { formatDate, toTitleCase } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface MetadataProps {
  data: any;
  setOpen?: (isOpen: boolean) => void;
}

const MetadataComponent: React.FC<MetadataProps> = ({ data, setOpen }) => {
  const filteredMetadataArray = data.metadata.filter(
    (item: any) =>
      item.metadataItem.label !== 'Source Website' &&
      item.metadataItem.label !== 'Github Repo Link' &&
      item.metadataItem.label !== 'Source'
  );
  console.log(data);

  return (
    <div className="rounded-md shadow-md flex flex-col gap-6 bg-surfaceDefault px-8 py-6">
      <div className="flex items-center justify-between">
        <Text variant="headingMd" fontWeight="semibold">
          METADATA
        </Text>
        {setOpen && (
          <Button onClick={() => setOpen(false)} kind="tertiary">
            <Icon source={Icons.cross} size={24} color="default" />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-5 align-baseline">
        {filteredMetadataArray.map((item: any, index: any) => (
          <div
            className="flex items-center gap-2 border-b-2 border-solid border-baseGraySlateSolid6 pb-2"
            key={index}
          >
            <Text className="text-base min-w-[120px] basis-1/4 font-medium">
              {toTitleCase(item.metadataItem.label)}:
            </Text>
            <Text className="text-base">{item.value}</Text>
          </div>
        ))}
        <div className="flex items-baseline gap-2 border-b-2 border-solid border-baseGraySlateSolid6  pb-2">
          <Text className="text-base min-w-[120px] basis-1/4 font-medium">
            Formats:
          </Text>
          <div className="flex flex-wrap gap-2">
            {data?.formats.map((item: any, index: any) => (
              <Text  key={index}>
                {item}
              </Text>
            ))}
          </div>
        </div>
        <div className="flex items-baseline gap-2 border-b-2 border-solid border-baseGraySlateSolid6  pb-2">
          <Text className="text-base min-w-[120px] basis-1/4 font-medium">
            Category:
          </Text>
          <div className="flex flex-wrap gap-2">
            {data?.categories.map((item: any, index: any) => (
              <Text className=" underline" key={index}>
                {item.name}
              </Text>
            ))}
          </div>
        </div>

        <div className="flex items-baseline gap-2  pb-2">
          <Text className="text-base min-w-[120px] basis-1/4 font-medium">
            Tags:
          </Text>
          <div className="flex flex-wrap gap-2">
            {data?.tags.map((item: any, index: any) => (
              <Text className=" underline" key={index}>
                {item.value}
              </Text>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataComponent;
