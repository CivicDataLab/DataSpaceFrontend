import React from 'react';
import { Text } from 'opub-ui';

interface ResourceProps {
  data: any;
}

const Resources: React.FC<ResourceProps> = ({ data }) => {
  return (
    <>
      {data.map((item: any, index: any) => (
        <div
          key={index}
          className="my-4 p-4"
          style={{ backgroundColor: 'var(--base-gray-slate-solid-3)' }}
        >
          <div className="flex flex-col gap-1">
            <Text variant="headingMd">{item.title}</Text>
            <Text>{item.description}</Text>
          </div>
        </div>
      ))}
    </>
  );
};

export default Resources;
