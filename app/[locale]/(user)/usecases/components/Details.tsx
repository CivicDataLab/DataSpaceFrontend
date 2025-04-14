import React from 'react';
import Image from 'next/image';
import { Tag, Text } from 'opub-ui';

const PrimaryDetails = ({ data }: { data: any }) => {


  return (
    <div>
      <div>
        <Text variant="heading2xl">{data.useCase.title}</Text>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {data.useCase.tags.map((item: any, index: number) => (
          <div key={index}>
            <Tag>{item.value}</Tag>
          </div>
        ))}
      </div>
      <div className=" mt-10">
        <Image
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.useCase.logo?.path.replace('/code/files/', '')}`}
          alt={data.useCase.title}
          width={100}
          height={100}
          className="h-full w-full"
        />
      </div>
      <div className="container">
        <div className=" mt-14">
          <Text variant="heading2xl">GEOGRAPHIES</Text>
          <div className="mt-4">
            <Tag>
              {
                data.useCase.metadata?.find(
                  (meta: any) => meta.metadataItem?.label === 'Geography'
                )?.value
              }
            </Tag>
          </div>
        </div>
        <div className=" mt-14">
          <Text variant="heading2xl">Summary</Text>
          <div className="mt-4">
          <Text variant="headingLg" fontWeight='regular'>{data.useCase.summary}</Text>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimaryDetails;
