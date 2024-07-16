import React from 'react';
import { Tag, Text } from 'opub-ui';

import { formatDate } from '@/lib/utils';

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
            <Tag key={index}>{item.value}</Tag>
          ))}
        </div>
      </div>
      <div>
        <Text variant="bodyMd">{data?.description}</Text>
      </div>
      <div className="flex flex-wrap gap-6 pt-6">
        <div className="flex gap-2">
          <Text className=" font-bold">Last Updated:</Text>
          <Text>{formatDate(data?.modified)}</Text>
        </div>
        <div className="flex gap-2">
          <Text className=" font-bold">Total Downloads:</Text>
          <Text>120</Text>
        </div>
      </div>
    </>
  );
};

export default PrimaryData;
