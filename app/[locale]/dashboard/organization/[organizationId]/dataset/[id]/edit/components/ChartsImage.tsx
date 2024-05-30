import React, { useState } from 'react';
import { Button, Divider, Icon, Sheet, Text } from 'opub-ui';

import { Icons } from '@/components/icons';

interface ImageProps {
  setType: any;
}

const ChartsImage: React.FC<ImageProps> = ({ setType }) => {
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
      </div>
    </>
  );
};

export default ChartsImage;
