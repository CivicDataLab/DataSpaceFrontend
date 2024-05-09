import React from 'react';
import Link from 'next/link';
import { Tag, Text } from 'opub-ui';

import CustomTags from '@/components/CustomTags';

interface Dataset {
  _source: {
    dataset_title: string;
    dataset_description: string;
    dataset_access_models: Array<[]>;
    sector: Array<[]>;
    format: Array<[]>;
  };
  _id: number;
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
  const {
    dataset_title,
    dataset_description,
    dataset_access_models,
    sector,
    format,
  } = data?._source || {};

  const { _id } = data;

  return (
    <>
      <div className="border-b-2 border-solid border-baseGraySlateSolid4 p-6 ">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="">
            <Link href={`/datasets/${_id}`}>
              <Text variant="headingMd">{dataset_title}</Text>
            </Link>
          </div>
          <div className="description-container line-clamp-4">
            <Text variant="bodySm">{dataset_description}</Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Text fontWeight="bold">Tags:</Text>
            <div className="flex gap-2">
              {/* {tags.map((item, index) => (
                <Tag key={index}>{item.title}</Tag>
              ))} */}
              <Tag>Most Viewed</Tag>
              <Tag>HVD</Tag>
            </div>
          </div>
          <div className="flex flex-wrap items-center">
            <Text fontWeight="bold">Categories&nbsp;:</Text>
            <Text>&nbsp;{sector}</Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Text fontWeight="bold">Formats:</Text>
            <div className="flex gap-2">
              {format.map((item, index) => (
                <Tag key={index}>{item}</Tag>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center">
            <Text fontWeight="bold">Access Models&nbsp;:</Text>
            <Text>&nbsp;{dataset_access_models.length} in total</Text>&nbsp;
            <div className="flex gap-2">
              {dataset_access_models.map((item: any, index) => (
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
