import React from 'react';
import { Tag, Text } from 'opub-ui';

interface PrimaryDataProps {
  data: any;
}

const PrimaryData: React.FC<PrimaryDataProps> = ({ data }) => {
  return (
    <>
      <div>
        <Text variant="headingLg">{data.datasetTitle}</Text>
      </div>
      <div>
        <Text variant="bodyMd">{data.description}</Text>
      </div>
      <div className="flex flex-wrap items-center">
        <Text fontWeight="bold">Categories&nbsp;:</Text>
        <Text>&nbsp;{data.metadata.category}</Text>
      </div>
      <div className="flex flex-wrap items-center">
        <Text fontWeight="bold">Tags&nbsp;:&nbsp;</Text>
        <div className="flex gap-2">
          {data.metadata.tags.map((item: any, index: any) => (
            <Tag key={index}>{item.title}</Tag>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center">
        <Text fontWeight="bold">Formats&nbsp;:&nbsp;</Text>
        {/* <Text>&nbsp;Monthly</Text> */}
        <div className="flex gap-2">
          {data.metadata.formats.map((item: any, index: any) => (
            <Tag key={index}>{item.type}</Tag>
          ))}
        </div>
      </div>
    </>
  );
};

export default PrimaryData;
