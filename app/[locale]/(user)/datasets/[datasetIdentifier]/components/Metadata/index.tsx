import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Divider, Icon, Text } from 'opub-ui';

import { Icons } from '@/components/icons';

interface MetadataProps {
  data: any;
  setOpen?: (isOpen: boolean) => void;
}

const MetadataComponent: React.FC<MetadataProps> = ({ data, setOpen }) => {
  const Metadata = data.metadata.map((item: any) => ({
    label: item.metadataItem.label,
    value: item.value,
    type: item.metadataItem.dataType,
  }));
  const [isexpanded, setIsexpanded] = useState(false);
  const toggleDescription = () => setIsexpanded(!isexpanded);

  const licenseOptions = [
    {
      label: 'Government Open Data License',
      value: 'GOVERNMENT_OPEN_DATA_LICENSE',
    },
    {
      label: 'CC BY 4.0 (Attribution)',
      value: 'CC_BY_4_0_ATTRIBUTION',
    },
    {
      label: 'CC BY-SA 4.0 (Attribution-ShareAlike)',
      value: 'CC_BY_SA_4_0_ATTRIBUTION_SHARE_ALIKE',
    },
    {
      label: 'Open Data Commons By Attribution',
      value: 'OPEN_DATA_COMMONS_BY_ATTRIBUTION',
    },
    {
      label: 'Open Database License',
      value: 'OPEN_DATABASE_LICENSE',
    },
  ];

  const getLicenseLabel = (value: string): string => {
    const option = licenseOptions.find((option) => option.value === value);
    return option ? option.label : value; // fallback to value if no match
  };

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
        <div className=" hidden rounded-2 border-1 border-solid border-greyExtralight p-2 lg:block">
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
            {data.sectors[0].name}
          </Text>
        </div>
        {Metadata.map((item: any, index: any) => (
          <div className="flex items-center gap-2 " key={index}>
            <Text
              className="min-w-[120px]  basis-1/4 uppercase"
              variant="bodyMd"
            >
              {item.label}
            </Text>
            {item.type !== 'URL' ? (
              <Text className="max-w-xs " variant="bodyLg" fontWeight="medium">
                {item.value}
              </Text>
            ) : (
              <Link href={item.value} target="_blank">
                <Text className="underline" color="highlight">
                  Source
                </Text>
              </Link>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 ">
          <Text className="min-w-[120px]  basis-1/4 uppercase" variant="bodyMd">
            License
          </Text>
          <Text className="" variant="bodyLg" fontWeight="medium">
            {getLicenseLabel(data.license)}
          </Text>
        </div>
        <div className="flex flex-col gap-4">
          <Text variant="bodyMd">Description</Text>
          <Text variant="bodyMd">
            {data.description?.length > 260 && !isexpanded
              ? `${data.description.slice(0, 260)}...`
              : data.description}
            {data.description?.length > 260 && (
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
