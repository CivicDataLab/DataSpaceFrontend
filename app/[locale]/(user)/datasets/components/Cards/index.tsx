import React from 'react';
import Link from 'next/link';
import { Tag, Text } from 'opub-ui';

interface Dataset {
  datasetTitle: string;
  description: string;
  id: number;
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

const Cards = ({ data }: { data: Dataset }) => {
  const { datasetTitle, description, metadata, id } = data;
  return (
    <>
      <div className="my-7 bg-actionSecondaryDisabled p-7">
        <div className="flex flex-wrap gap-8 lg:gap-8">
          <div className="lg:w-2/4">
            <Link href={`/datasets/${id}`}>
              <Text variant="headingMd">{datasetTitle}</Text>
            </Link>
          </div>
          <div className="lg:w-2/5">
            <Text variant="bodySm">{description}</Text>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap  gap-4 lg:gap-8">
          <div className="flex flex-col gap-3.5 md:w-1/2 lg:w-1/2">
            <div className="flex flex-wrap items-center">
              <Text fontWeight="bold">Frequency of Update&nbsp;:</Text>
              <Text>&nbsp;{metadata.update}</Text>
            </div>
            <div className="flex flex-wrap items-center">
              <Text fontWeight="bold">Categories&nbsp;:</Text>
              <Text>&nbsp;{metadata.category}</Text>
            </div>
            <div className="flex flex-wrap items-center">
              <Text fontWeight="bold">Tags&nbsp;:&nbsp;</Text>
              <div className="flex gap-2">
                {metadata.tags.map((item, index) => (
                  <Tag key={index}>{item.title}</Tag>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3.5 md:w-1/3 lg:w-1/3">
            <div className="flex flex-wrap items-center">
              <Text fontWeight="bold">Formats&nbsp;:&nbsp;</Text>
              {/* <Text>&nbsp;Monthly</Text> */}
              <div className="flex gap-2">
                {metadata.formats.map((item, index) => (
                  <Tag key={index}>{item.type}</Tag>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center">
              <Text fontWeight="bold">Access Models&nbsp;:</Text>
              <Text>&nbsp;{metadata.accessModelsCount} in total</Text>&nbsp;
              <div className="flex gap-2">
                {metadata.accessModels.map((item, index) => (
                  <Tag key={index}>{item.type}</Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Cards;
