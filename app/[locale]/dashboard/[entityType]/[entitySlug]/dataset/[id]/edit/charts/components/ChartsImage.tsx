import React, { useState } from 'react';
import { graphql } from '@/gql';
import {
  Button,
  Divider,
  DropZone,
  Icon,
  Sheet,
  Text,
  TextField,
} from 'opub-ui';

import { Icons } from '@/components/icons';

interface ImageProps {
  setType: any;
  setImageId: any;
  imageId: any;
}

const getResourceChartImageDetails: any = graphql(`
  query resourceChartImage($filters: ResourceChartImageFilter) {
    resourceChartImages(filters: $filters) {
      id
      name
      description
      image {
        name
        path
      }
    }
  }
`);

const ChartsImage: React.FC<ImageProps> = ({
  setType,
  setImageId,
  imageId,
}) => {
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
        <div className="mt-8 flex w-full  gap-8">
          <div className="flex w-4/5 flex-col gap-8">
            <TextField
              // onChange={(e) => handleChange('name', e)}
              label="Chart Name"
              name="name"
              required
              helpText="To know about best practices for naming Visualizations go to our User Guide"
              // onBlur={() => handleSave(chartData)}
            />
            <TextField
              // onChange={(e) => handleChange('description', e)}
              label="Description"
              name="description"
              multiline={4}
              // onBlur={() => handleSave(chartData)}
            />
          </div>
          <DropZone
            name={'drop'}
            label="File associated with resource"
            onDrop={(e) => console.log(e)}
          >
            <DropZone.FileUpload actionHint="Accepts .gif, .jpg, and .png" />
          </DropZone>
        </div>
      </div>
    </>
  );
};

export default ChartsImage;
