import React from 'react';
import { Button, Icon, Text } from 'opub-ui';

import { formatDate, toTitleCase } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface MetadataProps {
  data: any;
  setOpen?: (isOpen: boolean) => void;
}

const MetadataComponent: React.FC<MetadataProps> = ({ data, setOpen }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="w-full border-y-2 border-solid border-baseGraySlateSolid4 py-6">
          <Text variant="headingLg" className="pb-2">
            About the Dataset
          </Text>
          <br />
          <Text>METADATA</Text>
        </div>
        {setOpen && (
          <div className="align-center mr-2">
            <Button onClick={(e) => setOpen(false)} kind="tertiary">
              <Icon source={Icons.cross} size={24} color="default" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-wrap gap-5 pt-6">
        {data?.metadata?.map((item: any, index: any) => (
          <div className="flex gap-2" key={index}>
            <Text className="min-w-24 basis-1/4">
              {toTitleCase(item.metadataItem.label)}
            </Text>
            <Text> {item.value}</Text>
          </div>
        ))}
        <div className="flex gap-2">
          <Text className="min-w-24 basis-1/4">Created</Text>
          <Text>{formatDate(data?.created)}</Text>
        </div>
        <div className="flex gap-2">
          <Text className="min-w-24 basis-1/4">Modified</Text>
          <Text>{formatDate(data?.modified)}</Text>
        </div>
      </div>
    </>
  );
};

export default MetadataComponent;
