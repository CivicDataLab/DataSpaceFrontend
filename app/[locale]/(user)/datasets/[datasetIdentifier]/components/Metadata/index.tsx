import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Divider, Icon, Text, Tooltip } from 'opub-ui';

import { formatDate, getWebsiteTitle } from '@/lib/utils';
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

  const [sourceTitle, setSourceTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const urlItem = data.metadata.find(
          (item: any) => item.metadataItem?.dataType === 'URL'
        );

        if (urlItem && urlItem.value) {
          const title = await getWebsiteTitle(urlItem.value);
          setSourceTitle(title);
        }
      } catch (error) {
        console.error('Error fetching website title:', error);
      }
    };

    fetchTitle();
  }, [data.metadata]);

  const image = data.isIndividualDataset
    ? data?.user?.profilePicture
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.user.profilePicture.url}`
      : '/profile.png'
    : data?.organization?.logo
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.organization.logo.url}`
      : '/org.png';

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
          <Image
            height={140}
            width={100}
            src={image}
            alt={
              data.isIndividualDataset ? 'Publisher logo' : 'Organization logo'
            }
            className="w-full object-contain"
          />
        </div>
        <div className="flex items-center gap-2 ">
          <Text className="min-w-[120px]  basis-1/4 uppercase" variant="bodyMd">
            {data.isIndividualDataset ? 'Publisher' : 'Organization'}
          </Text>
          <Tooltip
            content={
              data.isIndividualDataset
                ? data.user.fullName
                : data.organization.name
            }
          >
            <Text
              className="line-clamp-2 "
              variant="bodyLg"
              fontWeight="medium"
            >
              {data.isIndividualDataset
                ? data.user.fullName
                : data.organization.name}
            </Text>
          </Tooltip>
        </div>
        <div className="flex gap-2 ">
          <Text className="min-w-[120px]  basis-1/4 uppercase" variant="bodyMd">
            Sector
          </Text>
          <div className="flex flex-wrap gap-2">
            {data.sectors.length > 0 ? (
              data.sectors.map((sector: any, index: number) => (
                <Tooltip content={sector.name} key={index}>
                  <Image
                    key={index}
                    src={`/Sectors/${sector.name}.svg`}
                    alt={sector.name || ''}
                    width={52}
                    height={52}
                    className="border-1 border-solid border-greyExtralight p-1"
                  />
                </Tooltip>
              ))
            ) : (
              <span>N/A</span>
            )}
          </div>
        </div>
        {Metadata.map((item: any, index: any) => (
          <div className="flex items-start gap-2 " key={index}>
            <Text
              className="min-w-[120px]  basis-1/4 uppercase"
              variant="bodyMd"
            >
              {item.label}
            </Text>
            {item.type === 'URL' ? (
              <Link href={item.value} target="_blank">
                <Text className="underline" color="highlight" variant="bodyLg">
                  {sourceTitle?.trim() ? sourceTitle : 'Visit Website'}
                </Text>
              </Link>
            ) : item.type === 'DATE' ? (
              <Text className="max-w-xs " variant="bodyLg" fontWeight="medium">
                {formatDate(item.value)}
              </Text>
            ) : (
              <Text className="max-w-xs " variant="bodyLg" fontWeight="medium">
                {item.value}
              </Text>
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
        {data.downloadCount > 0 && (
          <div className="flex items-center gap-2 ">
            <Text
              className="min-w-[120px]  basis-1/4 uppercase"
              variant="bodyMd"
            >
              Downloads
            </Text>
            <Text className="" variant="bodyLg" fontWeight="medium">
              {data.downloadCount}
            </Text>
          </div>
        )}
        <div className="flex flex-col gap-4">
          <Text variant="bodyMd" className="uppercase">
            Description
          </Text>
          <Text variant="bodyLg">
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
