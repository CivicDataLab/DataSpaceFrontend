import Image from 'next/image';
import { Button, Divider, Icon, Text } from 'opub-ui';
import React, { useState } from 'react';

import { Icons } from '@/components/icons';

interface MetadataProps {
  data: any;
  setOpen?: (isOpen: boolean) => void;
}

const MetadataComponent: React.FC<MetadataProps> = ({ data, setOpen }) => {

  const Metadata = (
    data.metadata as Array<{ metadataItem: { label: string }; value: string }>
  )
    .filter((item) =>
      ['Geography', 'Update Frequency', 'License'].includes(
        item.metadataItem.label
      )
    )
    .map((item) => ({
      label:
        item.metadataItem.label === 'Geography'
          ? 'Location'
          : item.metadataItem.label,
      value: item.value,
    }));
  const [isexpanded, setIsexpanded] = useState(false);
  const toggleDescription = () => setIsexpanded(!isexpanded);
  return (
    <div className="flex flex-col gap-10">
      <div className=" flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Text
            variant="headingLg"
            fontWeight="semibold"
            className=" text-primaryBlue"
          >
            ABOUT THE DATASET{' '}
          </Text>
          <Text variant="bodyLg">METADATA</Text>
        </div>
        <div className="flex items-center justify-between">
          {setOpen && (
            <Button onClick={() => setOpen(false)} kind="tertiary">
              <Icon source={Icons.cross} size={24} color="default" />
            </Button>
          )}
        </div>
      </div>
      <Divider />
      <div className=" flex flex-col gap-8">
        <div className=" rounded-2 border-1 border-solid border-greyExtralight p-2 hidden lg:block">
          {data?.organization?.logo?.url ? (
            <Image
              height={140}
              width={100}
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.organization?.logo?.url}`}
              alt={`${data.organization?.name} logo`}
              className="w-full object-contain"
            />
          ) : (
            <Image
              height={140}
              width={100}
              src={'/fallback.svg'}
              alt={'fallback logo'}
              className="fill-current w-full object-contain"
            />
          )}
        </div>
        <div className="flex items-center gap-2 ">
          <Text className="min-w-[120px]  basis-1/4 uppercase" variant="bodyMd">
            Organization
          </Text>
          <Text
            className="max-w-xs truncate "
            variant="bodyLg"
            fontWeight="medium"
          >
            {data.organization.name}
          </Text>
        </div>
        <div className="flex items-center gap-2 ">
          <Text className="min-w-[120px]  basis-1/4 uppercase" variant="bodyMd">
            Sector
          </Text>
          <Text
            className="max-w-xs truncate "
            variant="bodyLg"
            fontWeight="medium"
          >
            {data.categories[0].name}
          </Text>
        </div>
        {Metadata.map((item, index) => (
          <div className="flex items-center gap-2 " key={index}>
            <Text
              className="min-w-[120px]  basis-1/4 uppercase"
              variant="bodyMd"
            >
              {item.label}
            </Text>
            <Text className="max-w-xs " variant="bodyLg" fontWeight="medium">
              {item.value}
            </Text>
          </div>
        ))}
        <div className="flex flex-col gap-4">
          <Text variant="bodyMd">Description</Text>
          <Text variant="bodyMd">
            {data.description.length > 260 && !isexpanded
              ? `${data.description.slice(0, 260)}...`
              : data.description}
            {data.description.length > 260 && (
              <Button
                kind="tertiary"
                size="slim"
                onClick={toggleDescription}
                className="text-blue-600 w-fit"
              >
                {isexpanded ? 'See Less' : 'See More'}
              </Button>
            )}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default MetadataComponent;
