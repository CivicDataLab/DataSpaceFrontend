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
      <div className="flex justify-between">
        <div>
          <Text className="underline" variant="headingMd">
            About the Dataset
          </Text>
          <br className="sm:hidden md:hidden lg:block" />
          <Text className="sm:pl-1 md:pl-1 lg:pl-0">(METADATA)</Text>
        </div>
        {setOpen && (
          <div className="align-center mr-2">
            <Button onClick={(e) => setOpen(false)} kind="tertiary">
              <Icon source={Icons.cross} size={24} color="default" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-wrap gap-3 pt-3">
        {/* <div className="sm:mt-1 sm:grid sm:grid-cols-1 sm:gap-2 md:mt-1 md:grid md:grid-cols-2 md:gap-2 lg:flex lg:flex-col lg:flex-wrap lg:gap-3 lg:pt-3"> */}
        <div>
          <Text>Source&nbsp;:</Text>
          <Text>&nbsp;{metadata.source}</Text>
        </div>
        <div>
          <Text>Location&nbsp;:</Text>
          <Text>&nbsp;{metadata.location}</Text>
        </div>
        <div>
          <Text>Update&nbsp;:</Text>
          <Text>&nbsp;{metadata.update}</Text>
        </div>
        <div>
          <Text>Licence&nbsp;:</Text>
          <Text>&nbsp;{metadata.licence}</Text>
        </div>
        <div>
          <Text>Policy&nbsp;:</Text>
          <Text>&nbsp;{metadata.policy}</Text>
        </div>
      </div>
    </>
  );
};

export default MetadataComponent;
