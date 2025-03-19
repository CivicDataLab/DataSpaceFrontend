import React from 'react';
import Link from 'next/link';
import { Button, Icon, Text } from 'opub-ui';
import { toTitleCase } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface MetadataProps {
  data: any;
  setOpen?: (isOpen: boolean) => void;
}

const MetadataComponent: React.FC<MetadataProps> = ({ data, setOpen }) => {
  const filteredMetadataArray = data?.metadata.filter(
    (item: any) =>
      item.metadataItem.label !== 'Source Website' &&
      item.metadataItem.label !== 'Github Repo Link' &&
      item.metadataItem.label !== 'Source' &&
      item.value.trim() !== '' // Ensure the value is not empty
  );

  return (
    <div className="rounded-md shadow-md flex flex-col gap-6 bg-surfaceDefault px-6 py-4 lg:px-8 lg:py-6">
      <div className="flex items-center justify-between">
        <Text variant="headingMd" fontWeight="semibold">
          Metadata
        </Text>
        {setOpen && (
          <Button onClick={() => setOpen(false)} kind="tertiary">
            <Icon source={Icons.cross} size={24} color="default" />
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-5 align-baseline">
        {filteredMetadataArray?.map((item: any, index: any) => (
          <div
            className="flex items-center gap-2 border-b-2 border-solid border-baseGraySlateSolid6 pb-2"
            key={index}
          >
            <Text className="text-base min-w-[120px] basis-1/4 font-medium">
              {toTitleCase(item.metadataItem.label)}:
            </Text>
            <Text className="text-base truncate max-w-xs " title={item.value}>
              {item.value}
            </Text>
          </div>
        ))}
        {data?.formats.length > 0 && (
          <div className="flex items-baseline gap-2 border-b-2 border-solid border-baseGraySlateSolid6 pb-2">
            <Text className="text-base min-w-[120px] basis-1/4 font-medium">
              Formats:
            </Text>
            <div className="flex flex-wrap gap-2">
              {data?.formats.map((item: any, index: any) => (
                <Text key={index}>{item}</Text>
              ))}
            </div>
          </div>
        )}
        {data?.categories.length > 0 && (
          <div className="flex items-baseline gap-2 border-b-2 border-solid border-baseGraySlateSolid6 pb-2">
            <Text className="text-base min-w-[120px] basis-1/4 font-medium">
              Category:
            </Text>
            <div className="flex flex-wrap gap-2">
              {data?.categories.map((item: any, index: any) => (
                <Link
                  href={`/datasets?categories=${item.name}`}
                  target="_blank"
                  className="flex justify-center"
                  key={index}
                >
                  <Text className="underline">{item.name}</Text>
                </Link>
              ))}
            </div>
          </div>
        )}
        {data?.tags.length > 0 && (
          <div className="flex items-baseline gap-2 pb-2">
            <Text className="text-base min-w-[120px] basis-1/4 font-medium">
              Tags:
            </Text>
            <div className="flex flex-wrap gap-2">
              {data?.tags.map((item: any, index: any) => (
                <Link
                  href={`/datasets?tags=${item.value}`}
                  target="_blank"
                  className="flex justify-center"
                  key={index}
                >
                  <Text className="underline">{item.value}</Text>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataComponent;
