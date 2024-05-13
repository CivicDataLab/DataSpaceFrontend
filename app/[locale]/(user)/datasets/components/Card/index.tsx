import React from 'react';
import Link from 'next/link';
import { Tag, Text } from 'opub-ui';

import CustomTags from '@/components/CustomTags';

interface Dataset {
  datasetTitle: string;
  description: string;
  id: string;
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
      <div className="border-b-2 border-solid border-baseGraySlateSolid4 p-6 ">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="">
            <Link href={`/datasets/${id}`}>
              <Text variant="headingMd">{datasetTitle}</Text>
            </Link>
          </div>
          <div className="">
            <Text variant="bodySm">{description}</Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Text fontWeight="bold">Tags:</Text>
            <div className="flex gap-2">
              {metadata.tags.map((item, index) => (
                <Tag key={index}>{item.title}</Tag>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center">
            <Text fontWeight="bold">Categories&nbsp;:</Text>
            <Text>&nbsp;{metadata.category}</Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Text fontWeight="bold">Formats:</Text>
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
                <CustomTags
                  key={index}
                  type={item.type}
                  iconOnly={true}
                  size={20}
                  background={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Cards;
