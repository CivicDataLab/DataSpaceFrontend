import React from 'react';
import { Button, Icon, Text } from 'opub-ui';

import { Icons } from '@/components/icons';

interface Metadata {
  metadata: any;
}

interface MetadataProps {
  data: Metadata;
  setOpen?: (isOpen: boolean) => void;
}

const MetadataComponent: React.FC<MetadataProps> = ({ data, setOpen }) => {
  const { metadata } = data;

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
        {/* <div className="sm:mt-1 sm:grid sm:grid-cols-1 sm:gap-2 md:mt-1 md:grid md:grid-cols-2 md:gap-2 lg:flex lg:flex-col lg:flex-wrap lg:gap-3 lg:pt-3"> */}
        <div className="flex gap-2">
          <Text className="min-w-24 basis-1/4">Source </Text>
          <Text> {metadata.source}</Text>
        </div>
        <div className="flex gap-2">
          <Text className="min-w-24 basis-1/4">Location </Text>
          <Text> {metadata.location}</Text>
        </div>
        <div className="flex gap-2">
          <Text className="min-w-24 basis-1/4">Update </Text>
          <Text>{metadata.update}</Text>
        </div>
        <div className="flex gap-2">
          <Text className="min-w-24 basis-1/4">Licence </Text>
          <Text>{metadata.licence}</Text>
        </div>
        <div className="flex gap-2">
          <Text className="min-w-24 basis-1/4">Policy </Text>
          <Text>{metadata.policy}</Text>
        </div>
        <div className="flex gap-2 ">
          <Text className="min-w-24 basis-1/4">Organization </Text>
          <Text>{metadata.organization}</Text>
        </div>
      </div>
    </>
  );
};

export default MetadataComponent;
