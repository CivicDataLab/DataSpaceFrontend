import React from 'react';
import { Box, Tag, Text } from 'opub-ui';
import { twMerge } from 'tailwind-merge';

import styles from './cars-listing.module.scss';

interface Dataset {
  datasetTitle: string;
  description: string;
  metadata: Metadata;
}

interface Metadata {
  update: string;
  category: string;
  tags: { title: string }[];
  formats: { type: string }[];
  accessModels: { type: string }[];
  accessModelsCount: string;
}

const CardsListing = ({ data }: { data: Dataset }) => {
  const { datasetTitle, description, metadata } = data;
  return (
    <>
      <div className={twMerge(styles.cards, 'my-7 p-7')}>
        <div className="flex flex-wrap gap-8 lg:gap-8">
          <div className="lg:w-2/4">
            <Text variant="headingMd">{datasetTitle}</Text>
          </div>
          <div className="lg:w-2/5">
            <Text variant="bodySm">{description}</Text>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap  gap-4 lg:gap-8">
          <div className="flex flex-col gap-3.5 md:w-1/2 lg:w-1/2">
            <Box flex alignItems="center" wrap>
              <Text fontWeight="bold">Frequency of Update&nbsp;:</Text>
              <Text>&nbsp;{metadata.update}</Text>
            </Box>
            <Box flex alignItems="center" wrap>
              <Text fontWeight="bold">Categories&nbsp;:</Text>
              <Text>&nbsp;{metadata.category}</Text>
            </Box>
            <Box flex alignItems="center" wrap>
              <Text fontWeight="bold">Tags&nbsp;:&nbsp;</Text>
              <Box flex gap={'2'}>
                {metadata.tags.map((item, index) => (
                  <Tag key={index}>{item.title}</Tag>
                ))}
              </Box>
            </Box>
          </div>
          <div className="flex flex-col gap-3.5 md:w-1/3 lg:w-1/3">
            <Box flex alignItems="center" wrap>
              <Text fontWeight="bold">Formats&nbsp;:&nbsp;</Text>
              {/* <Text>&nbsp;Monthly</Text> */}
              <Box flex gap={'2'}>
                {metadata.formats.map((item, index) => (
                  <Tag key={index}>{item.type}</Tag>
                ))}
              </Box>
            </Box>
            <Box flex alignItems="center" wrap>
              <Text fontWeight="bold">Access Models&nbsp;:</Text>
              <Text>&nbsp;{metadata.accessModelsCount} in total</Text>&nbsp;
              <Box flex gap={'2'}>
                {metadata.accessModels.map((item, index) => (
                  <Tag key={index}>{item.type}</Tag>
                ))}
              </Box>
            </Box>
          </div>
        </div>
      </div>
    </>
  );
};
export default CardsListing;
