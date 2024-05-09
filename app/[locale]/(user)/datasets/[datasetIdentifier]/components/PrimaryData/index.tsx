import React from 'react';
import { Tag, Text } from 'opub-ui';

interface PrimaryDataProps {
  data: any;
}

const PrimaryData: React.FC<PrimaryDataProps> = ({ data }) => {
  return (
    <>
      <div>
        <Text variant="headingLg">{data?.title}</Text>
      </div>
      <div className="flex flex-wrap items-center">
        {/* <Text fontWeight="bold">Tags&nbsp;:&nbsp;</Text> */}
        <div className="flex gap-2">
          {data?.tags.map((item: any, index: any) => (
            <Tag key={index}>{item}</Tag>
          ))}
        </div>
      </div>
      <div>
        <Text variant="bodyMd">{data?.description}</Text>
      </div>
    </>
  );
};

export default PrimaryData;
