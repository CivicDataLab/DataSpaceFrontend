import React from 'react';
import Image from 'next/image';
import { Button, Text } from 'opub-ui';

interface VisualizationProps {
  data: any;
}

const Visualization: React.FC<VisualizationProps> = ({ data }) => {
  console.log(data);

  return (
    <div className="">
      {data.map((item: any, index: any) => (
        <div
          className="my-4 flex flex-col gap-4 rounded-2 p-6 shadow-basicDeep"
          key={index}
        >
          <Text variant="headingMd">{item.title}</Text>
          <Text>{item.description}</Text>
          <Button className="h-fit w-fit" kind="secondary">
            Download
          </Button>
          <div className="flex flex-wrap gap-8">
            {item.images.map((image: string, index: number) => (
              <Image
                key={index}
                src={image}
                width={280}
                className="flex-shrink-0"
                height={280}
                alt="visualization"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Visualization;
